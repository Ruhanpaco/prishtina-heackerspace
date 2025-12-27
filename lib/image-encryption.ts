import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const KEY_BASE64 = process.env.IMAGE_ENCRYPTION_KEY!;

if (!KEY_BASE64) {
    throw new Error('IMAGE_ENCRYPTION_KEY environment variable is not set');
}

// Derive a 32-byte key from the base64 secret
const KEY = crypto.createHash('sha256').update(KEY_BASE64).digest();

interface EncryptedData {
    encrypted: string;
    iv: string;
    authTag: string;
}

/**
 * Encrypt base64 image data
 */
export function encryptImage(base64Data: string): EncryptedData {
    try {
        // Generate random IV (initialization vector)
        const iv = crypto.randomBytes(16);

        // Create cipher
        const cipher = crypto.createCipheriv(ALGORITHM, KEY, iv);

        // Encrypt
        let encrypted = cipher.update(base64Data, 'utf8', 'base64');
        encrypted += cipher.final('base64');

        // Get auth tag for GCM mode
        const authTag = cipher.getAuthTag();

        return {
            encrypted,
            iv: iv.toString('base64'),
            authTag: authTag.toString('base64'),
        };
    } catch (error) {
        console.error('Error encrypting image:', error);
        throw new Error('Failed to encrypt image');
    }
}

/**
 * Decrypt base64 image data
 */
export function decryptImage(encrypted: string, ivBase64: string, authTagBase64: string): string {
    try {
        // Convert from base64
        const iv = Buffer.from(ivBase64, 'base64');
        const authTag = Buffer.from(authTagBase64, 'base64');

        // Create decipher
        const decipher = crypto.createDecipheriv(ALGORITHM, KEY, iv);
        decipher.setAuthTag(authTag);

        // Decrypt
        let decrypted = decipher.update(encrypted, 'base64', 'utf8');
        decrypted += decipher.final('utf8');

        return decrypted;
    } catch (error) {
        console.error('Error decrypting image:', error);
        throw new Error('Failed to decrypt image');
    }
}

/**
 * Validate image file
 */
export function validateImageFile(file: File): { valid: boolean; error?: string } {
    // Check file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
        return {
            valid: false,
            error: 'Invalid file type. Only JPEG, PNG, and WebP images are allowed.',
        };
    }

    // Check file size (5MB max)
    const maxSize = 5 * 1024 * 1024; // 5MB in bytes
    if (file.size > maxSize) {
        return {
            valid: false,
            error: 'File size exceeds 5MB. Please choose a smaller image.',
        };
    }

    return { valid: true };
}

/**
 * Validate document file
 */
export function validateDocumentFile(file: File): { valid: boolean; error?: string } {
    // Check file type (images and PDFs)
    const validTypes = [
        'image/jpeg',
        'image/jpg',
        'image/png',
        'image/webp',
        'application/pdf',
    ];

    if (!validTypes.includes(file.type)) {
        return {
            valid: false,
            error: 'Invalid file type. Only JPEG, PNG, WebP, and PDF files are allowed.',
        };
    }

    // Check file size (10MB max for documents)
    const maxSize = 10 * 1024 * 1024; // 10MB in bytes
    if (file.size > maxSize) {
        return {
            valid: false,
            error: 'File size exceeds 10MB. Please choose a smaller file.',
        };
    }

    return { valid: true };
}

/**
 * Convert File to base64
 */
export async function fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = () => {
            const result = reader.result as string;
            // Remove data URL prefix (e.g., "data:image/png;base64,")
            const base64 = result.split(',')[1];
            resolve(base64);
        };

        reader.onerror = () => {
            reject(new Error('Failed to read file'));
        };

        reader.readAsDataURL(file);
    });
}

/**
 * Compress image if needed (simple quality reduction)
 * Note: This is a basic implementation. For production, consider using a library like browser-image-compression
 */
export async function compressImage(base64: string, maxSizeMB: number): Promise<string> {
    // Calculate current size
    const currentSizeBytes = (base64.length * 3) / 4;
    const currentSizeMB = currentSizeBytes / (1024 * 1024);

    // If already under limit, return as-is
    if (currentSizeMB <= maxSizeMB) {
        return base64;
    }

    // For now, just return the original
    // In production, implement actual compression using canvas or a library
    console.warn(`Image size (${currentSizeMB.toFixed(2)}MB) exceeds limit (${maxSizeMB}MB). Compression not implemented yet.`);
    return base64;
}

/**
 * Get image dimensions from base64
 */
export function getImageDimensions(base64: string): Promise<{ width: number; height: number }> {
    return new Promise((resolve, reject) => {
        const img = new Image();

        img.onload = () => {
            resolve({
                width: img.width,
                height: img.height,
            });
        };

        img.onerror = () => {
            reject(new Error('Failed to load image'));
        };

        img.src = `data:image/png;base64,${base64}`;
    });
}

/**
 * Calculate base64 size in MB
 */
export function getBase64SizeMB(base64: string): number {
    const sizeBytes = (base64.length * 3) / 4;
    return sizeBytes / (1024 * 1024);
}
