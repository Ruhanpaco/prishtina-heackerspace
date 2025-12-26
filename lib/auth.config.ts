import type { NextAuthConfig } from 'next-auth';

export const authConfig = {
    pages: {
        signIn: '/',
    },
    session: {
        strategy: "jwt",
        maxAge: 4 * 60 * 60, // 4 hours
    },
    cookies: {
        sessionToken: {
            name: `next-auth.session-token`,
            options: {
                httpOnly: true,
                sameSite: 'lax',
                path: '/',
                secure: process.env.NODE_ENV === 'production',
            },
        },
    },
    callbacks: {
        // These callbacks must be Edge compatible (no DB calls)
        async jwt({ token, user }) {
            if (user) {
                token.role = user.role;
                token.id = user.id;
            }
            return token;
        },
        async session({ session, token }) {
            if (token && session.user) {
                session.user.id = token.id as string;
                session.user.role = token.role as string;
            }
            return session;
        },
        authorized({ auth, request: { nextUrl } }) {
            const isLoggedIn = !!auth?.user;
            const isDashboard = nextUrl.pathname.startsWith('/dashboard');
            const isAuthRoute = nextUrl.pathname === '/' || nextUrl.pathname.startsWith('/auth');

            // Redirect to login if accessing dashboard without auth
            if (isDashboard && !isLoggedIn) {
                const loginUrl = new URL('/auth/login', nextUrl.origin);
                loginUrl.searchParams.set('callbackUrl', nextUrl.pathname);
                return Response.redirect(loginUrl);
            }

            // Redirect to dashboard if already logged in and trying to access auth pages
            if (isLoggedIn && isAuthRoute) {
                return Response.redirect(new URL('/dashboard', nextUrl.origin));
            }

            return true;
        },
    },
    providers: [], // Configured in lib/auth.ts
} satisfies NextAuthConfig;
