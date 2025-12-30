import { NextResponse } from "next/server";
import { authenticateAPI } from "@/lib/api-auth";
import dbConnect from "@/lib/mongodb/dbConnect";
import InventoryItem from "@/models/InventoryItem";

export async function PATCH(
    req: Request,
    { params }: { params: { id: string } }
) {
    try {
        const auth = await authenticateAPI();
        if (!auth || (auth.role !== 'ADMIN' && auth.role !== 'STAFF')) {
            return NextResponse.json({ message: "Forbidden" }, { status: 403 });
        }

        const body = await req.json();
        const { id } = params;

        await dbConnect();

        const updatedItem = await InventoryItem.findByIdAndUpdate(
            id,
            { $set: body },
            { new: true, runValidators: true }
        ).populate("inUseBy", "name image");

        if (!updatedItem) {
            return NextResponse.json({ error: "Item not found" }, { status: 404 });
        }

        return NextResponse.json({ item: updatedItem });
    } catch (error) {
        console.error("Inventory Update Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
