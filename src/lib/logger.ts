import { db } from "@/lib/db"
import { securityLogs } from "@/db/schema"

export type SecurityEvent = 'LOGIN_FAILED' | 'ACCESS_DENIED' | 'RATE_LIMIT' | 'ADMIN_ACTION';

interface LogSecurityEventParams {
    event: SecurityEvent;
    tenantId?: number;
    userId?: string;
    details?: string;
    ip?: string;
    userAgent?: string;
    path?: string;
}

export async function logSecurityEvent(params: LogSecurityEventParams) {
    try {
        await db.insert(securityLogs).values({
            event: params.event,
            tenantId: params.tenantId || null,
            userId: params.userId || null,
            details: params.details || null,
            ip: params.ip || null,
            userAgent: params.userAgent || null,
            path: params.path || null,
        });
    } catch (error) {
        console.error("Failed to log security event:", error);
        // Don't throw, to avoid breaking the main flow
    }
}
