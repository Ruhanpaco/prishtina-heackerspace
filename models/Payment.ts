import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IPayment extends Document {
    userId: mongoose.Types.ObjectId;
    amount: number;
    status: 'PENDING' | 'COMPLETED' | 'FAILED';
    method?: string;
    reference?: string;
    createdAt: Date;
    updatedAt: Date;
}

const PaymentSchema: Schema<IPayment> = new Schema(
    {
        userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        amount: { type: Number, required: true },
        status: { type: String, enum: ['PENDING', 'COMPLETED', 'FAILED'], default: 'PENDING' },
        method: { type: String },
        reference: { type: String },
    },
    { timestamps: true }
);

const Payment: Model<IPayment> = mongoose.models.Payment || mongoose.model<IPayment>('Payment', PaymentSchema);

export default Payment;
