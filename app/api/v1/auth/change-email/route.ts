import { NextRequest, NextResponse } from "next/server";
import { authenticateAPI } from "@/lib/api-auth";
import User from "@/models/User";
import dbConnect from "@/lib/mongodb/dbConnect";
import { sendEmail } from "@/lib/email";
import { z } from "zod";

export async function POST(req: NextRequest) {
    try {
        await dbConnect();
        const auth = await authenticateAPI();
        if (!auth) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { newEmail } = body;

        if (!newEmail || !z.string().email().safeParse(newEmail).success) {
            return NextResponse.json({ error: "Invalid email" }, { status: 400 });
        }

        // Check global uniqueness
        const existing = await User.findOne({
            $or: [{ email: newEmail }, { secondaryEmails: newEmail }]
        });

        if (existing) {
            return NextResponse.json({ error: "Email already in use" }, { status: 409 });
        }

        const user = await User.findById(auth.userId);
        if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

        // Generate OTP
        const token = Math.floor(100000 + Math.random() * 900000).toString();
        // Expires in 15 mins
        const expires = new Date(Date.now() + 15 * 60 * 1000);

        user.verificationToken = token;
        user.verificationTokenExpires = expires;
        user.pendingEmail = newEmail; // Temporarily store the desired email
        await user.save();

        // Send to NEW email
        await sendEmail({
            to: newEmail,
            subject: 'Confirm Email Change - Prishtina Hackerspace',
            html: `
                <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                    <h2>Confirm Email Change</h2>
                    <p>You requested to change your primary email to this address.</p>
                    <p>Use code: <strong>${token}</strong></p>
                    <p>Expires in 15 minutes.</p>
                </div>
            `,
            text: `Confirm email change. Code: ${token}`
        });

        return NextResponse.json({ message: "Verification code sent to new email." });

    } catch (error) {
        console.error("Change email error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
