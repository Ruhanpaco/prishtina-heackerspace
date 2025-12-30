import { NextRequest, NextResponse } from "next/server";
import { authenticateAPI } from "@/lib/api-auth";
import dbConnect from "@/lib/mongodb/dbConnect";
import Payment from "@/models/Payment";
import User from "@/models/User";
import { logActivity } from "@/lib/logger";
import { encryptBuffer } from "@/lib/encryption";

export async function POST(req: NextRequest) {
    try {
        await dbConnect();
        const auth = await authenticateAPI();

        if (!auth) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { amount, tier, method, reference, proofFile, fileType } = body;

        if (!amount || !tier || !method) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        let encryptedProof: string | undefined = undefined;
        if (proofFile) {
            const base64Data = proofFile.split(';base64,').pop();
            if (base64Data) {
                const buffer = Buffer.from(base64Data, 'base64');
                encryptedProof = encryptBuffer(buffer);
            }
        }

        // 1. Create Payment record in PENDING status
        const payment = await Payment.create({
            userId: auth.userId,
            amount,
            tier,
            method,
            reference,
            proofOfPayment: encryptedProof,
            proofMimeType: fileType,
            status: 'PENDING'
        }) as any;

        // 2. Update user status to PENDING
        const user = await User.findById(auth.userId);
        if (user && user.membershipStatus !== 'ACTIVE') {
            user.membershipStatus = 'PENDING';
            await user.save();
        }

        // 3. Log Activity
        await logActivity({
            eventType: "membership.payment.submitted",
            action: "UPDATE",
            status: "SUCCESS",
            actor: { userId: auth.userId, username: auth.email },
            target: { type: "USER", id: auth.userId },
            details: {
                paymentId: payment._id.toString(),
                amount,
                tier,
                method,
                reference
            },
            severity: 'INFO'
        });

        return NextResponse.json({
            message: "Payment notice submitted successfully",
            paymentId: payment._id
        });

    } catch (error) {
        console.error("Payment Submission Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
