import { NextResponse } from "next/server";
import { authenticateAPI } from "@/lib/api-auth";
import dbConnect from "@/lib/mongodb/dbConnect";
import User from "@/models/User";

export async function GET(req: Request) {
    // 1. Authenticate with JWT
    const user = await authenticateAPI();

    if (!user) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // 2. Fetch Data
    await dbConnect();
    // Admin can see all users, regular user only sees themselves?
    // For now, let's just return list of users (simplified).
    // RBAC check:
    if (user.role !== 'ADMIN') {
        // If not admin, return only self
        const me = await User.findById(user.userId).select("-password -__v");
        return NextResponse.json({ users: [me] });
    }

    const users = await User.find({}).select("-password -__v").limit(50);

    return NextResponse.json({ users });
}
