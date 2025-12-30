import { NextRequest, NextResponse } from "next/server";
import { authenticateAPI } from "@/lib/api-auth";
import dbConnect from "@/lib/mongodb/dbConnect";
import SecurityThreat from "@/models/SecurityThreat";
import { hasPermission, Permission } from "@/lib/rbac";

export async function GET(req: NextRequest) {
    try {
        await dbConnect();
        const auth = await authenticateAPI();

        if (!auth || !hasPermission(auth.role, Permission.AUDIT_LOG_READ)) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
        }

        const threats = await SecurityThreat.find({
            status: { $in: ['ACTIVE', 'FLAGGED'] }
        })
            .sort({ lastDetected: -1 })
            .limit(20)
            .populate('userId', 'name email')
            .lean();

        return NextResponse.json({ threats });

    } catch (error) {
        console.error("Security Threats API Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
