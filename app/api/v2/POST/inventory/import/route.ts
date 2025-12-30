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

        const items = await req.json();

        if (!Array.isArray(items)) {
            return NextResponse.json({ error: "Input must be an array of items" }, { status: 400 });
        }

        await dbConnect();

        // Map incoming fields to the model with robust parsing and dynamic metadata capture
        const operations = items.map(item => {
            // 1. Extract known fields
            const name = item.name || item["Item (name)"] || item["Item"] || "Unknown Item";
            const manufacturer = item.manufacturer || item.Manufacturer || "";
            const description = item.description || item.Description || "";
            const category = item.category || item.Category || "Miscellaneous";
            const subCategory = item.subCategory || item["Sub-Category"] || "";
            const unit = item.unit || item.Unit || "pcs";
            const rawQuantity = item.quantity || item.Quantity || 0;
            const location = item.location || item.Location || "General";
            const electricNotes = item.electricSpecs || item["Electric-Specs"] || "";

            // 2. Sanitize Quantity (Fix NaN)
            let quantity = parseInt(String(rawQuantity));
            if (isNaN(quantity)) quantity = 0;

            // 3. Capture "One Thousand Columns" (anything not explicitly handled above)
            const capturedKeys = ["name", "Item (name)", "Item", "manufacturer", "Manufacturer", "description", "Description", "category", "Category", "subCategory", "Sub-Category", "unit", "Unit", "quantity", "Quantity", "location", "Location", "electricSpecs", "Electric-Specs"];
            const metadata: any = { ...item.metadata || {} };

            Object.keys(item).forEach(key => {
                if (!capturedKeys.includes(key)) {
                    metadata[key] = item[key];
                }
            });

            return {
                name,
                manufacturer,
                description,
                category,
                subCategory,
                unit,
                quantity,
                location,
                electricSpecs: {
                    notes: electricNotes
                },
                metadata
            };
        });

        const result = await InventoryItem.insertMany(operations);

        return NextResponse.json({
            message: `Successfully imported ${result.length} items`,
            count: result.length
        }, { status: 201 });

    } catch (error) {
        console.error("Inventory Import Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
