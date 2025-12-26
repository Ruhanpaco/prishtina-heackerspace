import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import dbConnect from '@/lib/mongodb/dbConnect';
import User from '@/models/User';
import { signupSchema } from '@/lib/validations/auth';
import { signJWT } from "@/lib/jwt";

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

        // 6. Generate JWT
        const accessToken = await signJWT({
            userId: newUser._id.toString(),
            role: newUser.role,
            email: newUser.email
        });

        // 7. Return success
        const { password: _, ...userWithoutPassword } = newUser.toObject();

        return NextResponse.json(
            { message: 'User created successfully', user: userWithoutPassword, accessToken },
            { status: 201 }
        );

    } catch (error: any) {
        console.error('Registration error:', error);
        return NextResponse.json(
            { message: 'Internal server error', error: error.message },
            { status: 500 }
        );
    }
}
