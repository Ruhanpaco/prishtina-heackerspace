import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import dbConnect from '@/lib/mongodb/dbConnect';
import User from '@/models/User';
import { signupSchema } from '@/lib/validations/auth';
import { generateAccessToken, generateRefreshToken, generateTokenId } from "@/lib/token-utils";

export async function POST(req: Request) {
    try {
        const body = await req.json();

        // 1. Validation with Zod
        const result = signupSchema.safeParse(body);
        if (!result.success) {
            return NextResponse.json(
                { message: 'Validation failed', errors: result.error.flatten().fieldErrors },
                { status: 400 }
            );
        }

        const { email, password, name, username } = result.data;

        await dbConnect();

        // 2. Check if user exists
        const emailExists = await User.findOne({ email });
        if (emailExists) {
            return NextResponse.json(
                { message: 'Email already registered' },
                { status: 409 }
            );
        }

        // 3. Username logic
        let finalUsername = username;
        if (!finalUsername) {
            finalUsername = email.split('@')[0];
        }

        const usernameExists = await User.findOne({ username: finalUsername });
        if (usernameExists) {
            finalUsername = `${finalUsername}${Math.floor(Math.random() * 1000)}`;
        }

        // 4. Hash password
        const hashedPassword = await bcrypt.hash(password, 12);

        // 5. Create user
        const newUser = await User.create({
            name,
            email,
            username: finalUsername,
            password: hashedPassword,
            role: 'USER',
            membershipStatus: 'PENDING',
            uuid: crypto.randomUUID(),
        });

        // 6. Generate Tokens
        const accessToken = generateAccessToken({
            userId: newUser._id.toString(),
            role: newUser.role,
            email: newUser.email
        });

        const tokenId = generateTokenId();
        const refreshToken = generateRefreshToken({
            userId: newUser._id.toString(),
            tokenId
        });

        // 7. Save Refresh Token to User (Initial Session)
        const userAgent = req.headers.get('user-agent') || undefined;
        const ipAddress = req.headers.get('x-forwarded-for')?.split(',')[0] ||
            req.headers.get('x-real-ip') ||
            undefined;

        const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

        newUser.refreshTokens = [{
            tokenId,
            expiresAt,
            createdAt: new Date(),
            lastUsedAt: new Date(),
            userAgent,
            ipAddress
        }];

        newUser.lastLogin = new Date();
        newUser.lastLoginIP = ipAddress;
        await newUser.save();

        // 8. Return Success with Cookies
        const { password: _, refreshTokens: __, ...userWithoutSecrets } = newUser.toObject();

        const response = NextResponse.json(
            { message: 'User created successfully', user: userWithoutSecrets, accessToken },
            { status: 201 }
        );

        // Set Cookies
        response.cookies.set('access_token', accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 900, // 15 minutes
            path: '/',
        });

        response.cookies.set('refresh_token', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 7 * 24 * 60 * 60, // 7 days
            path: '/',
        });

        return response;

    } catch (error: any) {
        console.error('Registration error:', error);
        return NextResponse.json(
            { message: 'Internal server error', error: error.message },
            { status: 500 }
        );
    }
}
