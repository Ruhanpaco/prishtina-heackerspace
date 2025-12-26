import { NextRequest, NextResponse } from "next/server";
import { authenticateAPI } from "@/lib/api-auth";
import User from "@/models/User";
import dbConnect from "@/lib/mongodb/dbConnect";

export async function POST(req: NextRequest) {
    try {
        await dbConnect();
        const auth = await authenticateAPI();
        if (!auth) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { token } = body;

        const user = await User.findById(auth.userId).select("+verificationToken +verificationTokenExpires +pendingEmail");

        if (!user || user.verificationToken !== token) {
            return NextResponse.json({ error: "Invalid code" }, { status: 400 });
        }

        if (!user.verificationTokenExpires || new Date() > user.verificationTokenExpires) {
            return NextResponse.json({ error: "Code expired" }, { status: 400 });
        }

        if (!user.pendingEmail) {
            return NextResponse.json({ error: "No pending email change found" }, { status: 400 });
        }

        // Swap Email
        // Old email becomes a secondary email automatically? 
        // Or we just replace it.
        // Let's add old email to secondary to avoid lockout if they want to revert.
        const oldEmail = user.email;

        if (!user.secondaryEmails.includes(oldEmail)) {
            user.secondaryEmails.push(oldEmail);
        }

        user.email = user.pendingEmail; // Update primary
        user.emailVerified = new Date(); // New email is verified by this process

        // Cleanup
        user.pendingEmail = undefined;
        user.verificationToken = undefined;
        user.verificationTokenExpires = undefined;

        await user.save();

        return NextResponse.json({ message: "Email changed successfully", email: user.email });

    } catch (error) {
        console.error("Verify change email error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
