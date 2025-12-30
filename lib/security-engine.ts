import dbConnect from "@/lib/mongodb/dbConnect";
import AuditLog from "@/models/AuditLog";
import SecurityBaseline from "@/models/SecurityBaseline";
import SecurityThreat, { ThreatType } from "@/models/SecurityThreat";

/**
 * Security Engine: Heuristic-based threat detection.
 * Analyzes audit logs to identify and flag suspicious patterns.
 */
export async function analyzeThreats(ip: string, userId?: string) {
    try {
        await dbConnect();

        const windowStart = new Date(Date.now() - 10 * 1000 * 60); // 10 minute window

        // 1. Detect Cluster Failures (Traditional Heuristic)
        const recentFailures = await AuditLog.countDocuments({
            "context.ip_address": ip,
            "action.status": "FAILURE",
            timestamp: { $gte: windowStart }
        });

        // 2. Perform Statistical Anomaly Detection (Heuristic ML)
        const baseline = await SecurityBaseline.findOne({ category: 'global' });

        if (baseline && baseline.sampleSize > 100) {
            // Calculate current failure rate (Failures per 10m window)
            // Baseline is stored as "Failures Per Hour", so we adjust
            const adjustedAvg = baseline.avgFailuresPerHour / 6;
            const adjustedStdDev = baseline.stdDevFailuresPerHour / 6;

            // Z-Score Calculation: How many standard deviations is this from the norm?
            const zScore = (recentFailures - adjustedAvg) / (adjustedStdDev || 1);

            if (zScore > baseline.anomalyThreshold) {
                await createOrUpdateThreat(ip, ThreatType.ANOMALY_SPIKE, {
                    severity: zScore > 10 ? 'CRITICAL' : 'HIGH',
                    userId,
                    metadata: {
                        zScore: zScore.toFixed(2),
                        deviation: "STATISTICAL_SPIKE",
                        failures: recentFailures,
                        baselineAvg: adjustedAvg.toFixed(2)
                    }
                });
            }
        }

        // 3. Update Baseline (Sampled Learning)
        // We only update every ~100 requests to avoid overhead and "bias drift"
        if (Math.random() < 0.01) {
            await recalculateGlobalBaseline();
        }

        // 4. Traditional Pattern Detection
        if (recentFailures >= 5) {
            await createOrUpdateThreat(ip, ThreatType.BRUTE_FORCE, {
                severity: recentFailures >= 10 ? 'CRITICAL' : 'HIGH',
                userId,
                metadata: { failureCount: recentFailures, window: "10m" }
            });
        }

        const uniqueAccountsFailed = await AuditLog.distinct("actor.userId", {
            "context.ip_address": ip,
            "action.status": "FAILURE",
            timestamp: { $gte: windowStart }
        });

        if (uniqueAccountsFailed.length >= 3) {
            await createOrUpdateThreat(ip, ThreatType.CREDENTIAL_STUFFING, {
                severity: 'CRITICAL',
                userId,
                metadata: { accountCount: uniqueAccountsFailed.length, accounts: uniqueAccountsFailed }
            });
        }

    } catch (error) {
        console.error("SECURITY ENGINE ERROR:", error);
    }
}

/**
 * Re-calculates global security baselines based on recent history.
 * This is the "Learning" component of the serverless ML system.
 */
export async function recalculateGlobalBaseline() {
    try {
        await dbConnect();
        const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

        // Use aggregation to find the distribution of failures hourly
        const hourlyStats = await AuditLog.aggregate([
            { $match: { "action.status": "FAILURE", timestamp: { $gte: twentyFourHoursAgo } } },
            {
                $group: {
                    _id: {
                        hour: { $hour: "$timestamp" },
                        day: { $dayOfMonth: "$timestamp" }
                    },
                    count: { $sum: 1 }
                }
            }
        ]);

        if (hourlyStats.length === 0) return;

        const counts = hourlyStats.map((s: { count: number }) => s.count);
        const mean = counts.reduce((a: number, b: number) => a + b, 0) / counts.length;
        const stdDev = Math.sqrt(counts.map((x: number) => Math.pow(x - mean, 2)).reduce((a: number, b: number) => a + b, 0) / counts.length);

        await SecurityBaseline.findOneAndUpdate(
            { category: 'global' },
            {
                avgFailuresPerHour: mean,
                stdDevFailuresPerHour: stdDev,
                sampleSize: await AuditLog.countDocuments({ timestamp: { $gte: twentyFourHoursAgo } }),
                lastUpdated: new Date()
            },
            { upsert: true }
        );

        console.log(`Security Baseline Updated: Mean=${mean.toFixed(2)}, StdDev=${stdDev.toFixed(2)}`);
    } catch (error) {
        console.error("BASELINE UPDATE FAILURE:", error);
    }
}

async function createOrUpdateThreat(ip: string, type: ThreatType, data: any) {
    const existing = await SecurityThreat.findOne({
        ipAddress: ip,
        threatType: type,
        status: { $in: ['ACTIVE', 'FLAGGED'] }
    });

    if (existing) {
        existing.lastDetected = new Date();
        existing.evidenceCount += 1;
        existing.severity = data.severity;
        existing.metadata = { ...existing.metadata, ...data.metadata };
        await existing.save();
    } else {
        await SecurityThreat.create({
            ipAddress: ip,
            threatType: type,
            severity: data.severity,
            userId: data.userId,
            metadata: data.metadata,
            evidenceCount: 1,
            status: 'ACTIVE'
        });
    }
}
