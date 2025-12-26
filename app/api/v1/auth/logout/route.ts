import { NextResponse } from "next/server";
import { signOut, auth } from "@/lib/auth";
import { logActivity } from "@/lib/logger";

export async function POST(req: Request) {
    try {
        // 1. Get current session for logging
        const session = await auth();

        if (session?.user) {
            // 2. Log Logout
            await logActivity({
                eventType: "auth.logout",
                action: "LOGOUT",
                status: "SUCCESS",
                actor: {
                    userId: session.user.id,
                    email: session.user.email,
                    role: session.user.role
                } as any, // Cast to avoid strict type issues if mixed
                target: { type: "USER", id: session.user.id },
                context: { ip: "API" },
                severity: 'INFO'
            });
        }

        // 3. Sign Out
        // signOut in Server Actions/Route Handlers throws a redirect. 
        // We configure it to NOT redirect if possible, OR we catch the redirect.
        // In v5, redirect: false is for client. In server, it might still throw.
        try {
            await signOut({ redirect: false });
        } catch (err: any) {
            // Check if it's a redirect error (which implies success in NextAuth world)
            if (err.message === "NEXT_REDIRECT" || err.name === "NextjsRedirect" || err.digest?.startsWith("NEXT_REDIRECT")) {
                return NextResponse.json({ message: "Logged out successfully" }, { status: 200 });
            }
            throw err;
        }

        return NextResponse.json({ message: "Logged out successfully" }, { status: 200 });

    } catch (error: any) {
        console.error("Logout error:", error);
        if (error.message === "NEXT_REDIRECT" || error.name === "NextjsRedirect" || error.digest?.startsWith("NEXT_REDIRECT")) {
            return NextResponse.json({ message: "Logged out successfully" }, { status: 200 });
        }
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}
