import { NextRequest, NextResponse } from "next/server";
import { authenticateAPI } from "@/lib/api-auth";
import User from "@/models/User";
import dbConnect from "@/lib/mongodb/dbConnect";
import { sendEmail } from "@/lib/email";
import { z } from "zod";
import { logActivity } from "@/lib/logger";

export async function POST(req: NextRequest) {
    try {
        await dbConnect();
        const auth = await authenticateAPI();
        if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { newEmail } = await req.json();
        if (!newEmail || !z.string().email().safeParse(newEmail).success) {
            return NextResponse.json({ error: "Invalid email" }, { status: 400 });
        }

        const existing = await User.findOne({ $or: [{ email: newEmail }, { secondaryEmails: newEmail }] });
        if (existing) {
            await logActivity({
                eventType: "auth.email.change.failure",
                action: "UPDATE",
                status: "FAILURE",
                actor: { userId: auth.userId },
                target: { type: "USER", id: auth.userId },
                details: { reason: "Email already in use", newEmail },
                severity: "WARNING"
            });
            return NextResponse.json({ error: "Email already in use" }, { status: 409 });
        }

        const user = await User.findById(auth.userId);
        if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

        const token = Math.floor(100000 + Math.random() * 900000).toString();
        const expires = new Date(Date.now() + 15 * 60 * 1000);

        user.verificationToken = token;
        user.verificationTokenExpires = expires;
        user.pendingEmail = newEmail;
        await user.save();

        await sendEmail({
            to: newEmail,
            subject: 'Confirm Email Change - Prishtina Hackerspace',
            html: `<h2>Confirm Email Change</h2><p>Use code: <strong>${token}</strong></p><p>Expires in 15 minutes.</p>`,
            text: `Confirm email change. Code: ${token}`
        });

        await logActivity({
            eventType: "auth.email.change.init",
            action: "UPDATE",
            status: "SUCCESS",
            actor: { userId: auth.userId, role: auth.role },
            target: { type: "USER", id: auth.userId },
            details: { newEmail },
            severity: "INFO"
        });

        return NextResponse.json({ message: "Verification code sent." });
    } catch (error) {
        console.error("Change email error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
