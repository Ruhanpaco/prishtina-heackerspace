import { NextRequest, NextResponse } from "next/server";
import { authenticateAPI } from "@/lib/api-auth";
import dbConnect from "@/lib/mongodb/dbConnect";
import SecurityThreat from "@/models/SecurityThreat";
import { hasPermission, Permission } from "@/lib/rbac";
import { logActivity } from "@/lib/logger";

export async function PATCH(req: NextRequest) {
    try {
        await dbConnect();
        const auth = await authenticateAPI();

        if (!auth || !hasPermission(auth.role, Permission.AUDIT_LOG_READ)) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
        }

        const { threatId, status } = await req.json();

        if (!['RESOLVED', 'FLAGGED', 'BANNED'].includes(status)) {
            return NextResponse.json({ error: "Invalid status" }, { status: 400 });
        }

        const threat = await SecurityThreat.findById(threatId);
        if (!threat) {
            return NextResponse.json({ error: "Threat not found" }, { status: 404 });
        }

        const oldStatus = threat.status;
        threat.status = status;
        await threat.save();

        await logActivity({
            eventType: "admin.security.threat.update",
            action: "UPDATE",
            status: "SUCCESS",
            actor: { userId: auth.userId, role: auth.role },
            target: { type: "SECURITY_THREAT", id: threat._id.toString() },
            details: {
                ipAddress: threat.ipAddress,
                changes: {
                    from: oldStatus,
                    to: status
                }
            },
            severity: "WARNING"
        });

        return NextResponse.json({ message: `Threat ${status.toLowerCase()} successfully`, threat });

    } catch (error) {
        console.error("Security Threat Update Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
