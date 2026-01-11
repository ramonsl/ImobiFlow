import { describe, it, expect, vi, beforeEach } from 'vitest'
import { GET, POST } from './route'
import { NextRequest } from 'next/server'

// Mocks
vi.mock('@/auth', () => ({
    auth: vi.fn()
}))

vi.mock('@/lib/db', () => ({
    db: {
        select: vi.fn().mockReturnThis(),
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        orderBy: vi.fn().mockReturnThis(),
        insert: vi.fn().mockReturnThis(),
        values: vi.fn().mockReturnThis(),
        returning: vi.fn().mockReturnValue([{ id: 1 }])
    }
}))

import { auth } from '@/auth'

describe('/api/brokers/route', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    describe('GET', () => {
        it('should return 401 if user is not authenticated', async () => {
            (auth as any).mockResolvedValue(null)
            const req = new NextRequest('http://localhost:3000/api/brokers?tenantId=1')
            const res = await GET(req)
            expect(res.status).toBe(401)
        })

        it('should return 403 if user tenantId does not match requested tenantId', async () => {
            (auth as any).mockResolvedValue({
                user: { id: 'user1', tenantId: 1, role: 'broker' }
            })
            const req = new NextRequest('http://localhost:3000/api/brokers?tenantId=2')
            const res = await GET(req)
            expect(res.status).toBe(403)
        })

        it('should return 200 if user tenantId matches requested tenantId', async () => {
            (auth as any).mockResolvedValue({
                user: { id: 'user1', tenantId: 1, role: 'broker' }
            })
            const req = new NextRequest('http://localhost:3000/api/brokers?tenantId=1')
            const res = await GET(req)
            expect(res.status).not.toBe(403)
        })
    })

    describe('POST', () => {
        it('should return 403 if trying to create broker for another tenant', async () => {
            (auth as any).mockResolvedValue({
                user: { id: 'user1', tenantId: 1, role: 'broker' }
            })
            const req = new NextRequest('http://localhost:3000/api/brokers', {
                method: 'POST',
                body: JSON.stringify({
                    tenantId: 2,
                    name: 'Teste Broker',
                    type: 'corretor'
                })
            })
            const res = await POST(req)
            expect(res.status).toBe(403)
        })
    })
})
