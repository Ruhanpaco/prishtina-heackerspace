import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import dbConnect from '@/lib/mongodb/dbConnect';

const JWT_SECRET = process.env.JWT_SECRET!;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET!;
const ACCESS_TOKEN_LIFETIME = parseInt(process.env.ACCESS_TOKEN_LIFETIME || '900'); // 15 minutes
const REFRESH_TOKEN_LIFETIME = parseInt(process.env.REFRESH_TOKEN_LIFETIME || '604800'); // 7 days

interface AccessTokenPayload {
    userId: string;
    email: string;
    role: string;
}

interface RefreshTokenPayload {
    userId: string;
    tokenId: string;
}

/**
 * Generate a unique token ID (264 bytes as specified)
 */
export function generateTokenId(): string {
    return crypto.randomBytes(264).toString('base64');
}

/**
 * Generate access token (short-lived)
 */
export function generateAccessToken(payload: AccessTokenPayload): string {
    return jwt.sign(payload, JWT_SECRET, {
        expiresIn: ACCESS_TOKEN_LIFETIME,
        algorithm: 'HS256',
    });
}

/**
 * Generate refresh token (long-lived)
 */
export function generateRefreshToken(payload: RefreshTokenPayload): string {
    return jwt.sign(payload, JWT_REFRESH_SECRET, {
        expiresIn: REFRESH_TOKEN_LIFETIME,
        algorithm: 'HS256',
    });
}

/**
 * Verify access token
 */
export function verifyAccessToken(token: string): AccessTokenPayload | null {
    try {
        const decoded = jwt.verify(token, JWT_SECRET, {
            algorithms: ['HS256'],
        }) as AccessTokenPayload;
        return decoded;
    } catch (error) {
        return null;
    }
}

/**
 * Verify refresh token
 */
export function verifyRefreshToken(token: string): RefreshTokenPayload | null {
    try {
        const decoded = jwt.verify(token, JWT_REFRESH_SECRET, {
            algorithms: ['HS256'],
        }) as RefreshTokenPayload;
        return decoded;
    } catch (error) {
        return null;
    }
}

/**
 * Check if token is blacklisted
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

/**
 * Blacklist a token
 */
export async function blacklistToken(
    tokenId: string,
    userId: string,
    reason: 'LOGOUT' | 'SECURITY' | 'EXPIRED' | 'ROTATION'
): Promise<void> {
    try {
        await dbConnect();
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

/**
 * Blacklist all tokens for a user
 */
export async function blacklistAllUserTokens(userId: string): Promise<void> {
    try {
        await dbConnect();
        const User = (await import('@/models/User')).default;

        const user = await User.findById(userId);
        if (!user) return;

        // Blacklist all refresh tokens
        const blacklistPromises = user.refreshTokens.map((token: any) =>
            blacklistToken(token.tokenId, userId, 'SECURITY')
        );

        await Promise.all(blacklistPromises);

        // Clear user's refresh tokens array
        user.refreshTokens = [];
        await user.save();
    } catch (error) {
        console.error('Error blacklisting all user tokens:', error);
        throw error;
    }
}

/**
 * Clean up expired blacklisted tokens (should be run periodically)
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
