import { auth } from "@/auth"
import { NextResponse } from "next/server"

export default auth((req) => {
    const { nextUrl } = req
    const isLoggedIn = !!req.auth
    const isApiAuthRoute = nextUrl.pathname.startsWith("/api/auth")
    const isPublicRoute = nextUrl.pathname === "/" || nextUrl.pathname === "/login" || nextUrl.pathname === "/register"

    // Extract tenant slug from path: /slug/dashboard -> slug
    // Path parts: ["", "slug", "dashboard"]
    const pathParts = nextUrl.pathname.split("/")
    const potentialTenantSlug = pathParts[1]
    const isTenantRoute = potentialTenantSlug && !["api", "_next", "static", "images", "favicon.ico"].includes(potentialTenantSlug)

    // 1. Allow API Auth routes
    if (isApiAuthRoute) {
        return NextResponse.next()
    }

    // 2. If it's a tenant route (e.g. /my-agency/dashboard) and not logged in
    if (isTenantRoute && !isLoggedIn && !isPublicRoute) {
        // Redirect to login, passing the callback url
        // Ideally we might want a specific tenant login page: /my-agency/login
        // For now, global login
        return Response.redirect(new URL(`/login?callbackUrl=${nextUrl.pathname}`, nextUrl))
    }

    return NextResponse.next()
})

// Matcher to ignore static files and internals
export const config = {
    matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
}
