import { NextRequest, NextResponse } from "next/server";
import { authenticateAPI } from "@/lib/api-auth";
import dbConnect from "@/lib/mongodb/dbConnect";
import Payment from "@/models/Payment";
import { decryptBuffer } from "@/lib/encryption";

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await dbConnect();
        const auth = await authenticateAPI();

        if (!auth) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;
        const payment = await Payment.findById(id);
        if (!payment || !payment.proofOfPayment) {
            return NextResponse.json({ error: "Proof not found" }, { status: 404 });
        }

        const decrypted = decryptBuffer(payment.proofOfPayment);

        return new NextResponse(new Uint8Array(decrypted), {
            headers: {
                'Content-Type': payment.proofMimeType || 'application/octet-stream',
                'Content-Disposition': `inline; filename="proof-${id}"`
            }
        });

    } catch (error) {
        console.error("Proof Decryption Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
