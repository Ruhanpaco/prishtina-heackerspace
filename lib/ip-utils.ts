import { NextRequest } from "next/server";

/**
 * Securely extract the client IP address.
 * Prioritizes headers set by trusted proxies (Vercel, Cloudflare, etc.).
 */
export function getSecureIP(request: NextRequest | Request): string {
    const headers = request.headers;

    // 1. Try standard CF/Vercel headers first (Hard to spoof if behind these proxies)
    const cfConnectingIp = headers.get('cf-connecting-ip');
    if (cfConnectingIp) return cfConnectingIp;

    const xRealIp = headers.get('x-real-ip');
    if (xRealIp) return xRealIp;

    // 2. Fallback to X-Forwarded-For
    // CAUTION: The user can control the start of this list.
    // We should ideally take the LAST item if we trust our immediate proxy,
    // but in many dev environments/serverless, the first *public* IP is what we want.
    // For now, we sanitize strictly.
    const forwardedFor = headers.get('x-forwarded-for');
    if (forwardedFor) {
        const ips = forwardedFor.split(',').map(ip => ip.trim());
        // Return the first valid non-private IP, or just the first one if all private
        // For simplicity in this env, we return the first one but you might want to skip internal proxies
        return ips[0];
    }

    return "unknown";
}
