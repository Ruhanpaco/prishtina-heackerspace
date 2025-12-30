import { NextRequest, NextResponse } from 'next/server';
import { authenticateAPI } from '@/lib/api-auth';
import User from '@/models/User';
import dbConnect from '@/lib/mongodb/dbConnect';
import { logActivity } from '@/lib/logger';

export async function POST(req: NextRequest) {
    try {
        await dbConnect();
        const auth = await authenticateAPI();
        if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { token } = await req.json();
        if (!token) return NextResponse.json({ error: 'Token is required' }, { status: 400 });

        const user = await User.findById(auth.userId).select('+verificationToken +verificationTokenExpires');
        if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

        if (!user.verificationToken || !user.verificationTokenExpires) return NextResponse.json({ error: 'No verification pending' }, { status: 400 });
        if (user.verificationToken !== token) return NextResponse.json({ error: 'Invalid code' }, { status: 400 });
        if (new Date() > user.verificationTokenExpires) return NextResponse.json({ error: 'Code expired' }, { status: 400 });

        user.emailVerified = new Date();
        user.verificationToken = undefined;
        user.verificationTokenExpires = undefined;
        await user.save();

        await logActivity({
            eventType: "auth.email.verified",
            action: "UPDATE",
            status: "SUCCESS",
            actor: { userId: user._id.toString(), username: user.email, role: user.role },
            target: { type: "USER", id: user._id.toString() },
            severity: "INFO"
        });

        return NextResponse.json({ message: 'Email verified successfully' });
    } catch (error) {
        console.error('Verification error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
