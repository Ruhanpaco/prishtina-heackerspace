import { NextRequest, NextResponse } from "next/server";
import { authenticateAPI } from "@/lib/api-auth";
import dbConnect from "@/lib/mongodb/dbConnect";
import User from "@/models/User";

export async function GET(req: NextRequest) {
    try {
        await dbConnect();
        const auth = await authenticateAPI();

        if (!auth || (auth.role !== 'ADMIN' && auth.role !== 'STAFF')) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
        }

        // Real-time aggregates
        const totalUsers = await User.countDocuments();
        const verifiedUsers = await User.countDocuments({ identificationStatus: 'VERIFIED' });
        const pendingVerify = await User.countDocuments({ identificationStatus: 'PENDING' });
        const currentPresence = await User.countDocuments({ isCheckedIn: true });

        const activeMembers = await User.countDocuments({ membershipStatus: 'ACTIVE' });
        const suspendedUsers = await User.countDocuments({ membershipStatus: 'SUSPENDED' });

        return NextResponse.json({
            stats: {
                totalUsers,
                verifiedUsers,
                pendingVerify,
                currentPresence,
                activeMembers,
                suspendedUsers,
                verifyRate: totalUsers > 0 ? (verifiedUsers / totalUsers) * 100 : 0
            }
        });

    } catch (error) {
        console.error("Admin Stats GET Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
