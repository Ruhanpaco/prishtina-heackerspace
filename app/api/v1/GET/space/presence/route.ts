import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb/dbConnect';
import User from '@/models/User';

/**
 * GET users currently inside the hackerspace
 */
export async function GET() {
    try {
        await dbConnect();

        const usersInside = await User.find({ isCheckedIn: true })
            .select('name image username lastCheckIn title')
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
