import { SignJWT, jwtVerify } from 'jose';
import crypto from 'node:crypto';
import dbConnect from '@/lib/mongodb/dbConnect';

/**
 * UNIFIED JWT MODULE
 * Standardizes cryptographic operations across the platform.
 * Requirement: AUTH_SECRET must be set in the environment.
 */

const AUTH_SECRET = process.env.AUTH_SECRET;
if (!AUTH_SECRET) {
    throw new Error("CRITICAL SECURITY ERROR: AUTH_SECRET is not defined. Authentication will fail.");
}

const key = new TextEncoder().encode(AUTH_SECRET);

export interface AccessTokenPayload {
    userId: string;
    email: string;
    role: string;
    username?: string;
    membershipStatus?: string;
}

export interface RefreshTokenPayload {
    userId: string;
    tokenId: string;
}

const ACCESS_TOKEN_LIFETIME = parseInt(process.env.ACCESS_TOKEN_LIFETIME || '900'); // 15 minutes
export const REFRESH_TOKEN_LIFETIME = parseInt(process.env.REFRESH_TOKEN_LIFETIME || '604800'); // 7 days

/**
 * Generate a cryptographically secure random token ID
 */
export function generateTokenId(): string {
    return crypto.randomBytes(264).toString('base64');
}

/**
 * Signs a payload into a JWT
 */
export async function signJWT(payload: any, expiresIn: string | number = '24h') {
    return await new SignJWT(payload)
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime(typeof expiresIn === 'number' ? `${expiresIn}s` : expiresIn)
        .sign(key);
}

/**
 * Verifies and decodes a JWT with strict signature checking
 */
export async function verifyJWT<T = any>(token: string): Promise<T | null> {
    try {
        const { payload } = await jwtVerify(token, key, {
            algorithms: ['HS256'],
        });
        return payload as T;
    } catch (error) {
        return null;
    }
}

/**
 * Specialized Access Token Logic
 */
export async function generateAccessToken(payload: AccessTokenPayload): Promise<string> {
    return signJWT(payload, ACCESS_TOKEN_LIFETIME);
}

export async function verifyAccessToken(token: string): Promise<AccessTokenPayload | null> {
    return verifyJWT<AccessTokenPayload>(token);
}

/**
 * Specialized Refresh Token Logic with Blacklist Check
 */
export async function generateRefreshToken(payload: RefreshTokenPayload): Promise<string> {
    return signJWT(payload, REFRESH_TOKEN_LIFETIME);
}

export async function verifyRefreshToken(token: string): Promise<RefreshTokenPayload | null> {
    const decoded = await verifyJWT<RefreshTokenPayload>(token);
    if (!decoded || !decoded.tokenId) return null;

    // Check if token is blacklisted
    const blacklisted = await isTokenBlacklisted(decoded.tokenId);
    if (blacklisted) {
        console.warn(`Blocked attempt to use revoked token: ${decoded.tokenId}`);
        return null;
    }

    return decoded;
}

/**
 * Token Blacklisting Logic (Persistence Layer)
 */
export async function isTokenBlacklisted(tokenId: string): Promise<boolean> {
    try {
        await dbConnect();
        const TokenBlacklist = (await import('@/models/TokenBlacklist')).default;
        const blacklisted = await TokenBlacklist.findOne({
            tokenId,
            expiresAt: { $gt: new Date() },
        });
        return !!blacklisted;
    } catch (error) {
        console.error('Error checking token blacklist:', error);
        return false;
    }
}

export async function blacklistToken(
    tokenId: string,
    userId: string,
    reason: 'LOGOUT' | 'SECURITY' | 'EXPIRED' | 'ROTATION'
): Promise<void> {
    try {
        await dbConnect();
        const TokenBlacklist = (await import('@/models/TokenBlacklist')).default;
        const expiresAt = new Date(Date.now() + REFRESH_TOKEN_LIFETIME * 1000);

        await TokenBlacklist.create({
            tokenId,
            userId,
            reason,
            blacklistedAt: new Date(),
            expiresAt,
        });
    } catch (error) {
        console.error('Error blacklisting token:', error);
        throw error;
    }
}

export async function blacklistAllUserTokens(userId: string): Promise<void> {
    try {
        await dbConnect();
        const User = (await import('@/models/User')).default;
        const user = await User.findById(userId);
        if (!user) return;

        const blacklistPromises = user.refreshTokens.map((token: any) =>
            blacklistToken(token.tokenId, userId, 'SECURITY')
        );

        await Promise.all(blacklistPromises);
        user.refreshTokens = [];
        await user.save();
    } catch (error) {
        console.error('Error blacklisting all user tokens:', error);
        throw error;
    }
}

/**
 * Clean up expired blacklisted tokens
 */
export async function cleanupExpiredTokens(): Promise<void> {
    try {
        await dbConnect();
        const TokenBlacklist = (await import('@/models/TokenBlacklist')).default;
        await TokenBlacklist.deleteMany({
            expiresAt: { $lt: new Date() },
        });
    } catch (error) {
        console.error('Error cleaning up expired tokens:', error);
    }
}
