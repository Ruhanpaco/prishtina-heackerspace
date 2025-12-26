import AuditLog from "@/models/AuditLog";
import dbConnect from "@/lib/mongodb/dbConnect";
import { headers } from "next/headers";

// Simplified Logger Interface mapping to the complex schema
export interface LogParams {
    eventType: string; // e.g. "auth.login.success"
    action: string; // e.g. "LOGIN"
    status: 'SUCCESS' | 'FAILURE' | 'DENIED';

    actor?: {
        userId?: string;
        username?: string;
        role?: string;
        type?: 'human' | 'system' | 'service';
    };

    target?: {
        type: string;
        id?: string;
    };

    context?: {
        ip?: string;
        userAgent?: string;
        requestId?: string;
        session_id?: string;
    };

    details?: any; // Goes to metadata or failure reason if applicable
    severity?: 'INFO' | 'WARNING' | 'CRITICAL' | 'ERROR';
}

/**
 * Enhanced Logger for comprehensive audit trails.
 */
export async function logActivity(params: LogParams) {
    try {
        await dbConnect();

        // 1. Context Extraction (IP, UA)
        let ip = params.context?.ip;
        let ua = params.context?.userAgent;

        if (!ip || !ua) {
            try {
                const h = await headers();
                if (!ip) {
                    const forwarded = h.get("x-forwarded-for");
                    ip = forwarded ? forwarded.split(',')[0] : "127.0.0.1";
                }
                if (!ua) {
                    ua = h.get("user-agent") || "unknown";
                }
            } catch (e) {
                // Request context unavailable
                if (!ip) ip = "127.0.0.1";
                if (!ua) ua = "system";
            }
        }

        // 2. Construct Data
        const logData = {
            event_type: params.eventType,
            severity: params.severity || (params.status === 'FAILURE' ? 'WARNING' : 'INFO'),

            actor: {
                userId: params.actor?.userId as any,
                username: params.actor?.username,
                role: params.actor?.role,
                type: params.actor?.type || 'human'
            },

            context: {
                ip_address: ip,
                user_agent: ua,
                request_id: params.context?.requestId,
            },

            target: params.target ? {
                resource_type: params.target.type,
                resource_id: params.target.id
            } : { resource_type: 'SYSTEM' }, // valid fallback

            action: {
                operation: params.action,
                status: params.status,
                failure_reason: params.status !== 'SUCCESS' ? JSON.stringify(params.details) : undefined
            },

            metadata: params.details
        };

        // 3. Write to DB (non-blocking call usually preferred, but we await to ensure write)
        await AuditLog.create(logData);

    } catch (error) {
        console.error("AUDIT LOG FAILURE:", error);
    }
}
