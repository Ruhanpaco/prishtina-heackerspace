import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { auth } from '@/lib/auth';

// In-memory rate limiting (for production, use Redis/Upstash)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

// Rate limiting configuration
const RATE_LIMITS = {
    api: { requests: 100, window: 60000 }, // 100 requests per minute for API
    auth: { requests: 5, window: 60000 },  // 5 requests per minute for auth endpoints
    general: { requests: 200, window: 60000 } // 200 requests per minute for general pages
};

// Security headers
const SECURITY_HEADERS = {
    'X-DNS-Prefetch-Control': 'on',
    'Strict-Transport-Security': 'max-age=63072000; includeSubDomains; preload',
    'X-Frame-Options': 'SAMEORIGIN',
    'X-Content-Type-Options': 'nosniff',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
};

function getClientIP(request: NextRequest): string {
    return request.headers.get('x-forwarded-for')?.split(',')[0] ||
        request.headers.get('x-real-ip') ||
        'unknown';
}

function checkRateLimit(ip: string, path: string): boolean {
    const now = Date.now();

    // Determine rate limit based on path
    let limit = RATE_LIMITS.general;
    if (path.startsWith('/api/v1/auth')) {
        limit = RATE_LIMITS.auth;
    } else if (path.startsWith('/api')) {
        limit = RATE_LIMITS.api;
    }

    const key = `${ip}:${path.split('/')[1] || 'root'}`;
    const record = rateLimitMap.get(key);

    if (!record || now > record.resetTime) {
        // Reset or create new record
        rateLimitMap.set(key, { count: 1, resetTime: now + limit.window });
        return true;
    }

    if (record.count >= limit.requests) {
        return false; // Rate limit exceeded
    }

    record.count++;
    return true;
}

function detectSuspiciousActivity(request: NextRequest): boolean {
    const userAgent = request.headers.get('user-agent') || '';

    // Block known bad bots (basic check)
    const suspiciousPatterns = [
        /curl/i,
        /wget/i,
        /python-requests/i,
        /scrapy/i,
        /bot/i,
        /crawler/i,
        /spider/i
    ];

    // Allow legitimate bots (Google, Bing, etc.)
    const allowedBots = [
        /googlebot/i,
        /bingbot/i,
        /slackbot/i,
        /twitterbot/i,
        /facebookexternalhit/i
    ];

    const isSuspicious = suspiciousPatterns.some(pattern => pattern.test(userAgent));
    const isAllowed = allowedBots.some(pattern => pattern.test(userAgent));

    return isSuspicious && !isAllowed;
}

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;
    const ip = getClientIP(request);

    // 1. Security Headers
    const response = NextResponse.next();
    Object.entries(SECURITY_HEADERS).forEach(([key, value]) => {
        response.headers.set(key, value);
    });

    // 2. Rate Limiting
    if (!checkRateLimit(ip, pathname)) {
        return new NextResponse(
            JSON.stringify({ error: 'Too many requests. Please try again later.' }),
            {
                status: 429,
                headers: {
                    'Content-Type': 'application/json',
                    'Retry-After': '60',
                    ...SECURITY_HEADERS
                }
            }
        );
    }

    // 3. Bot Detection (only for sensitive endpoints)
    if (pathname.startsWith('/api/v1/auth') && detectSuspiciousActivity(request)) {
        return new NextResponse(
            JSON.stringify({ error: 'Forbidden' }),
            {
                status: 403,
                headers: {
                    'Content-Type': 'application/json',
                    ...SECURITY_HEADERS
                }
            }
        );
    }

    // 4. Authentication Check for Protected Routes
    const protectedPaths = ['/dashboard'];
    const isProtectedPath = protectedPaths.some(path => pathname.startsWith(path));

    if (isProtectedPath) {
        const session = await auth();

        if (!session?.user) {
            const url = request.nextUrl.clone();
            url.pathname = '/auth/login';
            url.searchParams.set('callbackUrl', pathname);
            return NextResponse.redirect(url);
        }

        // Add user info to response headers for debugging (optional)
        response.headers.set('X-User-ID', session.user.id || 'unknown');
    }

    // 5. CORS for API routes (if needed for external access)
    if (pathname.startsWith('/api')) {
        response.headers.set('Access-Control-Allow-Credentials', 'true');
        response.headers.set('Access-Control-Allow-Origin', process.env.NEXTAUTH_URL || '*');
        response.headers.set('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,PATCH,OPTIONS');
        response.headers.set('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization');

        // Handle preflight requests
        if (request.method === 'OPTIONS') {
            return new NextResponse(null, { status: 200, headers: response.headers });
        }
    }

    return response;
}

export const config = {
    matcher: [
        /*
         * Match all request paths except:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - public folder
         */
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
};
