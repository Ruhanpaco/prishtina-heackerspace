import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb/dbConnect";
import User from "@/models/User";
import AuditLog from "@/models/AuditLog";
import { authenticateAPI } from "@/lib/api-auth";
import { AVAILABLE_BADGES } from "@/lib/badges";
import { headers } from "next/headers";
import { UAParser } from "ua-parser-js";
import mongoose from "mongoose";

export async function POST(req: NextRequest) {
    try {
        const authInfo = await authenticateAPI();
        if (!authInfo || (authInfo.role !== 'ADMIN' && authInfo.role !== 'STAFF')) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
        }

        const body = await req.json();
        const { userIds, badgeIds } = body;

        if (!Array.isArray(userIds) || !Array.isArray(badgeIds) || userIds.length === 0 || badgeIds.length === 0) {
            return NextResponse.json({ error: "Invalid payload: userIds and badgeIds are required arrays" }, { status: 400 });
        }

        // Validate badge IDs
        const validBadgeIds = badgeIds.filter(id => AVAILABLE_BADGES.some(b => b.id === id));
        if (validBadgeIds.length === 0) {
            return NextResponse.json({ error: "No valid badge IDs provided" }, { status: 400 });
        }

        await dbConnect();

        // Perform bulk update
        const result = await User.updateMany(
            { _id: { $in: userIds } },
            { $addToSet: { badges: { $each: validBadgeIds } } }
        );

        // Forensic Logging
        const headersList = await headers();
        const ua = headersList.get("user-agent") || "";
        const ip = headersList.get("x-forwarded-for") || "unknown";
        const parser = new UAParser(ua);
        const device = parser.getResult();

        await AuditLog.create({
            event_type: "ADMIN_BADGE_ASSIGNMENT",
            severity: "INFO",
            actor: {
                userId: new mongoose.Types.ObjectId(authInfo.userId),
                role: authInfo.role,
                type: "human"
            },
            context: {
                ip_address: ip,
                user_agent: ua,
                os: device.os.name,
                browser: device.browser.name,
                device_type: device.device.type || "desktop"
            },
            target: {
                resource_type: "user_batch",
                resource_id: userIds.join(","),
            },
            action: {
                operation: "update",
                category: "admin",
                status: "SUCCESS"
            },
            metadata: {
                badges_assigned: validBadgeIds,
                user_count: userIds.length,
                matched_count: result.matchedCount,
                modified_count: result.modifiedCount
            }
        });

        return NextResponse.json({
            success: true,
            message: `Successfully updated ${result.modifiedCount} users`,
            details: {
                matched: result.matchedCount,
                modified: result.modifiedCount
            }
        });

    } catch (error: any) {
        console.error("Badge assignment error:", error);
        return NextResponse.json({ error: "Internal Server Error", detail: error.message }, { status: 500 });
    }
}
