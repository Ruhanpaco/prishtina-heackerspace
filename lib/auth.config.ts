import type { NextAuthConfig } from 'next-auth';

export const authConfig = {
    pages: {
        signIn: '/',
    },
    session: {
        strategy: "jwt",
        maxAge: 4 * 60 * 60, // 4 hours
    },
    // Cookie configuration removed to rely on secure defaults
    callbacks: {
        // These callbacks must be Edge compatible (no DB calls)
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id;
                token.username = user.username;
                token.role = user.role;
                token.image = user.image;
                token.bio = user.bio;
                token.title = user.title;
                token.membershipStatus = user.membershipStatus;
                token.membershipTier = user.membershipTier;
                token.identificationStatus = user.identificationStatus;
            }
            return token;
        },
        async session({ session, token }) {
            if (token && session.user) {
                session.user.id = token.id as string;
                session.user.username = token.username as string;
                session.user.role = token.role as string;
                session.user.image = token.image as string | undefined;
                session.user.bio = token.bio as string | undefined;
                session.user.title = token.title as string | undefined;
                session.user.membershipStatus = token.membershipStatus as string;
                session.user.membershipTier = token.membershipTier as string;
                session.user.identificationStatus = token.identificationStatus as string;
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
