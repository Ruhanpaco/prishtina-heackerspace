import { NextRequest, NextResponse } from "next/server";
import { authenticateAPI } from "@/lib/api-auth";
import dbConnect from "@/lib/mongodb/dbConnect";
import Payment from "@/models/Payment";
import User from "@/models/User";
import { hasPermission, Permission } from "@/lib/rbac";
import { logActivity } from "@/lib/logger";

export async function PATCH(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await dbConnect();
        const auth = await authenticateAPI();

        if (!auth || !hasPermission(auth.role, Permission.PAYMENT_VERIFY)) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
        }

        const { id } = await params;
        const { status } = await req.json();

        if (!['COMPLETED', 'FAILED'].includes(status)) {
            return NextResponse.json({ error: "Invalid status" }, { status: 400 });
        }

        const payment = await Payment.findById(id);
        if (!payment) return NextResponse.json({ error: "Payment not found" }, { status: 404 });

        const oldStatus = payment.status;
        payment.status = status;
        payment.verifiedBy = auth.userId as any;
        payment.verifiedAt = new Date();
        await payment.save();

        if (status === 'COMPLETED') {
            const user = await User.findById(payment.userId);
            if (user) {
                user.membershipStatus = 'ACTIVE';
                user.membershipTier = payment.tier;
                const expiresAt = new Date();
                expiresAt.setDate(expiresAt.getDate() + 30);
                user.membershipExpiresAt = expiresAt;

                if (user.identificationStatus === 'VERIFIED') {
                    user.hasAccess = true;
                }
                await user.save();
            }
        }

        await logActivity({
            eventType: "admin.payment.verified",
            action: "UPDATE",
            status: "SUCCESS",
            actor: { userId: auth.userId, username: auth.email },
            target: { type: "USER", id: payment.userId.toString() },
            details: {
                paymentId: id,
                changes: {
                    from: oldStatus,
                    to: status
                },
                tier: payment.tier
            },
            severity: 'INFO'
        });

        return NextResponse.json({ message: "Payment status updated" });

    } catch (error) {
        console.error("Admin Payment PATCH Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
