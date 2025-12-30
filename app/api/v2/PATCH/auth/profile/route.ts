import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb/dbConnect";
import User from "@/models/User";
import { auth } from "@/lib/auth";
import { authenticateAPI } from "@/lib/api-auth";
import { z } from "zod";
import { logActivity } from "@/lib/logger";

const updateProfileSchema = z.object({
    name: z.string().min(2).optional(),
    username: z.string().min(3).optional(),
    bio: z.string().max(500).optional(),
    title: z.string().optional(),
    phoneNumber: z.string().optional(),
    location: z.string().optional(),
    links: z.array(z.object({
        id: z.string(),
        platform: z.string(),
        url: z.string().url()
    })).optional()
});

export async function PATCH(req: NextRequest) {
    try {
        await dbConnect();

        const session = await auth();
        let userId = session?.user?.id;

        if (!session) {
            const apiAuth = await authenticateAPI();
            if (apiAuth) {
                userId = apiAuth.userId;
            }
        }

        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const validation = updateProfileSchema.safeParse(body);

        if (!validation.success) {
            return NextResponse.json({ error: "Validation failed", details: validation.error.format() }, { status: 400 });
        }

        const data = validation.data;
        const user = await User.findById(userId);
        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        const oldState: any = {};
        Object.keys(data).forEach(key => {
            oldState[key] = (user as any)[key];
        });

        if (data.username) {
            const existing = await User.findOne({ username: data.username, _id: { $ne: userId } });
            if (existing) {
                return NextResponse.json({ error: "Username already taken" }, { status: 409 });
            }
        }

        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { $set: data },
            { new: true, runValidators: true }
        ).select("-password -apiKey");

        if (!updatedUser) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        await logActivity({
            eventType: "user.profile.update",
            action: "UPDATE",
            status: "SUCCESS",
            actor: { userId: updatedUser._id.toString(), username: updatedUser.email, role: updatedUser.role },
            target: { type: "USER", id: updatedUser._id.toString() },
            details: {
                updatedFields: Object.keys(data),
                changes: {
                    from: oldState,
                    to: data
                }
            },
            severity: "INFO"
        });

        return NextResponse.json({ user: updatedUser });

    } catch (error: any) {
        console.error("Profile update error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
