import { NextRequest, NextResponse } from "next/server";
import { authenticateAPI } from "@/lib/api-auth";
import dbConnect from "@/lib/mongodb/dbConnect";
import User from "@/models/User";
import { logActivity } from "@/lib/logger";

export async function PATCH(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const auth = await authenticateAPI();
        if (!auth) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Only ADMIN or STAFF can modify other users
        if (auth.role !== 'ADMIN' && auth.role !== 'STAFF') {
            return NextResponse.json({ error: "Forbidden: Admin or Staff access required" }, { status: 403 });
        }

        const { id } = await params;
        const updates = await req.json();

        // Security: Prevent certain fields from being updated via this endpoint
        const restrictedFields = ['password', 'apiKey', 'email', 'secondaryEmails'];
        restrictedFields.forEach(field => delete updates[field]);

        // If not ADMIN, prevent role elevation
        if (auth.role !== 'ADMIN' && updates.role) {
            delete updates.role;
        }

        await dbConnect();
        const user = await User.findById(id);
        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        const oldState: any = {};
        Object.keys(updates).forEach(key => {
            oldState[key] = (user as any)[key];
        });

        const updatedUser = await User.findByIdAndUpdate(
            id,
            { $set: updates },
            { new: true, runValidators: true }
        ).select("-password -apiKey -refreshTokens");

        if (!updatedUser) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        await logActivity({
            eventType: "admin.user.update",
            action: "UPDATE",
            status: "SUCCESS",
            actor: { userId: auth.userId, role: auth.role },
            target: { type: "USER", id: updatedUser._id.toString() },
            details: {
                updatedFields: Object.keys(updates),
                changes: {
                    from: oldState,
                    to: updates
                }
            },
            severity: "INFO"
        });

        return NextResponse.json({
            message: "User updated successfully",
            user: updatedUser
        });
    } catch (error: any) {
        console.error("Error updating user:", error);
        return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
    }
}
