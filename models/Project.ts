import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IProject extends Document {
    name: string;
    slug: string;
    description: string;
    owner: mongoose.Types.ObjectId;
    members: mongoose.Types.ObjectId[];
    status: 'PLANNING' | 'IN_PROGRESS' | 'COMPLETED' | 'ON_HOLD' | 'ARCHIVED';
    visibility: 'PUBLIC' | 'PRIVATE' | 'INTERNAL';
    progress: number;
    role: string; // The role of the owner/creator in this project
    tags: string[];
    links: { platform: string; url: string }[];
    thumbnail?: string;
    createdAt: Date;
    updatedAt: Date;
}

const ProjectSchema: Schema<IProject> = new Schema(
    {
        name: { type: String, required: true, trim: true },
        slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
        description: { type: String, required: true },
        owner: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
        members: [{ type: Schema.Types.ObjectId, ref: 'User' }],
        status: {
            type: String,
            enum: ['PLANNING', 'IN_PROGRESS', 'COMPLETED', 'ON_HOLD', 'ARCHIVED'],
            default: 'PLANNING'
        },
        visibility: {
            type: String,
            enum: ['PUBLIC', 'PRIVATE', 'INTERNAL'],
            default: 'PUBLIC'
        },
        progress: { type: Number, min: 0, max: 100, default: 0 },
        role: { type: String, default: 'Lead' },
        tags: { type: [String], default: [] },
        links: [{
            platform: { type: String },
            url: { type: String }
        }],
        thumbnail: { type: String },
    },
    { timestamps: true }
);

// Middleware to generate slug from name if not provided
ProjectSchema.pre('validate', async function () {
    if (this.name && !this.slug) {
        this.slug = this.name
            .toLowerCase()
            .replace(/[^\w ]+/g, '')
            .replace(/ +/g, '-');
    }
});

const Project: Model<IProject> = mongoose.models.Project || mongoose.model<IProject>('Project', ProjectSchema);
export default Project;
