import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { authenticateAPI } from "@/lib/api-auth";
import dbConnect from "@/lib/mongodb/dbConnect";
import User from "@/models/User";
import IdentityArchive from "@/models/IdentityArchive";
import { encryptSensitiveData } from "@/lib/secure-vault";
import { z } from "zod";
import { logActivity } from "@/lib/logger";

const uploadSchema = z.object({
    type: z.enum(['ID_CARD', 'PASSPORT', 'DRIVER_LICENSE', 'OTHER']),
    files: z.array(z.object({
        side: z.enum(['FRONT', 'BACK', 'FULL']),
        data: z.string(),
        name: z.string()
    })).min(1).max(2)
});

export async function POST(req: NextRequest) {
    try {
        await dbConnect();
        const auth = await authenticateAPI();
        if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const body = await req.json();
        const validation = uploadSchema.safeParse(body);
        if (!validation.success) return NextResponse.json({ error: "Invalid payload", details: validation.error.flatten().fieldErrors }, { status: 400 });

        const { type, files } = validation.data;
        const user = await User.findById(auth.userId);
        if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

        if (type === 'ID_CARD' && (files.length < 2 || !files.some(f => f.side === 'FRONT') || !files.some(f => f.side === 'BACK'))) {
            return NextResponse.json({ error: "ID Card requires both front and back photos" }, { status: 400 });
        }

        const ip = req.headers.get("x-forwarded-for")?.split(',')[0] || "127.0.0.1";
        const ua = req.headers.get("user-agent") || "unknown";
        const fingerprint = crypto.createHash('sha256').update(`${ip}-${ua}`).digest('hex').substring(0, 16);
        const requestId = crypto.randomBytes(8).toString('hex');

        const forensics = { ipAddress: ip, userAgent: ua, fingerprint, requestId, uploadedBy: { userId: user._id.toString(), email: user.email }, timestamp: new Date().toISOString() };

        const encryptedDocs = files.map(file => {
            const envelope = encryptSensitiveData(JSON.stringify({ originalData: file.data, forensics }), user.uuid || user._id.toString());
            return { data: envelope.encrypted, iv: envelope.iv, authTag: envelope.authTag, side: file.side };
        });

        await IdentityArchive.create({ userId: user._id, email: user.email, documentType: type, status: 'PENDING', documents: encryptedDocs, uploadedBy: { userId: user._id.toString(), email: user.email }, forensics: { ipAddress: ip, userAgent: ua, fingerprint, requestId } });

        user.identificationStatus = 'PENDING';
        await user.save();

        await logActivity({
            eventType: "user.identity.uploaded",
            action: "UPLOAD",
            status: "SUCCESS",
            actor: { userId: user._id.toString(), username: user.email, role: user.role },
            target: { type: "USER", id: user._id.toString() },
            context: { requestId, fingerprint },
            details: { documentType: type, count: files.length },
            severity: 'INFO'
        });

        return NextResponse.json({ message: "Identity documents secured. Verification pending.", status: 'PENDING', requestId });
    } catch (error) {
        console.error("Identity Upload Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
