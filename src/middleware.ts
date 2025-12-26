import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { auth } from "@/auth"

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl

    // Skip middleware for public routes
    if (pathname === '/' || pathname === '/login' || pathname.startsWith('/api/auth')) {
        return NextResponse.next()
    }

    // Get session
    const session = await auth()

    // Extract slug from URL (e.g., /imobiliaria-abc/dashboard -> imobiliaria-abc)
    const slugMatch = pathname.match(/^\/([^\/]+)\//)
    const requestedSlug = slugMatch?.[1]

    // Protect admin routes
    if (pathname.startsWith('/admin')) {
        if (!session?.user || session.user.role !== 'admin') {
            return NextResponse.redirect(new URL('/login', request.url))
        }
        return NextResponse.next()
    }

    // Protect tenant routes
    if (requestedSlug && requestedSlug !== 'api') {
        // User must be logged in
        if (!session?.user) {
            return NextResponse.redirect(new URL('/login', request.url))
        }

        // Admin can access all tenants
        if (session.user.role === 'admin') {
            return NextResponse.next()
        }

        // Regular users can only access their own tenant
        if (session.user.tenantSlug !== requestedSlug) {
            return NextResponse.redirect(new URL('/login', request.url))
        }
    }

    return NextResponse.next()
}

// Configure which routes to run middleware on
export const config = {
    matcher: [
        /*
         * Match all request paths except:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - public folder
         */
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
}
