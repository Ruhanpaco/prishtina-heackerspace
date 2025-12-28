import jwt from 'jsonwebtoken';
import crypto from 'crypto';

/**
 * RFID Security Utility
 * 
 * This utility handles the creation and verification of tokens stored on physical RFID cards.
 * The tokens are signed JWTs that contain a unique API Key.
 * 
 * For 'encryption', we use standard JWT signing, but we can also add a secondary 
 * layer of AES encryption if the physical card reader supports it.
 */

const RFID_SECRET = process.env.RFID_SECRET || 'fallback-rfid-secret-highly-secure-123';

interface RfidTokenPayload {
    apiKey: string;
    iat: number;
}

/**
 * Generates a signed token to be written to an RFID card.
 * @param apiKey The unique API key generated for this specific RFID card.
 */
export function generateRfidToken(apiKey: string): string {
    return jwt.sign({ apiKey }, RFID_SECRET, { noTimestamp: false });
}

/**
 * Verifies and decodes a token provided by an RFID reader.
 * @param token The raw token string from the RFID card.
 */
export function verifyRfidToken(token: string): string | null {
    try {
        const decoded = jwt.verify(token, RFID_SECRET) as RfidTokenPayload;
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
