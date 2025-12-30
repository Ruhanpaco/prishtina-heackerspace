import { verifyAccessToken } from "@/lib/jwt";
import { headers } from "next/headers";
import dbConnect from "@/lib/mongodb/dbConnect";
import User from "@/models/User";
import { auth } from "@/lib/auth";

/**
 * Authenticate API calls
 * Supports both Session Cookies (Frontend) and Bearer Tokens (External/Hardware)
 */
export async function authenticateAPI() {
    // 1. Try Session Cookie (Native Frontend)
    const session = await auth();
    if (session?.user?.id) {
        return {
            userId: session.user.id,
            role: session.user.role as any || 'USER',
            email: session.user.email || ""
        };
    }

    // 2. Try Bearer Token (External API / Multi-token system)
    const headersList = await headers();
    const authHeader = headersList.get("authorization");
    const apiKeyHeader = headersList.get("x-api-key");

    // Try API Key first if present
    if (apiKeyHeader) {
        await dbConnect();
        const user = await User.findOne({ apiKey: apiKeyHeader }).select("id email role");
        if (user) {
            return {
                userId: user._id.toString(),
                role: user.role as any || 'USER',
                email: user.email || ""
            };
        }
    }

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return null; // No token
    }

    const token = authHeader.split(" ")[1];
    const payload = await verifyAccessToken(token);

    if (!payload || !payload.userId) {
        return null; // Invalid token
    }

    return {
        userId: payload.userId,
        role: payload.role || 'USER',
        email: payload.email || ""
    };
}

