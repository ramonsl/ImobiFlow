import { describe, it, expect, vi, beforeEach } from 'vitest'
import { POST } from './route'
import { NextRequest } from 'next/server'

// Mock auth
vi.mock('@/auth', () => ({
    auth: vi.fn()
}))

import { auth } from '@/auth'

// Mock console.error to avoid noise
console.error = vi.fn()

describe('/api/upload/route', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        // Reset env vars mock
        process.env.CLOUDINARY_CLOUD_NAME = 'test_cloud'
        process.env.CLOUDINARY_API_KEY = 'test_key'
        process.env.CLOUDINARY_API_SECRET = 'test_secret'
    })

    it('should return 401 if user is not authenticated', async () => {
        (auth as any).mockResolvedValue(null)
        const req = new NextRequest('http://localhost:3000/api/upload', {
            method: 'POST'
        })
        const res = await POST(req)
        expect(res.status).toBe(401)
    })

    it('should return 500 if env vars are missing', async () => {
        (auth as any).mockResolvedValue({ user: { id: '1' } })
        delete process.env.CLOUDINARY_CLOUD_NAME

        const req = new NextRequest('http://localhost:3000/api/upload', {
            method: 'POST'
        })
        const res = await POST(req)
        expect(res.status).toBe(500)
    })

    // We can't easily test success without mocking FormData and fetch, 
    // but verifying auth and env check is the goal of this task.
})
