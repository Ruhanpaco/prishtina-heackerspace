import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IUser extends Document {
    // Identity
    name: string;
    username: string;
    email: string;
    secondaryEmails: string[];
    pendingEmail?: string;
    password?: string;
    image?: string;

    // Profile
    bio?: string;
    title?: string; // e.g. "Full Stack Developer"
    phoneNumber?: string;
    location?: string;
    website?: string;

    // Professional & Social
    skills: string[];
    interests: string[];
    projects: string[];
    links: { platform: string; url: string; id: string }[]; // Dynamic links
    socials?: {
        github?: string;
        twitter?: string;
        linkedin?: string;
        instagram?: string;
        thirdParty?: string;
    };
    badges: string[]; // Achievement badges

    // Membership & Access
    role: 'ADMIN' | 'STAFF' | 'MEMBER' | 'USER';
    membershipStatus: 'ACTIVE' | 'INACTIVE' | 'PENDING' | 'SUSPENDED';
    hasAccess: boolean; // Door access control
    rfidTag?: string;   // Physical card ID

    // Token Management
    refreshTokens: {
        tokenId: string;
        expiresAt: Date;
        createdAt: Date;
        lastUsedAt: Date;
        userAgent?: string;
        ipAddress?: string;
    }[];

    // Encrypted Image Storage
    profileImage?: {
        data: string; // Encrypted base64
        iv: string;   // Initialization vector
        authTag: string; // GCM auth tag
        uploadedAt: Date;
    };

    // Encrypted Document Storage
    documents: {
        type: 'ID_CARD' | 'PASSPORT' | 'DRIVER_LICENSE' | 'OTHER';
        name: string;
        data: string; // Encrypted base64
        iv: string;
        authTag: string;
        uploadedAt: Date;
        verifiedAt?: Date;
    }[];

    uuid?: string;
    emailVerified?: Date;
    verificationToken?: string;
    verificationTokenExpires?: Date;
    lastLogin?: Date;
    lastLoginIP?: string;
    currentIP?: string;
    createdAt: Date;
    updatedAt: Date;
}

const UserSchema: Schema<IUser> = new Schema(
    {
        // Identity
        name: { type: String, trim: true },
        username: { type: String, required: true, unique: true, trim: true, index: true },
        email: { type: String, required: true, unique: true, trim: true, lowercase: true },
        secondaryEmails: { type: [String], default: [] },
        pendingEmail: { type: String, trim: true, lowercase: true, select: false },
        password: { type: String, select: false }, // Do not return password by default
        image: { type: String },

        // Profile
        bio: { type: String, maxlength: 500 },
        title: { type: String },
        phoneNumber: { type: String },
        location: { type: String },
        website: { type: String },

        // Professional & Social
        skills: { type: [String], default: [] },
        interests: { type: [String], default: [] },
        projects: { type: [String], default: [] },
        links: {
            type: [{
                platform: { type: String },
                url: { type: String },
                id: { type: String }
            }],
            default: []
        },
        socials: {
            github: { type: String },
            twitter: { type: String },
            linkedin: { type: String },
            instagram: { type: String },
            thirdParty: { type: String },
        },
        badges: { type: [String], default: [] },

        // Membership & Access
        role: { type: String, enum: ['ADMIN', 'STAFF', 'MEMBER', 'USER'], default: 'USER' },
        membershipStatus: { type: String, enum: ['ACTIVE', 'INACTIVE', 'PENDING', 'SUSPENDED'], default: 'PENDING' },
        hasAccess: { type: Boolean, default: false },
        rfidTag: { type: String, sparse: true, unique: true }, // Sparse allows null/undefined to be non-unique

        // Token Management
        refreshTokens: {
            type: [{
                tokenId: { type: String, required: true },
                expiresAt: { type: Date, required: true },
                createdAt: { type: Date, default: Date.now },
                lastUsedAt: { type: Date, default: Date.now },
                userAgent: { type: String },
                ipAddress: { type: String },
            }],
            default: [],
            select: false, // Don't return by default
        },

        // Encrypted Image Storage
        profileImage: {
            data: { type: String }, // Encrypted base64
            iv: { type: String },   // Initialization vector
            authTag: { type: String }, // GCM auth tag
            uploadedAt: { type: Date },
        },

        // Encrypted Document Storage
        documents: {
            type: [{
                type: { type: String, enum: ['ID_CARD', 'PASSPORT', 'DRIVER_LICENSE', 'OTHER'], required: true },
                name: { type: String, required: true },
                data: { type: String, required: true }, // Encrypted base64
                iv: { type: String, required: true },
                authTag: { type: String, required: true },
                uploadedAt: { type: Date, default: Date.now },
                verifiedAt: { type: Date },
            }],
            default: [],
            select: false, // Don't return by default for security
        },

        // System
        emailVerified: { type: Date },
        verificationToken: { type: String, select: false },
        verificationTokenExpires: { type: Date, select: false },
        lastLogin: { type: Date },
        lastLoginIP: { type: String },
        currentIP: { type: String },
    },
    { timestamps: true }
);

// Methods or Virtuals can be added here

// Force model recompilation in dev to catch schema changes
if (process.env.NODE_ENV === "development") {
    if (mongoose.models.User) {
        delete mongoose.models.User;
    }
}

const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
export default User;
