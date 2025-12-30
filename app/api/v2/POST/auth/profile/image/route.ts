import { NextRequest, NextResponse } from "next/server";
import { authenticateAPI } from "@/lib/api-auth";
import dbConnect from "@/lib/mongodb/dbConnect";
import User from "@/models/User";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import crypto from "crypto";

export async function POST(req: NextRequest) {
    try {
        await dbConnect();
        const auth = await authenticateAPI();
        if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const formData = await req.formData();
        const file = formData.get("file") as File;

        if (!file) {
            return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
        }

        // Validate file type
        const validTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
        if (!validTypes.includes(file.type)) {
            return NextResponse.json({ error: "Invalid file type. Only JPEG, PNG, WEBP, and GIF are allowed." }, { status: 400 });
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            return NextResponse.json({ error: "File size too large. Maximum size is 5MB." }, { status: 400 });
        }

        const user = await User.findById(auth.userId);
        if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

        // Ensure directory exists
        const uploadDir = path.join(process.cwd(), "public", "uploads", "profile-images");
        await mkdir(uploadDir, { recursive: true });

        // Generate unique filename
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        const extension = file.type.split("/")[1];
        const fileName = `${user._id}_${crypto.randomBytes(4).toString("hex")}.${extension}`;
        const uploadPath = path.join(uploadDir, fileName);

        await writeFile(uploadPath, buffer);

        // Update user profile image URL
        const imageUrl = `/uploads/profile-images/${fileName}`;
        user.image = imageUrl;
        await user.save();

        return NextResponse.json({
            message: "Profile image updated successfully",
            imageUrl
        });

    } catch (error) {
        console.error("Profile Image Upload Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
