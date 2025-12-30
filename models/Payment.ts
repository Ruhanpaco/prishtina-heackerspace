import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IPayment extends Document {
    userId: mongoose.Types.ObjectId;
    amount: number;
    currency: string;
    tier: 'ENTHUSIAST' | 'PRO' | 'ELITE' | 'NONE';
    status: 'PENDING' | 'COMPLETED' | 'FAILED';
    method: 'CASH' | 'BANK_TRANSFER' | 'OTHER';
    reference?: string;
    proofOfPayment?: string; // Reference id or encrypted blob link
    proofMimeType?: string; // e.g., image/jpeg, application/pdf
    verificationNote?: string;
    verifiedBy?: mongoose.Types.ObjectId;
    verifiedAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}

const PaymentSchema: Schema<IPayment> = new Schema(
    {
        userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
        amount: { type: Number, required: true },
        currency: { type: String, default: 'EUR' },
        tier: { type: String, enum: ['ENTHUSIAST', 'PRO', 'ELITE', 'NONE'], required: true },
        status: { type: String, enum: ['PENDING', 'COMPLETED', 'FAILED'], default: 'PENDING', index: true },
        method: { type: String, enum: ['CASH', 'BANK_TRANSFER', 'OTHER'], required: true },
        reference: { type: String },
        proofOfPayment: { type: String },
        proofMimeType: { type: String },
        verificationNote: { type: String },
        verifiedBy: { type: Schema.Types.ObjectId, ref: 'User', index: true },
        verifiedAt: { type: Date },
    },
    { timestamps: true }
);

const Payment: Model<IPayment> = mongoose.models.Payment || mongoose.model<IPayment>('Payment', PaymentSchema);

export default Payment;
