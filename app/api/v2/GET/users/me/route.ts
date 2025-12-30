import { NextResponse } from 'next/server';
import { auth } from "@/lib/auth";
import { authenticateAPI } from "@/lib/api-auth";
import dbConnect from "@/lib/mongodb/dbConnect";
import User from "@/models/User";

/**
 * GET current user's full profile (V2)
 * Restricted to the owner. Includes sensitive apiKey for programmatic access.
 */
export async function GET(req: Request) {
    try {
        await dbConnect();
        let user = null;

        // 1. Check NextAuth Session
        const session = await auth();
        if (session?.user?.id) {
            user = await User.findById(session.user.id).select("-password +apiKey");
        }

        // 2. Check API Key or JWT if no session
        if (!user) {
            const apiAuth = await authenticateAPI();
            if (apiAuth?.userId) {
                user = await User.findById(apiAuth.userId).select("-password -lastLoginIP -currentIP -rfidApiKey -rfidTag -rfidUid -refreshTokens +apiKey");
            }
        }

        if (!user) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        return NextResponse.json({
            user: {
                id: user._id,
                uuid: user.uuid,
                name: user.name,
                username: user.username,
                email: user.email,
                role: user.role,
                apiKey: user.apiKey,
                image: user.image,
                bio: user.bio,
                title: user.title,
                location: user.location,
                membershipStatus: user.membershipStatus,
                lastLogin: user.lastLogin,
                links: user.links,
                projects: user.projects,
                badges: user.badges
            }
        }, { status: 200 });

    } catch (error) {
        console.error("Auth Me V2 Error:", error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}
