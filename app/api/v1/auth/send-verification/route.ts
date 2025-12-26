import { NextRequest, NextResponse } from 'next/server';
import { authenticateAPI } from '@/lib/api-auth';
import User from '@/models/User';
import dbConnect from '@/lib/mongodb/dbConnect';
import { sendEmail } from '@/lib/email';

export async function POST(req: NextRequest) {
    await dbConnect();
    const auth = await authenticateAPI();
    if (!auth) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const user = await User.findById(auth.userId);
        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // Generate 6-digit OTP
        const token = Math.floor(100000 + Math.random() * 900000).toString();
        // Expires in 15 minutes
        const expires = new Date(Date.now() + 15 * 60 * 1000);

        user.verificationToken = token;
        user.verificationTokenExpires = expires;
        await user.save();

        const emailResult = await sendEmail({
            to: user.email,
            subject: 'Verify your email - Prishtina Hackerspace',
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="utf-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Verify Email</title>
                    <style>
                        body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f6f9fc; margin: 0; padding: 0; -webkit-font-smoothing: antialiased; }
                        .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05); margin-top: 40px; margin-bottom: 40px; }
                        .header { background-color: #2e3440; padding: 30px; text-align: center; }
                        .logo { max-height: 50px; }
                        .content { padding: 40px; color: #333333; line-height: 1.6; }
                        .otp-container { text-align: center; margin: 30px 0; }
                        .otp-code { font-family: 'Courier New', Courier, monospace; font-size: 36px; font-weight: bold; color: #2e3440; background-color: #f0f4f8; padding: 15px 30px; border-radius: 8px; letter-spacing: 8px; display: inline-block; border: 1px solid #dae1e7; }
                        .footer { background-color: #f6f9fc; padding: 20px; text-align: center; font-size: 12px; color: #8898aa; border-top: 1px solid #edf2f7; }
                        .link { color: #5e72e4; text-decoration: none; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h2 style="color: white; margin: 0;">FLOSSK</h2>
                        </div>
                        <div class="content">
                            <h2 style="margin-top: 0; color: #2d3748;">Hello, ${user.name || 'Hacker'}!</h2>
                            <p>Thanks for joining Prishtina Hackerspace CRM. To complete your registration and verify your account, please use the verification code below:</p>
                            
                            <div class="otp-container">
                                <div class="otp-code">${token}</div>
                            </div>
                            
                            <p>This code will expire in <strong>15 minutes</strong>.</p>
                            <p>If you didn't request this code, you can safely ignore this email.</p>
                        </div>
                        <div class="footer">
                            <p>&copy; ${new Date().getFullYear()} Free Libre Open Source Software Kosova. All rights reserved.</p>
                            <p>Prishtina Hackerspace, Prishtina, Kosovo</p>
                        </div>
                    </div>
                </body>
                </html>
            `,
            text: `Your verification code is: ${token}. It expires in 15 minutes.`
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
