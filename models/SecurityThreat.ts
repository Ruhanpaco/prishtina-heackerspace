import mongoose, { Schema, Document, Model } from 'mongoose';

export enum ThreatType {
    BRUTE_FORCE = 'BRUTE_FORCE',
    CREDENTIAL_STUFFING = 'CREDENTIAL_STUFFING',
    SUSPICIOUS_UPLOAD = 'SUSPICIOUS_UPLOAD',
    ANOMALY = 'ANOMALY',
    ANOMALY_SPIKE = 'ANOMALY_SPIKE'
}

export interface ISecurityThreat extends Document {
    ipAddress: string;
    userId?: mongoose.Types.ObjectId;
    threatType: ThreatType;
    severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    status: 'ACTIVE' | 'FLAGGED' | 'RESOLVED' | 'BANNED';
    firstDetected: Date;
    lastDetected: Date;
    evidenceCount: number;
    metadata: any;
}

const SecurityThreatSchema: Schema<ISecurityThreat> = new Schema(
    {
        ipAddress: { type: String, required: true, index: true },
        userId: { type: Schema.Types.ObjectId, ref: 'User', index: true },
        threatType: {
            type: String,
            enum: Object.values(ThreatType),
            required: true,
            index: true
        },
        severity: {
            type: String,
            enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
            default: 'MEDIUM'
        },
        status: {
            type: String,
            enum: ['ACTIVE', 'FLAGGED', 'RESOLVED', 'BANNED'],
            default: 'ACTIVE',
            index: true
        },
        firstDetected: { type: Date, default: Date.now },
        lastDetected: { type: Date, default: Date.now },
        evidenceCount: { type: Number, default: 1 },
        metadata: { type: Schema.Types.Mixed }
    },
    {
        timestamps: true,
        collection: 'security_threats'
    }
);

// Compound index for finding existing threats for an IP/Type combo
SecurityThreatSchema.index({ ipAddress: 1, threatType: 1, status: 1 });

const SecurityThreat: Model<ISecurityThreat> = mongoose.models.SecurityThreat || mongoose.model<ISecurityThreat>('SecurityThreat', SecurityThreatSchema);

export default SecurityThreat;
