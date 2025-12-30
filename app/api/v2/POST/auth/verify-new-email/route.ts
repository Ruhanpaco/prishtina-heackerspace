import { NextRequest, NextResponse } from "next/server";
import { authenticateAPI } from "@/lib/api-auth";
import User from "@/models/User";
import dbConnect from "@/lib/mongodb/dbConnect";
import { logActivity } from "@/lib/logger";

export async function POST(req: NextRequest) {
    try {
        await dbConnect();
        const auth = await authenticateAPI();
        if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { token } = await req.json();
        const user = await User.findById(auth.userId).select("+verificationToken +verificationTokenExpires +pendingEmail");

        if (!user || user.verificationToken !== token) return NextResponse.json({ error: "Invalid code" }, { status: 400 });
        if (!user.verificationTokenExpires || new Date() > user.verificationTokenExpires) return NextResponse.json({ error: "Code expired" }, { status: 400 });
        if (!user.pendingEmail) return NextResponse.json({ error: "No pending email found" }, { status: 400 });

        const oldEmail = user.email;
        if (!user.secondaryEmails.includes(oldEmail)) user.secondaryEmails.push(oldEmail);

        user.email = user.pendingEmail;
        user.emailVerified = new Date();
        user.pendingEmail = undefined;
        user.verificationToken = undefined;
        user.verificationTokenExpires = undefined;

        await user.save();

        await logActivity({
            eventType: "auth.email.change.success",
            action: "UPDATE",
            status: "SUCCESS",
            actor: { userId: user._id.toString(), username: user.email, role: user.role },
            target: { type: "USER", id: user._id.toString() },
            details: { oldEmail, newEmail: user.email },
            severity: "INFO"
        });

        return NextResponse.json({ message: "Email updated successfully", email: user.email });
    } catch (error) {
        console.error("Verify change email error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
