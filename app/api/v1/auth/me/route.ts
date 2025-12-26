import { NextResponse } from 'next/server';
import { auth } from "@/lib/auth";
import { authenticateAPI } from "@/lib/api-auth";
import dbConnect from "@/lib/mongodb/dbConnect";
import User from "@/models/User";

export async function GET(req: Request) {
    try {
        await dbConnect();

        let user: any = null;

        // 1. Try NextAuth Session (Cookie)
        const session = await auth();
        if (session?.user?.email) {
            const dbUser = await User.findOne({ email: session.user.email }).select("-password");
            if (dbUser) user = dbUser;
        }

        // 2. Try JWT (Bearer Token) if no session user found
        if (!user) {
            const apiUser = await authenticateAPI();
            if (apiUser && apiUser.userId) {
                const dbUser = await User.findById(apiUser.userId).select("-password");
                if (dbUser) user = dbUser;
            }
        }

        // 3. Unauthorized if still no user
        if (!user) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        // 4. Return User Data
        return NextResponse.json({
            user: {
                id: user._id,
                uuid: user.uuid,
                name: user.name,
                username: user.username,
                email: user.email,
                role: user.role,
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
        console.error("Auth Me Error:", error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}
