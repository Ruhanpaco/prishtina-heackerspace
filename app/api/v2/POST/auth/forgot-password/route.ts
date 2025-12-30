import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb/dbConnect";
import User from "@/models/User";
import { sendPasswordResetEmail } from "@/lib/password-reset-email";
import crypto from "crypto";
import { logActivity } from "@/lib/logger";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const email = body.email ? body.email.toLowerCase() : null;
        console.log(`[Forgot Password] Received request for: ${email}`);

        if (!email) {
            return NextResponse.json(
                { error: "Email is required" },
                { status: 400 }
            );
        }

        await dbConnect();

        console.log(`[Forgot Password] Querying database for user...`);
        const user = await User.findOne({
            $or: [{ email }, { secondaryEmails: email }],
        }).select('+passwordResetAttempts +passwordResetTokenExpires');

        if (!user) {
            console.log(`[Forgot Password] User NOT FOUND for: ${email}`);
            await logActivity({
                eventType: "auth.password_reset.request",
                action: "REQUEST",
                status: "FAILURE",
                details: {
                    reason: "User not found",
                    email: email.substring(0, 3) + "***", // Partial email for privacy
                },
                context: {
                    ip: req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown",
                    userAgent: req.headers.get("user-agent") || "unknown",
                },
                severity: "WARNING",
            });

            return NextResponse.json({
                message: "If an account with that email exists, a password reset link has been sent.",
            });
        }

        // Rate limiting: Max 100 attempts per hour (Facilitating testing)
        const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
        if (
            user.passwordResetAttempts &&
            user.passwordResetAttempts >= 100 &&
            user.passwordResetTokenExpires &&
            user.passwordResetTokenExpires > oneHourAgo
        ) {
            console.log(`[Forgot Password] Rate limit HIT for user: ${user._id} (${user.passwordResetAttempts} attempts)`);
            await logActivity({
                eventType: "auth.password_reset.rate_limit",
                action: "BLOCK",
                status: "FAILURE",
                actor: { userId: user._id.toString() },
                details: {
                    reason: "Too many reset attempts",
                    attempts: user.passwordResetAttempts,
                },
                context: {
                    ip: req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown",
                    userAgent: req.headers.get("user-agent") || "unknown",
                },
                severity: "WARNING",
            });

            return NextResponse.json({
                message: "If an account with that email exists, a password reset link has been sent.",
            });
        }

        console.log(`[Forgot Password] Generating secure tokens for user: ${user._id}`);
        // Generate secure tokens
        const resetToken = crypto.randomBytes(32).toString("hex");
        const securityKey = crypto.randomBytes(16).toString("hex");

        // Hash the tokens before storing
        const hashedToken = crypto
            .createHash("sha256")
            .update(resetToken)
            .digest("hex");
        const hashedKey = crypto
            .createHash("sha256")
            .update(securityKey)
            .digest("hex");

        // Update user with reset tokens
        user.passwordResetToken = hashedToken;
        user.passwordResetSecurityKey = hashedKey;
        user.passwordResetTokenExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
        user.passwordResetAttempts = (user.passwordResetAttempts || 0) + 1;

        console.log(`[Forgot Password] Normalizing enums and saving user...`);
        // Data Integrity Fix: Force-normalize invalid enums to defaults
        const validIDStatus = ['NONE', 'PENDING', 'VERIFIED', 'REJECTED'];
        if (!validIDStatus.includes(user.identificationStatus as string)) {
            // console.log(`Fixing invalid identificationStatus: ${user.identificationStatus}`);
            user.identificationStatus = 'NONE';
        }

        const validTiers = ['ENTHUSIAST', 'PRO', 'ELITE', 'NONE'];
        if (!validTiers.includes(user.membershipTier as string)) {
            user.membershipTier = 'NONE';
        }

        const validRoles = ['ADMIN', 'STAFF', 'MEMBER', 'USER'];
        if (!validRoles.includes(user.role as string)) {
            user.role = 'USER';
        }

        console.log(`[Forgot Password] Executing user.save()...`);
        await user.save();
        console.log(`[Forgot Password] User saved successfully.`);

        // Send email with unhashed tokens
        console.log(`[Forgot Password] Calling sendPasswordResetEmail for: ${email}...`);
        await sendPasswordResetEmail(email, resetToken, securityKey);
        console.log(`[Forgot Password] sendPasswordResetEmail COMPLETED.`);

        await logActivity({
            eventType: "auth.password_reset.request",
            action: "REQUEST",
            status: "SUCCESS",
            actor: { userId: user._id.toString() },
            details: {
                email: email.substring(0, 3) + "***",
                expiresAt: user.passwordResetTokenExpires,
            },
            context: {
                ip: req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown",
                userAgent: req.headers.get("user-agent") || "unknown",
            },
            severity: "INFO",
        });

        return NextResponse.json({
            message: "If an account with that email exists, a password reset link has been sent.",
        });
    } catch (error: any) {
        console.error("Password reset request error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
