import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IIdentityArchive extends Document {
    userId: mongoose.Types.ObjectId;
    email: string;
    documentType: string;
    status: 'PENDING' | 'VERIFIED' | 'REJECTED' | 'ARCHIVED';
    rejectionReason?: string;
    documents: {
        data: string;
        iv: string;
        authTag: string;
        side?: string;
    }[];
    uploadedBy: {
        userId: string;
        email: string;
    };
    verifiedAt?: Date;
    verifiedBy?: mongoose.Types.ObjectId;
    forensics: {
        ipAddress: string;
        userAgent: string;
        fingerprint?: string;
        requestId?: string;
        deviceInfo?: any;
    };
    createdAt: Date;
    updatedAt: Date;
}

const IdentityArchiveSchema: Schema<IIdentityArchive> = new Schema(
    {
        userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
        email: { type: String, required: true, lowercase: true, index: true },
        documentType: { type: String, required: true },
        status: {
            type: String,
            enum: ['PENDING', 'VERIFIED', 'REJECTED', 'ARCHIVED'],
            default: 'PENDING',
            index: true
        },
        rejectionReason: { type: String },
        documents: [{
            data: { type: String, required: true },
            iv: { type: String, required: true },
            authTag: { type: String, required: true },
            side: { type: String }
        }],
        uploadedBy: {
            userId: { type: String, required: true },
            email: { type: String, required: true }
        },
        verifiedAt: { type: Date },
        verifiedBy: { type: Schema.Types.ObjectId, ref: 'User' },
        forensics: {
            ipAddress: { type: String, required: true },
            userAgent: { type: String, required: true },
            fingerprint: { type: String },
            requestId: { type: String },
            deviceInfo: { type: Schema.Types.Mixed }
        }
    },
    { timestamps: true }
);

// This collection is permanent, air-gapped from the User model for high-security isolation
const IdentityArchive: Model<IIdentityArchive> = mongoose.models.IdentityArchive || mongoose.model<IIdentityArchive>('IdentityArchive', IdentityArchiveSchema);
export default IdentityArchive;
