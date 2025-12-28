import { NextRequest, NextResponse } from 'next/server';
import {
    verifyRefreshToken,
    generateAccessToken,
    generateRefreshToken,
    generateTokenId,
    isTokenBlacklisted,
    blacklistToken,
} from '@/lib/token-utils';
import dbConnect from '@/lib/mongodb/dbConnect';
import User from '@/models/User';

const MAX_REFRESH_TOKENS = parseInt(process.env.MAX_REFRESH_TOKENS_PER_USER || '5');
const REFRESH_TOKEN_LIFETIME = parseInt(process.env.REFRESH_TOKEN_LIFETIME || '604800'); // 7 days

export async function POST(req: NextRequest) {
    try {
        // Get refresh token from cookie
        const refreshToken = req.cookies.get('refresh_token')?.value;

        if (!refreshToken) {
            return NextResponse.json(
                { error: 'No refresh token provided' },
                { status: 401 }
            );
        }

        // Verify refresh token
        const decoded = verifyRefreshToken(refreshToken);
        if (!decoded) {
            return NextResponse.json(
                { error: 'Invalid or expired refresh token' },
                { status: 401 }
            );
        }

        // Check if token is blacklisted
        const blacklisted = await isTokenBlacklisted(decoded.tokenId);
        if (blacklisted) {
            return NextResponse.json(
                { error: 'Refresh token has been revoked' },
                { status: 401 }
            );
        }

        // Get user from database
        await dbConnect();
        const user = await User.findById(decoded.userId).select('+refreshTokens');

        if (!user) {
            return NextResponse.json(
                { error: 'User not found' },
                { status: 404 }
            );
        }

        // Verify token exists in user's refresh tokens
        const tokenIndex = user.refreshTokens.findIndex(
            (t: any) => t.tokenId === decoded.tokenId
        );

        if (tokenIndex === -1) {
            return NextResponse.json(
                { error: 'Refresh token not found in user session' },
                { status: 401 }
            );
        }

        // Blacklist old refresh token (token rotation)
        await blacklistToken(decoded.tokenId, user._id.toString(), 'ROTATION');

        // Remove old token from user's array
        user.refreshTokens.splice(tokenIndex, 1);

        // Generate new tokens
        const newAccessToken = generateAccessToken({
            userId: user._id.toString(),
            email: user.email,
            role: user.role,
        });

        const newTokenId = generateTokenId();
        const newRefreshToken = generateRefreshToken({
            userId: user._id.toString(),
            tokenId: newTokenId,
        });

        // Get user agent and IP
        const userAgent = req.headers.get('user-agent') || undefined;
        const ipAddress =
            req.headers.get('x-forwarded-for')?.split(',')[0] ||
            req.headers.get('x-real-ip') ||
            undefined;

        // Add new refresh token to user
        user.refreshTokens.push({
            tokenId: newTokenId,
            expiresAt: new Date(Date.now() + REFRESH_TOKEN_LIFETIME * 1000),
            createdAt: new Date(),
            lastUsedAt: new Date(),
            userAgent,
            ipAddress,
        });

        // Limit number of refresh tokens (remove oldest if exceeded)
        if (user.refreshTokens.length > MAX_REFRESH_TOKENS) {
            const removed = user.refreshTokens.shift();
            if (removed) {
                await blacklistToken(removed.tokenId, user._id.toString(), 'EXPIRED');
            }
        }

        await user.save();

        // Set new cookies
        const response = NextResponse.json({
            message: 'Tokens refreshed successfully',
        });

        // Set access token cookie (15 minutes)
        response.cookies.set('access_token', newAccessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 900, // 15 minutes
            path: '/',
        });

        // Set refresh token cookie (7 days)
        response.cookies.set('refresh_token', newRefreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: REFRESH_TOKEN_LIFETIME,
            path: '/',
        });

        return response;
    } catch (error) {
        console.error('Error refreshing tokens:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
