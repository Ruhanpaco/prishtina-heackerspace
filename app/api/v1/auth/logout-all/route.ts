import { NextRequest, NextResponse } from 'next/server';
import { verifyRefreshToken, blacklistAllUserTokens } from '@/lib/token-utils';

export async function POST(req: NextRequest) {
    try {
        // Get refresh token from cookie to identify user
        const refreshToken = req.cookies.get('refresh_token')?.value;

        if (!refreshToken) {
            return NextResponse.json(
                { error: 'No active session found' },
                { status: 401 }
            );
        }

        // Verify refresh token to get user ID
        const decoded = verifyRefreshToken(refreshToken);
        if (!decoded) {
            return NextResponse.json(
                { error: 'Invalid session' },
                { status: 401 }
            );
        }

        // Blacklist all user's refresh tokens
        await blacklistAllUserTokens(decoded.userId);

        // Clear cookies
        const response = NextResponse.json({
            message: 'Logged out from all devices successfully',
        });

        response.cookies.delete('access_token');
        response.cookies.delete('refresh_token');

        return response;
    } catch (error) {
        console.error('Error logging out from all devices:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
