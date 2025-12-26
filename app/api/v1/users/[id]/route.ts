import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb/dbConnect";
import User from "@/models/User";
import { auth } from "@/lib/auth";
import { authenticateAPI } from "@/lib/api-auth";
import { z } from "zod";

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

export async function PATCH(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await dbConnect();

        // 1. Authenticate (Session or Token)
        const session = await auth();
        let requesterId = session?.user?.id;
        let requesterRole = session?.user?.role;

        if (!session) {
            const apiAuth = await authenticateAPI();
            if (apiAuth) {
                requesterId = apiAuth.userId;
                requesterRole = apiAuth.role;
            }
        }

        if (!requesterId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // 2. Validate Target User
        const { id: targetUserId } = await params;

        // Only allow self-update or Admin
        // Note: For now, assuming standard users can only specific fields. 
        // Admin could potentially update more, but we stick to profile fields here.
        if (requesterId !== targetUserId && requesterRole !== 'ADMIN') {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        // 3. Parse Body
        const body = await req.json();
        const validation = updateProfileSchema.safeParse(body);

        if (!validation.success) {
            return NextResponse.json(
                { error: "Validation failed", details: validation.error.format() },
                { status: 400 }
            );
        }

        const data = validation.data;

        // 4. Update User
        // Check username uniqueness if changing
        if (data.username) {
            const existing = await User.findOne({ username: data.username, _id: { $ne: targetUserId } });
            if (existing) {
                return NextResponse.json({ error: "Username already taken" }, { status: 409 });
            }
        }

        const updatedUser = await User.findByIdAndUpdate(
            targetUserId,
            {
                $set: {
                    ...(data.name && { name: data.name }),
                    ...(data.username && { username: data.username }),
                    ...(data.bio !== undefined && { bio: data.bio }),
                    ...(data.title !== undefined && { title: data.title }),
                    ...(data.phoneNumber !== undefined && { phoneNumber: data.phoneNumber }),
                    ...(data.location !== undefined && { location: data.location }),
                    ...(data.links && { links: data.links }),
                }
            },
            { new: true, runValidators: true }
        ).select("-password");

        if (!updatedUser) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        return NextResponse.json({ user: updatedUser });

    } catch (error: any) {
        console.error("Profile update error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await dbConnect();
        const { id } = await params;

        const user = await User.findById(id).select("-password");
        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        return NextResponse.json({ user });
    } catch (error) {
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
