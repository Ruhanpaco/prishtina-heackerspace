import { SignJWT, jwtVerify } from 'jose';
import crypto from 'node:crypto';

/**
 * RFID Security Utility
 * 
 * Handles creation and verification of tokens stored on physical RFID cards.
 * Requirement: RFID_SECRET must be set in the environment.
 */

function getRfidSecret(): Uint8Array {
    const RFID_SECRET = process.env.RFID_SECRET;
    if (!RFID_SECRET) {
        throw new Error("CRITICAL SECURITY ERROR: RFID_SECRET is not defined. Hardware authentication will fail.");
    }
    return new TextEncoder().encode(RFID_SECRET);
}

interface RfidTokenPayload {
    apiKey: string;
    iat?: number;
}

/**
 * Generates a signed token for an RFID card.
 */
export async function generateRfidToken(apiKey: string): Promise<string> {
    const key = getRfidSecret();
    return await new SignJWT({ apiKey })
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .sign(key);
}

/**
 * Verifies and decodes an RFID token.
 */
export async function verifyRfidToken(token: string): Promise<string | null> {
    try {
        const key = getRfidSecret();
        const { payload } = await jwtVerify(token, key, {
            algorithms: ['HS256'],
        });
        const decoded = payload as unknown as RfidTokenPayload;
        return decoded.apiKey;
    } catch (error) {
        console.error('RFID Token Verification Failed:', error);
        return null;
    }
}

/**
 * Generates a random secure API key for a new RFID card.
 */
export function generateRfidApiKey(): string {
    return crypto.randomBytes(32).toString('hex');
}
