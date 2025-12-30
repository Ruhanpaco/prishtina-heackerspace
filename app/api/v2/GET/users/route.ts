import { NextResponse } from "next/server";
import { authenticateAPI } from "@/lib/api-auth";
import dbConnect from "@/lib/mongodb/dbConnect";
import User from "@/models/User";

export async function GET(req: Request) {
    try {
        const auth = await authenticateAPI();
        if (!auth) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        await dbConnect();

        if (auth.role !== 'ADMIN') {
            const me = await User.findById(auth.userId).select("-password -__v -lastLoginIP -currentIP -rfidApiKey -rfidTag -rfidUid -refreshTokens -apiKey");
            return NextResponse.json({ users: [me] });
        }

        const users = await User.find({}).select("-password -__v -lastLoginIP -currentIP -rfidApiKey -rfidTag -rfidUid -refreshTokens -apiKey").limit(50);
        return NextResponse.json({ users });
    } catch (error) {
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
