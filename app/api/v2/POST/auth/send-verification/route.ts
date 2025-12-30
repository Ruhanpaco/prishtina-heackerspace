import { NextRequest, NextResponse } from 'next/server';
import { authenticateAPI } from '@/lib/api-auth';
import User from '@/models/User';
import dbConnect from '@/lib/mongodb/dbConnect';
import { sendEmail } from '@/lib/email';

export async function POST(req: NextRequest) {
    try {
        await dbConnect();
        const auth = await authenticateAPI();
        if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const user = await User.findById(auth.userId);
        if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

        const token = Math.floor(100000 + Math.random() * 900000).toString();
        const expires = new Date(Date.now() + 15 * 60 * 1000);

        user.verificationToken = token;
        user.verificationTokenExpires = expires;
        await user.save();

        const emailResult = await sendEmail({
            to: user.email,
            subject: 'Verify your email - Prishtina Hackerspace',
            html: `<h2>Hello, ${user.name || 'Hacker'}!</h2><p>Verification code: <strong>${token}</strong></p><p>Expires in 15 minutes.</p>`,
            text: `Your verification code is: ${token}.`
        });

        if (!emailResult.success) {
            console.error('Email send failed:', emailResult.error);
            return NextResponse.json({ error: 'Failed to send email' }, { status: 500 });
        }

        return NextResponse.json({ message: 'Verification email sent' });
    } catch (error) {
        console.error('Send verification error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
