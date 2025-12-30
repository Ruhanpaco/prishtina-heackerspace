import { NextResponse } from "next/server";
import { authenticateAPI } from "@/lib/api-auth";
import dbConnect from "@/lib/mongodb/dbConnect";
import InventoryItem from "@/models/InventoryItem";

export async function POST(req: Request) {
    try {
        const auth = await authenticateAPI();
        if (!auth || (auth.role !== 'ADMIN' && auth.role !== 'STAFF')) {
            return NextResponse.json({ message: "Forbidden" }, { status: 403 });
        }

        const body = await req.json();

        // Basic validation
        if (!body.name || !body.category || !body.location) {
            return NextResponse.json({ error: "Name, category, and location are required" }, { status: 400 });
        }

        await dbConnect();

        const newItem = await InventoryItem.create(body);

        return NextResponse.json({ item: newItem }, { status: 201 });
    } catch (error) {
        console.error("Inventory Create Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
