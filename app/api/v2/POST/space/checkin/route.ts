import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb/dbConnect';
import User from '@/models/User';
import { verifyRfidToken } from '@/lib/rfid-security';
import { logActivity } from '@/lib/logger';

/**
 * PHYSICAL CHECK-IN SYSTEM API (V2)
 */
export async function POST(req: NextRequest) {
    try {
        const { uid, token } = await req.json();
        const ip = req.headers.get('x-forwarded-for')?.split(',')[0] || req.headers.get('x-real-ip') || '127.0.0.1';

        if (!uid || !token) {
            await logActivity({
                eventType: "space.checkin.invalid_request",
                action: "CHECKIN",
                status: "FAILURE",
                target: { type: "SPACE_PRESENCE" },
                details: { reason: "Missing UID or Token", ip },
                severity: "WARNING"
            });
            return NextResponse.json({ message: "Invalid request. Missing UID or Token." }, { status: 400 });
        }

        // 1. Verify and decode the JWT found on the RFID card
        const apiKey = await verifyRfidToken(token);
        if (!apiKey) {
            await logActivity({
                eventType: "space.checkin.auth_failed",
                action: "CHECKIN",
                status: "FAILURE",
                target: { type: "SPACE_PRESENCE" },
                details: { reason: "Invalid hardware token", uid, ip },
                severity: "CRITICAL"
            });
            return NextResponse.json({ message: "Invalid token" }, { status: 401 });
        }

        await dbConnect();

        // 2. Find the user associated with this UID
        const user = await User.findOne({ rfidUid: uid }).select('+rfidApiKey +uuid');

        if (!user) {
            await logActivity({
                eventType: "space.checkin.unregistered_device",
                action: "CHECKIN",
                status: "FAILURE",
                target: { type: "SPACE_PRESENCE" },
                details: { reason: "RFID UID not registered", uid, ip },
                severity: "WARNING"
            });
            return NextResponse.json({ message: "RFID UID not registered" }, { status: 404 });
        }

        // 3. Verify the API Key stored on the UID matches the one in the token
        if (user.rfidApiKey !== apiKey) {
            await logActivity({
                eventType: "space.checkin.failed",
                action: "CHECKIN",
                status: "FAILURE",
                actor: { userId: user._id.toString(), username: user.username },
                target: { type: "SPACE_PRESENCE" },
                details: { reason: "API Key mismatch", uid, userUuid: user.uuid, ip },
                severity: "CRITICAL"
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
            target: { type: "SPACE_PRESENCE", id: user.uuid },
            details: {
                name: user.name,
                uid,
                userUuid: user.uuid,
                timestamp: new Date().toISOString(),
                ip
            },
            severity: "INFO"
        });

        // 6. Respond
        return NextResponse.json({
            name: user.name,
            status: newStatus ? 'checked-in' : 'checked-out',
            isCheckedIn: newStatus,
            uuid: user.uuid
        }, { status: 200 });

    } catch (error) {
        console.error("RFID Check-in Error:", error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}
