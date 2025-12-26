import { NextRequest, NextResponse } from "next/server";
import { authenticateAPI } from "@/lib/api-auth";
import User from "@/models/User";
import dbConnect from "@/lib/mongodb/dbConnect";
import { z } from "zod";

const emailSchema = z.object({
    email: z.string().email().toLowerCase()
});

export async function POST(req: NextRequest) {
    try {
        await dbConnect();
        const auth = await authenticateAPI();
        if (!auth) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const validation = emailSchema.safeParse(body);

        if (!validation.success) {
            return NextResponse.json({ error: "Invalid email format" }, { status: 400 });
        }

        const { email } = validation.data;

        // Check uniqueness globally
        const existingUser = await User.findOne({
            $or: [{ email }, { secondaryEmails: email }]
        });

        if (existingUser) {
            return NextResponse.json({ error: "Email already in use" }, { status: 409 });
        }

        const user = await User.findById(auth.userId);
        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        // Prevent duplicates in same array (though standard unique check might catch it, logic check is safer)
        if (user.secondaryEmails.includes(email) || user.email === email) {
            return NextResponse.json({ error: "Email already associated with account" }, { status: 400 });
        }

        user.secondaryEmails.push(email);
        await user.save();

        return NextResponse.json({
            message: "Secondary email added",
            secondaryEmails: user.secondaryEmails
        });

    } catch (error) {
        console.error("Add email error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest) {
    try {
        await dbConnect();
        const auth = await authenticateAPI();
        if (!auth) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { email } = body;

        if (!email) {
            return NextResponse.json({ error: "Email required" }, { status: 400 });
        }

        const user = await User.findById(auth.userId);
        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        if (!user.secondaryEmails.includes(email)) {
            return NextResponse.json({ error: "Email not found in secondary emails" }, { status: 404 });
        }

        user.secondaryEmails = user.secondaryEmails.filter(e => e !== email);
        await user.save();

        return NextResponse.json({
            message: "Secondary email removed",
            secondaryEmails: user.secondaryEmails
        });

    } catch (error) {
        console.error("Remove email error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
