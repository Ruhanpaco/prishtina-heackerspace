import "server-only";
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import dbConnect from "@/lib/mongodb/dbConnect";
import User from "@/models/User";
import bcrypt from "bcryptjs";
import { logActivity } from "@/lib/logger";
import { authConfig } from "@/lib/auth.config";

export const { auth, handlers, signIn, signOut } = NextAuth({
    ...authConfig,
    providers: [
        Credentials({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials, request) {
                await dbConnect();

                // 1. Extract IP
                const { getSecureIP } = await import("@/lib/ip-utils");
                let ip = "unknown";
                if (request && request instanceof Request) {
                    ip = getSecureIP(request);
                }

                // 2. Basic Input Check
                if (!credentials?.email || !credentials?.password) {
                    return null;
                }

                // 3. Find User
                const user = await User.findOne({
                    $or: [
                        { email: credentials.email },
                        { secondaryEmails: credentials.email }
                    ]
                }).select("+password");

                if (!user || !user.password) {
                    await logActivity({
                        eventType: "auth.login.failed",
                        action: "LOGIN",
                        status: "FAILURE",
                        target: { type: "USER" },
                        details: { reason: "User not found or no password", email: credentials.email },
                        context: { ip },
                        severity: 'WARNING'
                    });
                    return null;
                }

                // 4. Verify Password
                const isPasswordCorrect = await bcrypt.compare(
                    credentials.password as string,
                    user.password
                );

                if (!isPasswordCorrect) {
                    await logActivity({
                        eventType: "auth.login.failed",
                        action: "LOGIN",
                        status: "FAILURE",
                        actor: { userId: user._id.toString(), username: user.email },
                        target: { type: "USER", id: user._id.toString() },
                        details: { reason: "Invalid password" },
                        context: { ip },
                        severity: 'WARNING'
                    });
                    return null;
                }

                // 5. Generate Session ID & Log Success
                const sessionId = crypto.randomUUID();

                await logActivity({
                    eventType: "auth.login.success",
                    action: "LOGIN",
                    status: "SUCCESS",
                    actor: { userId: user._id.toString(), username: user.email, role: user.role },
                    target: { type: "USER", id: user._id.toString() },
                    context: { ip, session_id: sessionId },
                    severity: 'INFO'
                });

                // 6. Update User Tracking
                await User.updateOne({ _id: user._id }, {
                    lastLogin: new Date(),
                    lastLoginIP: ip,
                    currentIP: ip
                });

                // 7. Create Session Log (Cluster)
                const Session = (await import("@/models/Session")).default;
                await Session.create({
                    user: user._id,
                    uuid: sessionId,
                    ipAddress: ip,
                    userAgent: "unknown",
                    loginAt: new Date(),
                    isValid: true
                });

                return {
                    id: user._id.toString(),
                    email: user.email,
                    name: user.name,
                    username: user.username,
                    role: user.role,
                    image: user.image,
                    bio: user.bio,
                    title: user.title,
                    membershipStatus: user.membershipStatus,
                    membershipTier: (user as any).membershipTier,
                    identificationStatus: user.identificationStatus,
                };
            },
        }),
    ],
});

