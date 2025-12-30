import { NextRequest, NextResponse } from "next/server";
import { recalculateGlobalBaseline } from "@/lib/security-engine";

/**
 * Vercel Cron Action: Recalculate Security Baselines
 * 
 * This endpoint triggers the heuristic learning system to update 
 * its statistical baselines based on recent audit logs.
 * 
 * Recommended Frequency: Once per day (0 0 * * *)
 */
export async function POST(req: NextRequest) {
    try {
        // Vercel Cron jobs can be protected by a Secret
        const authHeader = req.headers.get('authorization');
        const internalSecret = process.env.CRON_SECRET;

        // If a secret is configured, enforce it
        if (internalSecret && authHeader !== `Bearer ${internalSecret}`) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        console.log("CRON: Triggering heuristic baseline recalculation...");
        await recalculateGlobalBaseline();

        return NextResponse.json({
            success: true,
            message: "Security baselines updated successfully",
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error("CRON ERROR (Security Baseline):", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

// Support GET for simple testing/pinging if configured similarly in vercel.json
export async function GET(req: NextRequest) {
    return POST(req);
}
