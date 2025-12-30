import mongoose, { Schema, Document, Model } from 'mongoose';

/**
 * Security Baseline Model
 * 
 * Stores rolling statistical baselines for system activity.
 * This enables "learning" without a dedicated ML backend by comparing
 * current event rates against historical averages.
 */

export interface ISecurityBaseline extends Document {
    category: string; // 'global', 'auth', 'space', 'admin'

    // Aggregates
    totalEvents: number;
    totalFailures: number;

    // Statistical Measurements (for Z-Score calculations)
    avgFailuresPerHour: number;
    stdDevFailuresPerHour: number;

    // Rolling Window Tracking
    lastUpdated: Date;
    sampleSize: number; // Number of log entries analyzed to build this baseline

    // Thresholds (Automatically adjusted)
    anomalyThreshold: number; // e.g. 3.0 (Z-score)
}

const SecurityBaselineSchema: Schema<ISecurityBaseline> = new Schema(
    {
        category: { type: String, required: true, unique: true, index: true },
        totalEvents: { type: Number, default: 0 },
        totalFailures: { type: Number, default: 0 },
        avgFailuresPerHour: { type: Number, default: 0 },
        stdDevFailuresPerHour: { type: Number, default: 0 },
        lastUpdated: { type: Date, default: Date.now },
        sampleSize: { type: Number, default: 0 },
        anomalyThreshold: { type: Number, default: 3.0 } // Default to 3 Sigma
    },
    {
        timestamps: true,
        collection: 'security_baselines'
    }
);

const SecurityBaseline: Model<ISecurityBaseline> = mongoose.models.SecurityBaseline || mongoose.model<ISecurityBaseline>('SecurityBaseline', SecurityBaselineSchema);

export default SecurityBaseline;
