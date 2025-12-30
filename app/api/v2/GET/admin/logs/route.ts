import { NextRequest, NextResponse } from "next/server";
import { authenticateAPI } from "@/lib/api-auth";
import dbConnect from "@/lib/mongodb/dbConnect";
import AuditLog from "@/models/AuditLog";
import { hasPermission, Permission } from "@/lib/rbac";

export async function GET(req: NextRequest) {
    try {
        await dbConnect();
        const auth = await authenticateAPI();

        if (!auth || !hasPermission(auth.role, Permission.AUDIT_LOG_READ)) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
        }

        const { searchParams } = new URL(req.url);
        const page = parseInt(searchParams.get("page") || "1");
        const limit = parseInt(searchParams.get("limit") || "50");
        const severity = searchParams.get("severity");
        const operation = searchParams.get("operation");
        const status = searchParams.get("status");
        const skip = (page - 1) * limit;

        const query: any = {};
        if (severity && severity !== "all") query.severity = severity;
        if (operation && operation !== "all") query['action.operation'] = operation;
        if (status && status !== "all") query['action.status'] = status;

        const [logs, total] = await Promise.all([
            AuditLog.find(query)
                .sort({ timestamp: -1 })
                .skip(skip)
                .limit(limit)
                .lean(),
            AuditLog.countDocuments(query)
        ]);

        return NextResponse.json({
            logs,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            }
        });

    } catch (error) {
        console.error("Audit Logs GET Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
