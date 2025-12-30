import { NextRequest, NextResponse } from "next/server";
import { authenticateAPI } from "@/lib/api-auth";
import dbConnect from "@/lib/mongodb/dbConnect";
import User from "@/models/User";
import IdentityArchive from "@/models/IdentityArchive";
import { decryptSensitiveData } from "@/lib/secure-vault";
import { hasPermission, Permission } from "@/lib/rbac";

export async function GET(req: NextRequest) {
    try {
        await dbConnect();
        const auth = await authenticateAPI();

        if (!auth || !hasPermission(auth.role, Permission.DOCUMENT_READ_ALL)) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
        }

        const { searchParams } = new URL(req.url);
        const userId = searchParams.get("userId");

        if (!userId) {
            const pendingArchives = await IdentityArchive.find({ status: 'PENDING' })
                .select('userId email documentType documents.side createdAt forensics');
            return NextResponse.json({ archives: pendingArchives });
        }

        const archive = await IdentityArchive.findOne({ userId, status: 'PENDING' });
        if (!archive) return NextResponse.json({ error: "No pending identity found" }, { status: 404 });

        const user = await User.findById(userId).select("uuid");
        if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

        const decryptedDocs = archive.documents.map((doc: any) => {
            try {
                const decryptedRaw = decryptSensitiveData({
                    encrypted: doc.data,
                    iv: doc.iv,
                    authTag: doc.authTag
                }, user.uuid || user._id.toString());

                const bundle = JSON.parse(decryptedRaw);
                return {
                    side: doc.side,
                    data: bundle.originalData,
                    forensics: bundle.forensics,
                    uploadedAt: archive.createdAt
                };
            } catch (err) {
                console.error(`Failed to decrypt archived doc:`, err);
                return { ...doc, data: null, error: "Decryption failed" };
            }
        });

        return NextResponse.json({
            documentType: archive.documentType,
            documents: decryptedDocs,
            uploadedBy: archive.uploadedBy,
            globalForensics: archive.forensics
        });
    } catch (error) {
        console.error("Identity Review GET Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
