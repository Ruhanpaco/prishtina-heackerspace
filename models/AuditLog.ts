import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IAuditLog extends Document {
    // Core
    timestamp: Date;
    event_type: string;
    severity: 'INFO' | 'WARNING' | 'CRITICAL' | 'ERROR' | 'DEBUG';
    environment: string; // e.g. 'production', 'development'
    service_name?: string;

    // Actor (who did it)
    actor?: {
        userId?: mongoose.Types.ObjectId;
        username?: string; // masked/snapshot
        type?: 'human' | 'system' | 'service'; // user | admin | service | system
        role?: string;
        ipAddress?: string; // Kept here or in context
    };

    // Request / Context
    context?: {
        ip_address?: string;
        user_agent?: string;
        os?: string;
        browser?: string;
        browser_version?: string;
        cpu_arch?: string;
        device_vendor?: string;
        device_model?: string;
        country?: string;
        device_type?: string;
        session_id?: string;
        request_id?: string;
        trace_id?: string;
    };

    // Forensic Metadata
    forensics?: {
        fingerprint?: string;
        bundle_id?: string;
        hashing_algorithm?: string;
    };

    // Target (what it was done to)
    target?: {
        resource_type: string; // user, project, document
        resource_id?: string;
        resource_owner_id?: string;
    };

    // Action (what happened)
    action: {
        operation: string; // create, read, update, delete, login, logout
        category?: string; // auth, user, admin
        status: 'SUCCESS' | 'FAILURE' | 'DENIED';
        failure_reason?: string;
    };

    // Authentication Specific
    auth?: {
        method?: string; // password, oauth, sso
        mfa_used?: boolean;
    };

    // Security / Anomaly
    security?: {
        risk_score?: number;
        flagged?: boolean;
        anomaly_type?: string;
    };

    // Data Changes
    changes?: {
        before?: any;
        after?: any;
    };

    metadata?: any; // For flexible extras
}

const AuditLogSchema: Schema<IAuditLog> = new Schema(
    {
        // Core
        timestamp: { type: Date, default: Date.now, index: { expires: '180d' } }, // 6 months retention
        event_type: { type: String, required: true, index: true },
        severity: { type: String, enum: ['INFO', 'WARNING', 'CRITICAL', 'ERROR', 'DEBUG'], default: 'INFO' },
        environment: { type: String, default: process.env.NODE_ENV || 'development' },
        service_name: { type: String, default: 'prhs-crm' },

        // Actor
        actor: {
            userId: { type: Schema.Types.ObjectId, ref: 'User', index: true },
            username: { type: String },
            type: { type: String, enum: ['human', 'system', 'service'], default: 'human' },
            role: { type: String }
        },

        // Context (Network & Device Telemetry)
        context: {
            ip_address: { type: String, required: true, index: true },
            user_agent: { type: String },
            os: { type: String },
            browser: { type: String },
            browser_version: { type: String },
            cpu_arch: { type: String },
            device_vendor: { type: String },
            device_model: { type: String },
            country: { type: String },
            device_type: { type: String },
            session_id: { type: String },
            request_id: { type: String },
            trace_id: { type: String }
        },

        // Forensic Metadata
        forensics: {
            fingerprint: { type: String, index: true },
            bundle_id: { type: String }, // For linking multiple logs in one ceremony
            hashing_algorithm: { type: String, default: 'sha256' }
        },

        // Target
        target: {
            resource_type: { type: String, required: true },
            resource_id: { type: String, index: true },
            resource_owner_id: { type: String }
        },

        // Action
        action: {
            operation: { type: String, required: true },
            category: { type: String },
            status: { type: String, enum: ['SUCCESS', 'FAILURE', 'DENIED'], required: true, index: true },
            failure_reason: { type: String }
        },

        // Authentication
        auth: {
            method: { type: String },
            mfa_used: { type: Boolean }
        },

        // Security
        security: {
            risk_score: { type: Number, min: 0, max: 100 },
            flagged: { type: Boolean, default: false },
            anomaly_type: { type: String }
        },

        // Changes
        changes: {
            before: { type: Schema.Types.Mixed },
            after: { type: Schema.Types.Mixed }
        },

        metadata: { type: Schema.Types.Mixed }
    },
    {
        timestamps: true, // adds createdAt, updatedAt
        collection: 'audit_logs'
    }
);

// Compound Indexes for typical queries
AuditLogSchema.index({ 'actor.userId': 1, timestamp: -1 });
AuditLogSchema.index({ 'context.ip_address': 1, 'action.status': 1, timestamp: -1 });
AuditLogSchema.index({ 'security.flagged': 1, timestamp: -1 });

const AuditLog: Model<IAuditLog> = mongoose.models.AuditLog || mongoose.model<IAuditLog>('AuditLog', AuditLogSchema);

export default AuditLog;
