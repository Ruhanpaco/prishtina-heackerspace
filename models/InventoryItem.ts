import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IInventoryItem extends Document {
    name: string;
    manufacturer?: string;
    description?: string;
    category: string;
    subCategory?: string;
    unit: string; // e.g., "pcs", "meters", "kits"
    quantity: number;
    location: string; // e.g., "Shelf A", "Storage Bin 4"

    // Usage Tracking
    inUse: boolean;
    inUseBy?: mongoose.Types.ObjectId;

    // Technical Specs
    electricSpecs?: {
        voltage?: string;
        current?: string;
        power?: string;
        notes?: string;
    };

    // Audit & Metadata
    metadata?: Record<string, any>;
    createdAt: Date;
    updatedAt: Date;
}

const InventoryItemSchema: Schema<IInventoryItem> = new Schema(
    {
        name: { type: String, required: true, trim: true, index: true },
        manufacturer: { type: String, trim: true },
        description: { type: String, trim: true },
        category: { type: String, required: true, index: true },
        subCategory: { type: String, trim: true },
        unit: { type: String, default: 'pcs' },
        quantity: { type: Number, default: 0, min: 0 },
        location: { type: String, required: true, index: true },

        // Usage Tracking
        inUse: { type: Boolean, default: false },
        inUseBy: { type: Schema.Types.ObjectId, ref: 'User' },

        // Technical Specs
        electricSpecs: {
            voltage: { type: String },
            current: { type: String },
            power: { type: String },
            notes: { type: String },
        },

        metadata: { type: Schema.Types.Mixed, default: {} },
    },
    { timestamps: true }
);

// Search optimization
InventoryItemSchema.index({ name: 'text', description: 'text', manufacturer: 'text' });

const InventoryItem: Model<IInventoryItem> = mongoose.models.InventoryItem || mongoose.model<IInventoryItem>('InventoryItem', InventoryItemSchema);

export default InventoryItem;
