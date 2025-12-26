import { NextResponse } from "next/server";
import { loginSchema } from "@/lib/validations/auth";
import dbConnect from "@/lib/mongodb/dbConnect";
import User from "@/models/User";
import bcrypt from "bcryptjs";
import { logActivity } from "@/lib/logger";
import { signJWT } from "@/lib/jwt";

export async function POST(req: Request) {
    try {
        const body = await req.json();

        // 1. Validation
        const validatedFields = loginSchema.safeParse(body);
        if (!validatedFields.success) {
            return NextResponse.json(
                { message: "Invalid fields", errors: validatedFields.error.flatten().fieldErrors },
                { status: 400 }
            );
        }

        const { email, password } = validatedFields.data;

        await dbConnect();

        // 2. Find User
        const user = await User.findOne({ email }).select("+password");

        // 3. Verify User & Password
        if (!user || !user.password) {
            await logActivity({
                eventType: "auth.login.failed",
                action: "LOGIN",
                status: "FAILURE",
                target: { type: "USER" },
                details: { reason: "User not found or no password", email },
                context: { ip: "API" }, // Extracting IP in API route needs headers inspection
                severity: 'WARNING'
            });
            return NextResponse.json({ message: "Invalid credentials." }, { status: 401 });
        }

        const isPasswordCorrect = await bcrypt.compare(password, user.password);

        if (!isPasswordCorrect) {
            await logActivity({
                eventType: "auth.login.failed",
                action: "LOGIN",
                status: "FAILURE",
                actor: { userId: user._id.toString(), username: user.email },
                target: { type: "USER", id: user._id.toString() },
                details: { reason: "Invalid password" },
                context: { ip: "API" },
                severity: 'WARNING'
            });
            return NextResponse.json({ message: "Invalid credentials." }, { status: 401 });
        }

        // 4. Generate JWT
        const accessToken = await signJWT({
            userId: user._id.toString(),
            role: user.role,
            email: user.email
        });

        // 5. Log Success
        await logActivity({
            eventType: "auth.login.success",
            action: "LOGIN",
            status: "SUCCESS",
            actor: { userId: user._id.toString(), username: user.email, role: user.role },
            target: { type: "USER", id: user._id.toString() },
            context: { ip: "API" },
            severity: 'INFO'
        });

        // 6. Return Response
        const { password: _, ...userWithoutPassword } = user.toObject();
        return NextResponse.json({
            message: "Login successful",
            user: userWithoutPassword,
            accessToken
        }, { status: 200 });

    } catch (error) {
        console.error("Login API error:", error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}
