import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb/dbConnect";
import User from "@/models/User";
import { sendPasswordResetEmail } from "@/lib/password-reset-email";
import crypto from "crypto";
import { logActivity } from "@/lib/logger";

export async function POST(req: NextRequest) {
    try {
        const { email } = await req.json();

        if (!email) {
            return NextResponse.json(
                { error: "Email is required" },
                { status: 400 }
            );
        }

        await dbConnect();

        const user = await User.findOne({
            $or: [{ email }, { secondaryEmails: email }],
        }).select('+passwordResetAttempts +passwordResetTokenExpires');

        // Always return success to prevent email enumeration
        if (!user) {
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

        // Rate limiting: Max 3 attempts per hour
        const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
        if (
            user.passwordResetAttempts &&
            user.passwordResetAttempts >= 3 &&
            user.passwordResetTokenExpires &&
            user.passwordResetTokenExpires > oneHourAgo
        ) {
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

        // Data Integrity Fix: Normalize legacy lowercase enums
        if ((user.identificationStatus as any) === 'none') {
            user.identificationStatus = 'NONE';
        }
        if ((user.membershipTier as any) === 'none') {
            user.membershipTier = 'NONE';
        }

        await user.save();

        // Send email with unhashed tokens
        await sendPasswordResetEmail(email, resetToken, securityKey);

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
