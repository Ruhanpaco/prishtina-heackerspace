import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth.config";
import { NextResponse, type NextRequest } from "next/server";
import { getSecureIP } from "@/lib/ip-utils";

// Initialize NextAuth
const { auth } = NextAuth(authConfig);

// In-memory rate limiting (Per-lambda instance)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

// Rate limiting configuration
const RATE_LIMITS = {
    api: { requests: 100, window: 60000 },
    auth: { requests: 10, window: 60000 },
    general: { requests: 200, window: 60000 }
};

// Security headers
const SECURITY_HEADERS = {
    'X-DNS-Prefetch-Control': 'on',
    'Strict-Transport-Security': 'max-age=63072000; includeSubDomains; preload',
    'X-Frame-Options': 'SAMEORIGIN',
    'X-Content-Type-Options': 'nosniff',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), payment=()',
};

// Content Security Policy
function getCSP() {
    // strict-dynamic would be better with nonces, but 'unsafe-inline' is often needed for Tailwind/Nextjs in 'dev' unless configured strictly
    // We allow 'unsafe-eval' in dev for hot reloading, block in prod ideally.
    // For this implementation, we use a balanced policy.
    const isProd = process.env.NODE_ENV === 'production';

    // Note: Next.js images often data: blobs.
    return [
        "default-src 'self'",
        "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdnjs.cloudflare.com", // unsafe-eval often needed for Next.js dev
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
        "img-src 'self' data: https://blob: https://*.googleusercontent.com", // Google Auth images
        "font-src 'self' https://fonts.gstatic.com",
        "connect-src 'self' https://vitals.vercel-insights.com", // Vercel Analytics
        "frame-ancestors 'none'",
        "upgrade-insecure-requests"
    ].join('; ');
}

function checkRateLimit(ip: string, path: string): boolean {
    const now = Date.now();
    let limit = RATE_LIMITS.general;
    if (path.startsWith('/api/v2/POST/auth') || path.startsWith('/api/v2/PATCH/auth')) limit = RATE_LIMITS.auth;
    else if (path.startsWith('/api')) limit = RATE_LIMITS.api;

    const key = `${ip}:${path.split('/')[1] || 'root'}`;
    const record = rateLimitMap.get(key);

    if (!record || now > record.resetTime) {
        rateLimitMap.set(key, { count: 1, resetTime: now + limit.window });
        return true;
    }

    if (record.count >= limit.requests) return false;

    record.count++;
    return true;
}

function detectSuspiciousActivity(request: NextRequest): boolean {
    const userAgent = request.headers.get('user-agent') || '';
    const suspiciousPatterns = [/curl/i, /wget/i, /python-requests/i, /scrapy/i];
    const allowedBots = [/googlebot/i, /bingbot/i, /slackbot/i, /twitterbot/i];

    const isSuspicious = suspiciousPatterns.some(p => p.test(userAgent));
    const isAllowed = allowedBots.some(p => p.test(userAgent));
    return isSuspicious && !isAllowed;
}

// Whitelisted public API routes
const PUBLIC_API_ROUTES = [
    '/api/v2/POST/auth/login',
    '/api/v2/POST/auth/signup',
];

// Methods that require CSRF protection
const MUTATION_METHODS = ['POST', 'PUT', 'PATCH', 'DELETE'];

export default auth(async function middleware(req) {
    const { pathname } = req.nextUrl;
    const ip = getSecureIP(req);

    // 1. Rate Limiting
    if (!checkRateLimit(ip, pathname)) {
        return new NextResponse(
            JSON.stringify({ error: 'Too many requests' }),
            { status: 429, headers: { 'Content-Type': 'application/json', 'Retry-After': '60' } }
        );
    }

    // 2. Security Headers & CSP
    const response = NextResponse.next();
    Object.entries(SECURITY_HEADERS).forEach(([key, value]) => {
        response.headers.set(key, value);
    });
    response.headers.set('Content-Security-Policy', getCSP());

    // 3. API V2 Protection (Default Deny)
    if (pathname.startsWith('/api/v2')) {
        // Skip auth check for whitelisted routes
        if (!PUBLIC_API_ROUTES.some(route => pathname.startsWith(route))) {
            const hasApiKey = req.headers.has('x-api-key');
            const hasAuthHeader = req.headers.has('authorization');
            const session = req.auth;

            // Reject if no credential present at all
            if (!session && !hasApiKey && !hasAuthHeader) {
                return new NextResponse(
                    JSON.stringify({ error: 'Authentication required' }),
                    { status: 401, headers: { 'Content-Type': 'application/json' } }
                );
            }

            // 4. CSRF Protection for Session-based mutations
            if (session && MUTATION_METHODS.includes(req.method)) {
                const csrfToken = req.headers.get('x-csrf-token');
                if (!csrfToken) {
                    return new NextResponse(
                        JSON.stringify({ error: 'CSRF token missing' }),
                        { status: 403, headers: { 'Content-Type': 'application/json' } }
                    );
                }
            }
        }

        // 5. CORS Enforcement
        const origin = req.headers.get('origin');
        const allowedOrigin = process.env.NEXTAUTH_URL;

        if (origin && allowedOrigin && origin === allowedOrigin) {
            response.headers.set('Access-Control-Allow-Credentials', 'true');
            response.headers.set('Access-Control-Allow-Origin', origin);
            response.headers.set('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,PATCH,OPTIONS');
            response.headers.set('Access-Control-Allow-Headers', 'X-CSRF-Token, X-API-KEY, Authorization, Content-Type');
        }

        if (req.method === 'OPTIONS') {
            return new NextResponse(null, { status: 200, headers: response.headers });
        }
    }

    return response;
});

export const config = {
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
};
