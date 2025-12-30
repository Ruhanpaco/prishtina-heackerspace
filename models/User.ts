import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IUser extends Document {
    // Identity
    name: string;
    username: string;
    email: string;
    secondaryEmails: string[];
    pendingEmail?: string;
    password?: string;
    apiKey?: string;
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
    membershipTier: 'ENTHUSIAST' | 'PRO' | 'ELITE' | 'NONE';
    membershipExpiresAt?: Date;
    identificationStatus: 'NONE' | 'PENDING' | 'VERIFIED' | 'REJECTED';
    identityRejectionReason?: string;
    hasAccess: boolean; // Door access control
    rfidTag?: string;   // Physical card ID (Legacy)
    rfidUid?: string;   // Physical RFID Card UID
    rfidApiKey?: string; // API Key stored on the physical card
    isCheckedIn: boolean; // Current presence status
    lastCheckIn?: Date;
    lastCheckOut?: Date;

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
        apiKey: { type: String, unique: true, sparse: true, select: false }, // Non-selectable API Key
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
        membershipTier: { type: String, enum: ['ENTHUSIAST', 'PRO', 'ELITE', 'NONE'], default: 'NONE' },
        membershipExpiresAt: { type: Date },
        identificationStatus: { type: String, enum: ['NONE', 'PENDING', 'VERIFIED', 'REJECTED'], default: 'NONE' },
        identityRejectionReason: { type: String },
        hasAccess: { type: Boolean, default: false },
        rfidTag: { type: String, sparse: true, unique: true, select: false }, // Sparse allows null/undefined to be non-unique
        rfidUid: { type: String, sparse: true, unique: true, select: false },
        rfidApiKey: { type: String, select: false },
        isCheckedIn: { type: Boolean, default: false },
        lastCheckIn: { type: Date },
        lastCheckOut: { type: Date },

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

        // System
        emailVerified: { type: Date },
        verificationToken: { type: String, select: false },
        verificationTokenExpires: { type: Date, select: false },
        lastLogin: { type: Date },
        lastLoginIP: { type: String, select: false },
        currentIP: { type: String, select: false },
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
