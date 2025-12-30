import { NextRequest, NextResponse } from "next/server";
import { authenticateAPI } from "@/lib/api-auth";
import dbConnect from "@/lib/mongodb/dbConnect";
import AuditLog from "@/models/AuditLog";
import SecurityBaseline from "@/models/SecurityBaseline";
import { hasPermission, Permission } from "@/lib/rbac";

export async function GET(req: NextRequest) {
    try {
        await dbConnect();
        const auth = await authenticateAPI();

        if (!auth || !hasPermission(auth.role, Permission.AUDIT_LOG_READ)) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
        }

        const now = new Date();
        const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

        const [
            topFailingIPs,
            severityTrend,
            eventStats,
            statusRatio,
            weeklyTrend,
            categoryVolume,
            securityBaseline
        ] = await Promise.all([
            // 1. Top Failing IPs (24h)
            AuditLog.aggregate([
                { $match: { "action.status": "FAILURE", timestamp: { $gte: twentyFourHoursAgo } } },
                { $group: { _id: "$context.ip_address", count: { $sum: 1 } } },
                { $sort: { count: -1 } },
                { $limit: 10 }
            ]),
            // 2. Severity Trend (24h)
            AuditLog.aggregate([
                { $match: { timestamp: { $gte: twentyFourHoursAgo } } },
                {
                    $group: {
                        _id: {
                            hour: { $hour: "$timestamp" },
                            severity: "$severity"
                        },
                        count: { $sum: 1 }
                    }
                },
                { $sort: { "_id.hour": 1 } }
            ]),
            // 3. Top Events (24h)
            AuditLog.aggregate([
                { $match: { timestamp: { $gte: twentyFourHoursAgo } } },
                { $group: { _id: "$event_type", count: { $sum: 1 } } },
                { $sort: { count: -1 } },
                { $limit: 8 }
            ]),
            // 4. Success/Failure Ratio (24h)
            AuditLog.aggregate([
                { $match: { timestamp: { $gte: twentyFourHoursAgo } } },
                { $group: { _id: "$action.status", count: { $sum: 1 } } }
            ]),
            // 5. Weekly Activity Trend (7d)
            AuditLog.aggregate([
                { $match: { timestamp: { $gte: sevenDaysAgo } } },
                {
                    $group: {
                        _id: { $dateToString: { format: "%Y-%m-%d", date: "$timestamp" } },
                        count: { $sum: 1 }
                    }
                },
                { $sort: { "_id": 1 } }
            ]),
            // 6. Distribution by Category (7d)
            AuditLog.aggregate([
                { $match: { timestamp: { $gte: sevenDaysAgo } } },
                {
                    $group: {
                        _id: {
                            $cond: [
                                { $regexMatch: { input: "$event_type", regex: /auth/i } }, "Authentication",
                                {
                                    $cond: [
                                        { $regexMatch: { input: "$event_type", regex: /space|checkin|checkout/i } }, "Space Presence",
                                        {
                                            $cond: [
                                                { $regexMatch: { input: "$event_type", regex: /admin|user|config/i } }, "Management",
                                                "System"
                                            ]
                                        }
                                    ]
                                }
                            ]
                        },
                        count: { $sum: 1 }
                    }
                }
            ]),
            // 7. Global Baseline (Heuristic Stats)
            SecurityBaseline.findOne({ category: 'global' }).lean()
        ]);

        return NextResponse.json({
            topFailingIPs,
            severityTrend,
            eventStats,
            statusRatio,
            weeklyTrend,
            categoryVolume,
            securityBaseline,
            timeRange: "Last 7 Days"
        });
    } catch (error) {
        console.error("Security Analytics API Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
