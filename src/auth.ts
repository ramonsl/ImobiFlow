import NextAuth from "next-auth"
import { DrizzleAdapter } from "@auth/drizzle-adapter"
import { db } from "@/lib/db"
import { users, tenants } from "@/db/schema"
import { eq } from "drizzle-orm"

import Resend from "next-auth/providers/resend"

export const { handlers, auth, signIn, signOut } = NextAuth({
    adapter: DrizzleAdapter(db),
    providers: [
        Resend({
            apiKey: process.env.AUTH_RESEND_KEY,
            from: "onboarding@resend.dev"
        })
    ],
    callbacks: {
        async session({ session, user }) {
            if (session.user && user.id) {
                // Fetch extended user info including tenant slug
                const dbUser = await db.select({
                    role: users.role,
                    tenantSlug: tenants.slug
                })
                    .from(users)
                    .leftJoin(tenants, eq(users.tenantId, tenants.id))
                    .where(eq(users.id, user.id))
                    .then(res => res[0])

                if (dbUser) {
                    session.user.role = dbUser.role
                    session.user.tenantSlug = dbUser.tenantSlug
                }
            }
            return session
        },
        async redirect({ url, baseUrl }) {
            // If coming from login, try to redirect to tenant dashboard if slug is available
            // Note: 'redirect' callback happens before 'session' sometimes, or context helps.
            // Default behavior: return to the dashboard if user is logged inside tenant context
            return url.startsWith(baseUrl) ? url : baseUrl
        }
    }
})
