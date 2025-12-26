import { NextResponse } from "next/server";
import { verifyJWT } from "@/lib/jwt";
import { headers } from "next/headers";
import dbConnect from "@/lib/mongodb/dbConnect";
import User from "@/models/User";

import { auth } from "@/lib/auth";

export async function authenticateAPI() {
    // 1. Try Session Cookie (Native Frontend)
    const session = await auth();
    if (session?.user?.id) {
        return {
            userId: session.user.id,
            role: session.user.role || 'USER',
            email: session.user.email || ""
        };
    }

    // 2. Try Bearer Token (External API)
    const headersList = await headers();
    const authHeader = headersList.get("authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return null; // No token
    }

    const token = authHeader.split(" ")[1];
    const payload = await verifyJWT(token);

    if (!payload || !payload.userId) {
        return null; // Invalid token
    }

    // Optional: Check if user still exists/is active
    // await dbConnect();
    // const user = await User.findById(payload.userId);
    // return user;

    return payload as { userId: string, role: string, email: string };
}
