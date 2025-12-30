import { NextResponse } from 'next/server';
import { authenticateAPI } from "@/lib/api-auth";
import dbConnect from '@/lib/mongodb/dbConnect';
import User from '@/models/User';

/**
 * GET users currently inside the hackerspace (V2)
 */
export async function GET() {
    try {
        // Optional: require auth for presence? User did earlier.
        const auth = await authenticateAPI();
        if (!auth) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        await dbConnect();

        const usersInside = await User.find({ isCheckedIn: true })
            .select('name image username lastCheckIn title bio')
            .sort({ lastCheckIn: -1 });

        return NextResponse.json({
            count: usersInside.length,
            users: usersInside
        }, { status: 200 });

    } catch (error) {
        console.error("Presence API Error:", error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}
