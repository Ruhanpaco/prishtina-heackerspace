import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb/dbConnect';
import User from '@/models/User';
import { verifyRfidToken } from '@/lib/rfid-security';
import { logActivity } from '@/lib/logger';

/**
 * PHYSICAL CHECK-IN SYSTEM API
 * 
 * This endpoint is called by an external hardware system (e.g., ESP32/Raspberry Pi)
 * when an RFID card is scanned.
 */

export async function POST(req: NextRequest) {
    try {
        const { uid, token } = await req.json();

        if (!uid || !token) {
            return NextResponse.json({ message: "Invalid request. Missing UID or Token." }, { status: 400 });
        }

        // 1. Verify and decode the JWT found on the RFID card
        const apiKey = verifyRfidToken(token);
        if (!apiKey) {
            return NextResponse.json({ message: "Invalid token" }, { status: 401 });
        }

        await dbConnect();

        // 2. Find the user associated with this UID and API Key
        // We use +rfidApiKey because it's marked as select: false in the schema
        const user = await User.findOne({ rfidUid: uid }).select('+rfidApiKey');

        if (!user) {
            return NextResponse.json({ message: "RFID UID not registered" }, { status: 404 });
        }

        // 3. Verify the API Key stored on the UID matches the one in the token
        if (user.rfidApiKey !== apiKey) {
            await logActivity({
                eventType: "space.checkin.failed",
                action: "CHECKIN",
                status: "FAILURE",
                actor: { userId: user._id.toString(), username: user.username },
                details: { reason: "API Key mismatch", uid },
                severity: "WARNING"
            });
            return NextResponse.json({ message: "Unauthorized access" }, { status: 403 });
        }

        // 4. Toggle Presence Status
        const newStatus = !user.isCheckedIn;
        user.isCheckedIn = newStatus;

        if (newStatus) {
            user.lastCheckIn = new Date();
        } else {
            user.lastCheckOut = new Date();
        }

        await user.save();

        // 5. Log Success
        await logActivity({
            eventType: newStatus ? "space.checkin.success" : "space.checkout.success",
            action: newStatus ? "CHECKIN" : "CHECKOUT",
            status: "SUCCESS",
            actor: { userId: user._id.toString(), username: user.username },
            details: { name: user.name, uid },
            severity: "INFO"
        });

        // 6. Respond with user info (for hardware feedback, e.g., OLED display)
        // Note: Returning 'status' as 'checked-in' or 'checked-out' as requested
        return NextResponse.json({
            name: user.name,
            status: newStatus ? 'checked-in' : 'checked-out',
            isCheckedIn: newStatus
        }, { status: 200 });

    } catch (error) {
        console.error("RFID Check-in Error:", error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}
