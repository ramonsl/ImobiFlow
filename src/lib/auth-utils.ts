import { Session } from "next-auth"
import { NextRequest } from "next/server"

/**
 * Validates if the authenticated user has access to the requested tenant.
 * Access is granted if:
 * 1. User is an admin
 * 2. User's tenantId matches the requested tenantId
 * 
 * @param session The user's session
 * @param requestedTenantId The tenant ID being accessed (number or string)
 * @returns boolean True if access is allowed, false otherwise
 */
export function validateTenantAccess(session: Session | null, requestedTenantId: number | string | null | undefined): boolean {
    if (!session?.user?.tenantId) {
        return false
    }

    // Admins can access everything
    if (session.user.role === 'admin') {
        return true
    }

    // If no tenant requested, deny (safe default)
    if (!requestedTenantId) {
        return false
    }

    const numericRequestedId = Number(requestedTenantId)
    const numericSessionId = Number(session.user.tenantId)

    return numericSessionId === numericRequestedId
}
