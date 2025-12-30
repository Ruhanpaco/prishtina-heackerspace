import AuditLog from "@/models/AuditLog";
import dbConnect from "@/lib/mongodb/dbConnect";
import { headers } from "next/headers";
import { analyzeThreats } from "@/lib/security-engine";
import { UAParser } from "ua-parser-js";

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
        trace_id?: string;
        fingerprint?: string;
        bundle_id?: string;
    };

    details?: any; // Goes to metadata or failure reason if applicable
    severity?: 'INFO' | 'WARNING' | 'CRITICAL' | 'ERROR';
}

/**
 * Enhanced Logger for comprehensive forensic audit trails.
 */
export async function logActivity(params: LogParams) {
    try {
        await dbConnect();

        // 1. Context Extraction (IP, UA)
        let ip = params.context?.ip;
        let uaString = params.context?.userAgent;

        if (!ip || !uaString) {
            try {
                const h = await headers();
                if (!ip) {
                    const forwarded = h.get("x-forwarded-for");
                    ip = forwarded ? forwarded.split(',')[0] : "127.0.0.1";
                }
                if (!uaString) {
                    uaString = h.get("user-agent") || "unknown";
                }
            } catch (e) {
                // Request context unavailable
                if (!ip) ip = "127.0.0.1";
                if (!uaString) uaString = "system";
            }
        }

        // 2. Deep Telemetry Parsing
        const parser = new UAParser(uaString);
        const device = parser.getDevice();
        const os = parser.getOS();
        const browser = parser.getBrowser();
        const cpu = parser.getCPU();

        // 3. Construct Data
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
                user_agent: uaString,
                os: os.name ? `${os.name} ${os.version || ''}`.trim() : undefined,
                browser: browser.name,
                browser_version: browser.version,
                cpu_arch: cpu.architecture,
                device_vendor: device.vendor,
                device_model: device.model,
                device_type: device.type || 'desktop',
                request_id: params.context?.requestId,
                session_id: params.context?.session_id,
                trace_id: params.context?.trace_id
            },

            forensics: {
                fingerprint: params.context?.fingerprint,
                bundle_id: params.context?.bundle_id,
            },

            target: params.target ? {
                resource_type: params.target.type,
                resource_id: params.target.id
            } : { resource_type: 'SYSTEM' },

            action: {
                operation: params.action,
                status: params.status,
                failure_reason: params.status !== 'SUCCESS' ? JSON.stringify(params.details) : undefined
            },

            metadata: params.details
        };

        // 4. Write to DB
        await AuditLog.create(logData);

        // 5. Trigger Threat Analysis (Asynchronous)
        if (params.status === 'FAILURE' ||
            ['LOGIN', 'UPLOAD', 'AUTHENTICATE', 'DELETE', 'UPDATE'].includes(params.action)) {
            analyzeThreats(ip, params.actor?.userId).catch(e =>
                console.error("Threat Analysis Trigger Failed:", e)
            );
        }

    } catch (error) {
        console.error("AUDIT LOG FAILURE:", error);
    }
}
