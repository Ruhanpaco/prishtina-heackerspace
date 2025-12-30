import { NextRequest, NextResponse } from "next/server";
import { authenticateAPI } from "@/lib/api-auth";
import User from "@/models/User";
import dbConnect from "@/lib/mongodb/dbConnect";

export async function DELETE(req: NextRequest) {
    try {
        await dbConnect();
        const auth = await authenticateAPI();
        if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { email } = await req.json();
        if (!email) return NextResponse.json({ error: "Email required" }, { status: 400 });

        const user = await User.findById(auth.userId);
        if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

        if (!user.secondaryEmails.includes(email)) return NextResponse.json({ error: "Email not found" }, { status: 404 });

        user.secondaryEmails = user.secondaryEmails.filter(e => e !== email);
        await user.save();

        return NextResponse.json({ message: "Secondary email removed", secondaryEmails: user.secondaryEmails });
    } catch (error) {
        console.error("Remove email error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
