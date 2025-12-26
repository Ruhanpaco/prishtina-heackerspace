import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IDocument extends Document {
    userId: mongoose.Types.ObjectId;
    type: 'MEMBERSHIP_AGREEMENT' | 'WAIVER';
    isSigned: boolean;
    signedAt?: Date;
    content?: string;
    createdAt: Date;
    updatedAt: Date;
}

const DocumentSchema: Schema<IDocument> = new Schema(
    {
        userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        type: { type: String, enum: ['MEMBERSHIP_AGREEMENT', 'WAIVER'], required: true },
        isSigned: { type: Boolean, default: false },
        signedAt: { type: Date },
        content: { type: String },
    },
    { timestamps: true }
);

const DocumentModel: Model<IDocument> = mongoose.models.Document || mongoose.model<IDocument>('Document', DocumentSchema);

export default DocumentModel;
