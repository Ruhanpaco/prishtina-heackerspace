import { NextRequest, NextResponse } from "next/server";
import { authenticateAPI } from "@/lib/api-auth";
import dbConnect from "@/lib/mongodb/dbConnect";
import Payment from "@/models/Payment";
import { hasPermission, Permission } from "@/lib/rbac";

export async function GET(req: NextRequest) {
    try {
        await dbConnect();
        const auth = await authenticateAPI();

        if (!auth || !hasPermission(auth.role, Permission.PAYMENT_VERIFY)) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
        }

        const payments = await Payment.find({ status: 'PENDING' })
            .select('-proofOfPayment')
            .populate('userId', 'name email image')
            .sort({ createdAt: -1 });

        return NextResponse.json({ payments });

    } catch (error) {
        console.error("Admin Payments GET Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
