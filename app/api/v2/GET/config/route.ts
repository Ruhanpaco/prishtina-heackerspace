import { NextResponse } from "next/server";
import { authenticateAPI } from "@/lib/api-auth";
import { isModuleEnabled } from "@/lib/feature-flags";

export async function GET() {
    try {
        const auth = await authenticateAPI();
        if (!auth) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        return NextResponse.json({
            identificationEnabled: isModuleEnabled("Identification_Module")
        });
    } catch (error) {
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
