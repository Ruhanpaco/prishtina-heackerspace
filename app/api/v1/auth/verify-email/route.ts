import { NextRequest, NextResponse } from 'next/server';
import { authenticateAPI } from '@/lib/api-auth';
import User from '@/models/User';
import dbConnect from '@/lib/mongodb/dbConnect';

export async function POST(req: NextRequest) {
    await dbConnect();
    const auth = await authenticateAPI(req);
    if (!auth) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { token } = await req.json();

        if (!token) {
            return NextResponse.json({ error: 'Token is required' }, { status: 400 });
        }

        // Need to select the hidden fields
        const user = await User.findById(auth.userId).select('+verificationToken +verificationTokenExpires');

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        if (!user.verificationToken || !user.verificationTokenExpires) {
            return NextResponse.json({ error: 'No verification pending' }, { status: 400 });
        }

        if (user.verificationToken !== token) {
            return NextResponse.json({ error: 'Invalid verification code' }, { status: 400 });
        }

        if (new Date() > user.verificationTokenExpires) {
            return NextResponse.json({ error: 'Verification code expired' }, { status: 400 });
        }

        // Success
        user.emailVerified = new Date();
        user.verificationToken = undefined;
        user.verificationTokenExpires = undefined;
        await user.save();

        return NextResponse.json({ message: 'Email verified successfully', verified: true });

    } catch (error) {
        console.error('Verification error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
