import { describe, it, expect, vi, beforeEach } from 'vitest'
import { onboardTenant } from '@/actions/onboarding'
import { db } from '@/lib/db'
import { tenants, users, subscriptions, subscriptionPlans } from '@/db/schema'
import bcrypt from 'bcryptjs'

// Mock dependencies
vi.mock('@/lib/db', () => ({
    db: {
        query: {
            tenants: { findFirst: vi.fn() },
            users: { findFirst: vi.fn() },
            subscriptionPlans: { findFirst: vi.fn() },
        },
        insert: vi.fn().mockReturnThis(),
        values: vi.fn().mockReturnThis(),
        returning: vi.fn().mockReturnThis(),
        transaction: vi.fn((cb) => cb({
            insert: vi.fn().mockReturnThis(),
            values: vi.fn().mockReturnThis(),
            returning: vi.fn().mockResolvedValue([{ id: 1, slug: 'test-imob' }]),
        })),
    },
}))

vi.mock('bcryptjs', () => ({
    default: {
        hash: vi.fn().mockResolvedValue('hashed_password'),
    },
}))

vi.mock('@/lib/logger', () => ({
    logger: {
        debug: vi.fn(),
        info: vi.fn(),
        error: vi.fn(),
    },
}))

describe('onboardTenant', () => {
    const validData = {
        name: 'Test Imob',
        slug: 'test-imob',
        adminName: 'Admin User',
        adminEmail: 'admin@test.com',
        password: 'password123',
        planSlug: 'starter',
    }

    beforeEach(() => {
        vi.clearAllMocks()

            // Default mock setup: no conflicts, plan exists
            ; (db.query.tenants.findFirst as any).mockResolvedValue(null)
            ; (db.query.users.findFirst as any).mockResolvedValue(null)
            ; (db.query.subscriptionPlans.findFirst as any).mockResolvedValue({ id: 1, slug: 'starter', trialDays: 30 })
    })

    it('should successfully onboard a new tenant', async () => {
        const result = await onboardTenant(validData)

        expect(result.success).toBe(true)
        if ('data' in result) {
            expect(result.data.tenantSlug).toBe('test-imob')
        }
        expect(db.transaction).toHaveBeenCalled()
    })

    it('should return error if slug is already taken', async () => {
        ; (db.query.tenants.findFirst as any).mockResolvedValue({ id: 1, slug: 'test-imob' })

        const result = await onboardTenant(validData)

        expect(result.success).toBe(false)
        if ('error' in result) {
            expect(result.error).toContain('já está sendo usado')
        }
    })

    it('should return error if email is already taken', async () => {
        ; (db.query.users.findFirst as any).mockResolvedValue({ id: 1, email: 'admin@test.com' })

        const result = await onboardTenant(validData)

        expect(result.success).toBe(false)
        if ('error' in result) {
            expect(result.error).toContain('já está cadastrado')
        }
    })

    it('should return error if plan does not exist', async () => {
        ; (db.query.subscriptionPlans.findFirst as any).mockResolvedValue(null)

        const result = await onboardTenant(validData)

        expect(result.success).toBe(false)
        if ('error' in result) {
            expect(result.error).toContain('Plano selecionado não encontrado')
        }
    })
})
