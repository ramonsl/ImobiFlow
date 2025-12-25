import NextAuth, { DefaultSession } from "next-auth"

declare module "next-auth" {
    /**
     * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
     */
    interface Session {
        user: {
            tenantSlug?: string | null
            role?: string | null
        } & DefaultSession["user"]
    }

    interface User {
        role?: string | null
        tenantId?: number | null
    }
}
