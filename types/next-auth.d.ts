import NextAuth, { DefaultSession } from "next-auth"

declare module "next-auth" {
    interface Session {
        user: {
            id: string
            username: string
            role: string
            image?: string
            bio?: string
            title?: string
            membershipStatus: string
            membershipTier: string
            identificationStatus: string
        } & DefaultSession["user"]
    }

    interface User {
        id: string
        username: string
        role: string
        image?: string
        bio?: string
        title?: string
        membershipStatus: string
        membershipTier: string
        identificationStatus: string
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        id: string
        username: string
        role: string
        image?: string
        bio?: string
        title?: string
        membershipStatus: string
        membershipTier: string
        identificationStatus: string
    }
}

