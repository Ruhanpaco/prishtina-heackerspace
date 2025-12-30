import { NextRequest, NextResponse } from "next/server";
import { authenticateAPI } from "@/lib/api-auth";
import dbConnect from "@/lib/mongodb/dbConnect";
import User from "@/models/User";
import IdentityArchive from "@/models/IdentityArchive";
import { hasPermission, Permission } from "@/lib/rbac";
import { logActivity } from "@/lib/logger";
import { sendIdentityApprovedEmail, sendIdentityRejectedEmail } from "@/lib/identity-email";

export async function PATCH(req: NextRequest) {
    try {
        await dbConnect();
        const auth = await authenticateAPI();

        if (!auth || !hasPermission(auth.role, Permission.DOCUMENT_VERIFY)) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
        }

        const body = await req.json();
        const { userId, status, reason } = body;

        if (!['VERIFIED', 'REJECTED'].includes(status)) {
            return NextResponse.json({ error: "Invalid status" }, { status: 400 });
        }

        const archive = await IdentityArchive.findOne({ userId, status: 'PENDING' });
        if (!archive) return NextResponse.json({ error: "Pending archive entry not found" }, { status: 404 });

        const user = await User.findById(userId);
        if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

        const oldStatus = user.identificationStatus;
        user.identificationStatus = status;

        archive.status = status === 'VERIFIED' ? 'VERIFIED' : 'REJECTED';
        archive.verifiedBy = auth.userId as any;
        archive.verifiedAt = new Date();

        if (status === 'REJECTED') {
            archive.rejectionReason = reason || "Documents were not clear.";
            user.identityRejectionReason = archive.rejectionReason;
            await sendIdentityRejectedEmail({
                userName: user.name || user.username,
                email: user.email,
                details: archive.rejectionReason
            });
        } else {
            user.identityRejectionReason = undefined;
            if (user.membershipStatus === 'INACTIVE' || user.membershipStatus === 'PENDING') {
                user.membershipStatus = 'ACTIVE';
            }
            await sendIdentityApprovedEmail({
                userName: user.name || user.username,
                email: user.email
            });
        }

        await archive.save();
        await user.save();

        await logActivity({
            eventType: "admin.identity.review",
            action: "UPDATE",
            status: "SUCCESS",
            actor: { userId: auth.userId, username: auth.email },
            target: { type: "USER", id: userId },
            details: { previousStatus: oldStatus, newStatus: status, reason, archiveId: archive._id.toString() },
            severity: 'INFO'
        });

        return NextResponse.json({ message: "Identity review finalized", newStatus: status });
    } catch (error) {
        console.error("Identity Review PATCH Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
