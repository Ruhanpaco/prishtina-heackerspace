import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb/dbConnect";
import User from "@/models/User";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { logActivity } from "@/lib/logger";

export async function POST(req: NextRequest) {
    try {
        const { token, securityKey, newPassword } = await req.json();

        if (!token || !securityKey || !newPassword) {
            return NextResponse.json(
                { error: "Token, security key, and new password are required" },
                { status: 400 }
            );
        }

        // Validate password strength
        if (newPassword.length < 8) {
            return NextResponse.json(
                { error: "Password must be at least 8 characters long" },
                { status: 400 }
            );
        }

        await dbConnect();

        // Hash the provided tokens to compare with stored hashes
        const hashedToken = crypto
            .createHash("sha256")
            .update(token)
            .digest("hex");
        const hashedKey = crypto
            .createHash("sha256")
            .update(securityKey)
            .digest("hex");

        const user = await User.findOne({
            passwordResetToken: hashedToken,
            passwordResetSecurityKey: hashedKey,
            passwordResetTokenExpires: { $gt: new Date() },
        }).select('+passwordResetToken +passwordResetSecurityKey +passwordResetTokenExpires +refreshTokens');

        if (!user) {
            await logActivity({
                eventType: "auth.password_reset.invalid",
                action: "RESET",
                status: "FAILURE",
                details: {
                    reason: "Invalid or expired reset token/key",
                },
                context: {
                    ip: req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown",
                    userAgent: req.headers.get("user-agent") || "unknown",
                },
                severity: "WARNING",
            });

            return NextResponse.json(
                { error: "Invalid or expired password reset link" },
                { status: 400 }
            );
        }

        // Hash the new password
        const hashedPassword = await bcrypt.hash(newPassword, 12);

        // Update password and clear reset tokens
        user.password = hashedPassword;
        user.passwordResetToken = undefined;
        user.passwordResetSecurityKey = undefined;
        user.passwordResetTokenExpires = undefined;
        user.passwordResetAttempts = 0;
        user.lastPasswordResetAt = new Date();

        // Invalidate all existing sessions for security
        user.refreshTokens = [];

        await user.save();

        await logActivity({
            eventType: "auth.password_reset.success",
            action: "RESET",
            status: "SUCCESS",
            actor: { userId: user._id.toString() },
            details: {
                sessionsInvalidated: true,
                resetAt: user.lastPasswordResetAt,
            },
            context: {
                ip: req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown",
                userAgent: req.headers.get("user-agent") || "unknown",
            },
            severity: "INFO",
        });

        return NextResponse.json({
            message: "Password reset successful. Please log in with your new password.",
        });
    } catch (error: any) {
        console.error("Password reset error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
