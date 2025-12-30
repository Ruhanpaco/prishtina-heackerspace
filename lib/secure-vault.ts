import crypto from 'node:crypto';

/**
 * TRIPLE-LAYER SECURITY VAULT
 * 
 * Layer 1: System-wide AES-256-GCM (Master Key)
 * Layer 2: Per-user AES-256-GCM (User UUID Key)
 * Layer 3: Envelope/Hmac Integrity Layer
 */

const ALGORITHM = 'aes-256-gcm';
const SYSTEM_KEY_BASE64 = process.env.IMAGE_ENCRYPTION_KEY!;
const PEPPER_KEY_BASE64 = process.env.IDENTITY_PEPPER!;

if (!SYSTEM_KEY_BASE64 || !PEPPER_KEY_BASE64) {
    throw new Error('Required encryption keys (IMAGE_ENCRYPTION_KEY, IDENTITY_PEPPER) are not set');
}

/**
 * Derives a 32-byte key from a secret string
 */
function deriveKey(secret: string): Buffer {
    return crypto.createHash('sha256').update(secret).digest();
}

const SYSTEM_MASTER_KEY = deriveKey(SYSTEM_KEY_BASE64);
const PEPPER_MASTER_KEY = deriveKey(PEPPER_KEY_BASE64);

interface SecureVaultEnvelope {
    encrypted: string;
    iv: string;
    authTag: string;
}

/**
 * QUAD-LAYER SECURITY VAULT
 * 
 * Layer 1: System-wide AES-256-GCM (Master Key)
 * Layer 2: Per-user AES-256-GCM (User UUID Key)
 * Layer 3: Structural Integrity (Envelope)
 * Layer 4: Secret Pepper AES-256-GCM (Environment Key)
 */
export function encryptSensitiveData(data: string, userUuid: string): SecureVaultEnvelope {
    try {
        // --- Layer 4: Secret Pepper (Innermost) ---
        const pepperIv = crypto.randomBytes(16);
        const pepperCipher = crypto.createCipheriv(ALGORITHM, PEPPER_MASTER_KEY, pepperIv);
        let layer4Encrypted = pepperCipher.update(data, 'utf8', 'base64');
        layer4Encrypted += pepperCipher.final('base64');
        const pepperTag = pepperCipher.getAuthTag();

        const layer4Payload = JSON.stringify({
            data: layer4Encrypted,
            iv: pepperIv.toString('base64'),
            tag: pepperTag.toString('base64')
        });

        // --- Layer 2: Per-User Encryption ---
        const userKey = deriveKey(userUuid);
        const userIv = crypto.randomBytes(16);
        const userCipher = crypto.createCipheriv(ALGORITHM, userKey, userIv);

        let layer2Encrypted = userCipher.update(layer4Payload, 'utf8', 'base64');
        layer2Encrypted += userCipher.final('base64');
        const userAuthTag = userCipher.getAuthTag();

        const layer2Payload = JSON.stringify({
            data: layer2Encrypted,
            iv: userIv.toString('base64'),
            tag: userAuthTag.toString('base64')
        });

        // --- Layer 1: System-Wide Encryption (Outermost) ---
        const systemIv = crypto.randomBytes(16);
        const systemCipher = crypto.createCipheriv(ALGORITHM, SYSTEM_MASTER_KEY, systemIv);

        let layer1Encrypted = systemCipher.update(layer2Payload, 'utf8', 'base64');
        layer1Encrypted += systemCipher.final('base64');
        const systemAuthTag = systemCipher.getAuthTag();

        return {
            encrypted: layer1Encrypted,
            iv: systemIv.toString('base64'),
            authTag: systemAuthTag.toString('base64'),
        };
    } catch (error) {
        console.error('SecureVault Encryption Error:', error);
        throw new Error('Failed to encrypt sensitive data securely');
    }
}

/**
 * QUAD-LAYER Security Vault Decryption
 */
export function decryptSensitiveData(envelope: SecureVaultEnvelope, userUuid: string): string {
    try {
        // --- Layer 1: System-Wide Decryption ---
        const systemIv = Buffer.from(envelope.iv, 'base64');
        const systemTag = Buffer.from(envelope.authTag, 'base64');
        const systemDecipher = crypto.createDecipheriv(ALGORITHM, SYSTEM_MASTER_KEY, systemIv);
        systemDecipher.setAuthTag(systemTag);

        let layer2PayloadRaw = systemDecipher.update(envelope.encrypted, 'base64', 'utf8');
        layer2PayloadRaw += systemDecipher.final('utf8');
        const layer2Payload = JSON.parse(layer2PayloadRaw);

        // --- Layer 2: Per-User Decryption ---
        const userKey = deriveKey(userUuid);
        const userIv = Buffer.from(layer2Payload.iv, 'base64');
        const userTag = Buffer.from(layer2Payload.tag, 'base64');
        const userDecipher = crypto.createDecipheriv(ALGORITHM, userKey, userIv);
        userDecipher.setAuthTag(userTag);

        let layer4PayloadRaw = userDecipher.update(layer2Payload.data, 'base64', 'utf8');
        layer4PayloadRaw += userDecipher.final('utf8');
        const layer4Payload = JSON.parse(layer4PayloadRaw);

        // --- Layer 4: Secret Pepper Decryption (Innermost) ---
        const pepperIv = Buffer.from(layer4Payload.iv, 'base64');
        const pepperTag = Buffer.from(layer4Payload.tag, 'base64');
        const pepperDecipher = crypto.createDecipheriv(ALGORITHM, PEPPER_MASTER_KEY, pepperIv);
        pepperDecipher.setAuthTag(pepperTag);

        let decrypted = pepperDecipher.update(layer4Payload.data, 'base64', 'utf8');
        decrypted += pepperDecipher.final('utf8');

        return decrypted;
    } catch (error) {
        console.error('SecureVault Decryption Error:', error);
        throw new Error('Failed to decrypt data. Key mismatch, missing pepper, or data tampering suspected.');
    }
}
