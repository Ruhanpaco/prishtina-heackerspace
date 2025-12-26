import { RateLimiter } from "limiter";

// Map to store limiters per IP/User for granular control
// In a serverless/Edge environment, use Redis/Upstash. For this VPS/stateful setup, Map is fine.
const limiters = new Map<string, RateLimiter>();

export function getRateLimiter(key: string, tokensOverride?: number, intervalOverride?: number | "hour" | "second" | "minute" | "day") {
    if (!limiters.has(key)) {
        // Default: 5 attempts per 1 minute
        limiters.set(key, new RateLimiter({
            tokensPerInterval: tokensOverride || 5,
            interval: intervalOverride || "minute",
            fireImmediately: true
        }));
    }
    return limiters.get(key)!;
}

export async function checkRateLimit(ip: string, action: string = "auth") {
    const key = `${action}:${ip}`;
    const limiter = getRateLimiter(key);
    const remainingRequests = await limiter.removeTokens(1);

    if (remainingRequests < 0) {
        return false; // Rate limit exceeded
    }
    return true; // Allowed
}
