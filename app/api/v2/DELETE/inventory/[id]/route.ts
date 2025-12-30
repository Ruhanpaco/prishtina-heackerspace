import { NextResponse } from "next/server";
import { authenticateAPI } from "@/lib/api-auth";
import dbConnect from "@/lib/mongodb/dbConnect";
import InventoryItem from "@/models/InventoryItem";

export async function DELETE(
    req: Request,
    { params }: { params: { id: string } }
) {
    try {
        const auth = await authenticateAPI();
        if (!auth || (auth.role !== 'ADMIN' && auth.role !== 'STAFF')) {
            return NextResponse.json({ message: "Forbidden" }, { status: 403 });
        }

        const { id } = params;

        await dbConnect();

        const deletedItem = await InventoryItem.findByIdAndDelete(id);

        if (!deletedItem) {
            return NextResponse.json({ error: "Item not found" }, { status: 404 });
        }

        return NextResponse.json({ message: "Item deleted successfully" });
    } catch (error) {
        console.error("Inventory Delete Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
