import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ISession extends Document {
    user: mongoose.Types.ObjectId;
    uuid: string;
    ipAddress?: string;
    userAgent?: string;
    loginAt: Date;
    isValid: boolean;
    expiresAt?: Date;
}

const SessionSchema: Schema<ISession> = new Schema(
    {
        user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        uuid: { type: String, required: true },
        ipAddress: { type: String },
        userAgent: { type: String },
        loginAt: { type: Date, default: Date.now },
        isValid: { type: Boolean, default: true },
        expiresAt: { type: Date }, // Optional: for cleanup
    },
    { timestamps: true }
);

const Session: Model<ISession> = mongoose.models.Session || mongoose.model<ISession>('Session', SessionSchema);

export default Session;
