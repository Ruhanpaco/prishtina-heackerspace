import mongoose, { Schema, Document } from 'mongoose';

export interface ITokenBlacklist extends Document {
    tokenId: string;
    userId: string;
    reason: 'LOGOUT' | 'SECURITY' | 'EXPIRED' | 'ROTATION';
    blacklistedAt: Date;
    expiresAt: Date;
}

const TokenBlacklistSchema = new Schema<ITokenBlacklist>({
    tokenId: {
        type: String,
        required: true,
        index: true,
        unique: true,
    },
    userId: {
        type: String,
        required: true,
        index: true,
    },
    reason: {
        type: String,
        enum: ['LOGOUT', 'SECURITY', 'EXPIRED', 'ROTATION'],
        required: true,
    },
    blacklistedAt: {
        type: Date,
        required: true,
        default: Date.now,
    },
    expiresAt: {
        type: Date,
        required: true,
        index: true, // TTL index for auto-deletion
    },
});

// TTL index - automatically delete documents after expiry
TokenBlacklistSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Compound index for efficient lookups
TokenBlacklistSchema.index({ tokenId: 1, expiresAt: 1 });

const TokenBlacklist = mongoose.models.TokenBlacklist || mongoose.model<ITokenBlacklist>('TokenBlacklist', TokenBlacklistSchema);

export default TokenBlacklist;
