import NextAuth from 'next-auth';
import { authConfig } from '@/lib/auth.config';

export default NextAuth(authConfig).auth;

export const config = {
    // Matcher ensuring we don't block static files or Next.js internals
    matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
