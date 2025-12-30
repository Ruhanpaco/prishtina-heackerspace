import "server-only";
import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const SALT_LENGTH = 64;
const KEY_LENGTH = 32;
const ITERATIONS = 100000;

/**
 * Gets the master encryption key from environment or fallback
 */
function getMasterKey(): string {
    const secret = process.env.PAYMENT_PROOF_SECRET;
    if (!secret) {
        throw new Error("CRITICAL SECURITY ERROR: PAYMENT_PROOF_SECRET is not defined. Document decryption will fail.");
    }
    return secret;
}

/**
 * Encrypts a buffer using AES-256-GCM
 * Returns a string format: salt:iv:authTag:encryptedContent
 */
export function encryptBuffer(buffer: Buffer): string {
    const salt = crypto.randomBytes(SALT_LENGTH);
    const key = crypto.pbkdf2Sync(getMasterKey(), salt, ITERATIONS, KEY_LENGTH, 'sha512');
    const iv = crypto.randomBytes(IV_LENGTH);

    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

    const encrypted = Buffer.concat([cipher.update(buffer), cipher.final()]);
    const authTag = cipher.getAuthTag();

    return [
        salt.toString('hex'),
        iv.toString('hex'),
        authTag.toString('hex'),
        encrypted.toString('hex')
    ].join(':');
}

/**
 * Decrypts a string format: salt:iv:authTag:encryptedContent
 */
export function decryptBuffer(encryptedString: string): Buffer {
    const [saltHex, ivHex, authTagHex, encryptedHex] = encryptedString.split(':');

    if (!saltHex || !ivHex || !authTagHex || !encryptedHex) {
        throw new Error('Invalid encrypted string format');
    }

    const salt = Buffer.from(saltHex, 'hex');
    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');
    const encrypted = Buffer.from(encryptedHex, 'hex');

    const key = crypto.pbkdf2Sync(getMasterKey(), salt, ITERATIONS, KEY_LENGTH, 'sha512');

    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(authTag);

    return Buffer.concat([decipher.update(encrypted), decipher.final()]);
}

/**
 * Encrypts a string (UTF-8)
 */
export function encryptString(text: string): string {
    return encryptBuffer(Buffer.from(text, 'utf-8'));
}

/**
 * Decrypts to a string (UTF-8)
 */
export function decryptToString(encryptedString: string): string {
    return decryptBuffer(encryptedString).toString('utf-8');
}
