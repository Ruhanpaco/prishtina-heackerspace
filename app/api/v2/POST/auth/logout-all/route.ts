import { NextRequest, NextResponse } from 'next/server';
import { verifyRefreshToken, blacklistAllUserTokens } from '@/lib/jwt';
import { logActivity } from '@/lib/logger';

export async function POST(req: NextRequest) {
    try {
        const refreshToken = req.cookies.get('refresh_token')?.value;
        if (!refreshToken) return NextResponse.json({ error: 'No active session found' }, { status: 401 });

        const decoded = await verifyRefreshToken(refreshToken);
        if (!decoded) {
            await logActivity({
                eventType: "auth.logout_all.failure",
                action: "LOGOUT",
                status: "FAILURE",
                target: { type: "USER" },
                details: { reason: "Invalid session" },
                severity: "WARNING"
            });
            return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
        }

        await blacklistAllUserTokens(decoded.userId);

        const response = NextResponse.json({ message: 'Logged out from all devices successfully' });
        response.cookies.delete('access_token');
        response.cookies.delete('refresh_token');

        await logActivity({
            eventType: "auth.logout_all.success",
            action: "LOGOUT",
            status: "SUCCESS",
            actor: { userId: decoded.userId },
            target: { type: "USER", id: decoded.userId },
            severity: "INFO"
        });

        return response;
    } catch (error) {
        console.error('Error logging out from all devices:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
