import { NextRequest, NextResponse } from 'next/server';
import {
    verifyRefreshToken,
    generateAccessToken,
    generateRefreshToken,
    generateTokenId,
    blacklistToken,
} from '@/lib/jwt';
import dbConnect from '@/lib/mongodb/dbConnect';
import User from '@/models/User';
import { logActivity } from '@/lib/logger';

const MAX_REFRESH_TOKENS = parseInt(process.env.MAX_REFRESH_TOKENS_PER_USER || '5');
const REFRESH_TOKEN_LIFETIME = parseInt(process.env.REFRESH_TOKEN_LIFETIME || '604800');

export async function POST(req: NextRequest) {
    try {
        const refreshToken = req.cookies.get('refresh_token')?.value;
        if (!refreshToken) return NextResponse.json({ error: 'No refresh token provided' }, { status: 401 });

        const decoded = await verifyRefreshToken(refreshToken);
        if (!decoded) {
            await logActivity({
                eventType: "auth.token.refresh.failure",
                action: "AUTHENTICATE",
                status: "FAILURE",
                target: { type: "TOKEN" },
                details: { reason: "Invalid or expired refresh token" },
                severity: "WARNING"
            });
            return NextResponse.json({ error: 'Invalid, expired, or revoked refresh token' }, { status: 401 });
        }

        await dbConnect();
        const user = await User.findById(decoded.userId).select('+refreshTokens');
        if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

        const tokenIndex = user.refreshTokens.findIndex((t: any) => t.tokenId === decoded.tokenId);
        if (tokenIndex === -1) {
            await logActivity({
                eventType: "auth.token.refresh.failure",
                action: "AUTHENTICATE",
                status: "DENIED",
                actor: { userId: user._id.toString(), username: user.email },
                target: { type: "TOKEN", id: decoded.tokenId },
                details: { reason: "Token not found in user sessions (Reuse Detected?)" },
                severity: "CRITICAL"
            });
            return NextResponse.json({ error: 'Refresh token not found in user session' }, { status: 401 });
        }

        await blacklistToken(decoded.tokenId, user._id.toString(), 'ROTATION');
        user.refreshTokens.splice(tokenIndex, 1);

        const newAccessToken = await generateAccessToken({ userId: user._id.toString(), email: user.email, role: user.role });
        const newTokenId = generateTokenId();
        const newRefreshToken = await generateRefreshToken({ userId: user._id.toString(), tokenId: newTokenId });

        const userAgent = req.headers.get('user-agent') || undefined;
        const ipAddress = req.headers.get('x-forwarded-for')?.split(',')[0] || req.headers.get('x-real-ip') || undefined;

        user.refreshTokens.push({
            tokenId: newTokenId,
            expiresAt: new Date(Date.now() + REFRESH_TOKEN_LIFETIME * 1000),
            createdAt: new Date(),
            lastUsedAt: new Date(),
            userAgent,
            ipAddress,
        });

        if (user.refreshTokens.length > MAX_REFRESH_TOKENS) {
            const removed = user.refreshTokens.shift();
            if (removed) await blacklistToken(removed.tokenId, user._id.toString(), 'EXPIRED');
        }

        await user.save();

        const response = NextResponse.json({ message: 'Tokens refreshed successfully' });
        response.cookies.set('access_token', newAccessToken, { httpOnly: true, secure: true, sameSite: 'lax', maxAge: 900, path: '/' });
        response.cookies.set('refresh_token', newRefreshToken, { httpOnly: true, secure: true, sameSite: 'lax', maxAge: REFRESH_TOKEN_LIFETIME, path: '/' });

        await logActivity({
            eventType: "auth.token.refresh.success",
            action: "AUTHENTICATE",
            status: "SUCCESS",
            actor: { userId: user._id.toString(), username: user.email, role: user.role },
            target: { type: "TOKEN", id: newTokenId },
            severity: "INFO"
        });

        return response;
    } catch (error) {
        console.error('Error refreshing tokens:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
