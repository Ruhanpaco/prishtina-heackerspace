import { NextResponse } from "next/server";
import { authenticateAPI } from "@/lib/api-auth";
import dbConnect from "@/lib/mongodb/dbConnect";
import InventoryItem from "@/models/InventoryItem";

export async function GET(req: Request) {
    try {
        const auth = await authenticateAPI();
        if (!auth) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const category = searchParams.get("category");
        const location = searchParams.get("location");
        const query = searchParams.get("query");
        const page = parseInt(searchParams.get("page") || "1");
        const limit = parseInt(searchParams.get("limit") || "50");
        const skip = (page - 1) * limit;

        await dbConnect();

        let filter: any = {};
        if (category && category !== "all") filter.category = category;
        if (location && location !== "all") filter.location = location;
        if (query) {
            filter.$text = { $search: query };
        }

        const [items, total] = await Promise.all([
            InventoryItem.find(filter)
                .populate("inUseBy", "name image")
                .sort({ name: 1 })
                .skip(skip)
                .limit(limit),
            InventoryItem.countDocuments(filter)
        ]);

        return NextResponse.json({
            items,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error("Inventory Fetch Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
