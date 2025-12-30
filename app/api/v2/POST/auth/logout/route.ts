import { NextResponse } from "next/server";
import { signOut, auth } from "@/lib/auth";
import { logActivity } from "@/lib/logger";

export async function POST(req: Request) {
    try {
        const session = await auth();
        if (session?.user) {
            await logActivity({
                eventType: "auth.logout",
                action: "LOGOUT",
                status: "SUCCESS",
                actor: { userId: session.user.id, email: session.user.email, role: session.user.role } as any,
                target: { type: "USER", id: session.user.id },
                severity: 'INFO'
            });
        }

        try {
            await signOut({ redirect: false });
        } catch (err: any) {
            if (err.message?.includes("NEXT_REDIRECT") || err.digest?.startsWith("NEXT_REDIRECT")) {
                return NextResponse.json({ message: "Logged out successfully" }, { status: 200 });
            }
            throw err;
        }

        return NextResponse.json({ message: "Logged out successfully" }, { status: 200 });
    } catch (error: any) {
        if (error.message?.includes("NEXT_REDIRECT") || error.digest?.startsWith("NEXT_REDIRECT")) {
            return NextResponse.json({ message: "Logged out successfully" }, { status: 200 });
        }
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}
