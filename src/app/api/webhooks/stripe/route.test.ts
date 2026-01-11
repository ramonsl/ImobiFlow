import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { POST } from '@/app/api/webhooks/stripe/route'
import { NextRequest } from 'next/server'
import Stripe from 'stripe'

// Mock dependencies
vi.mock('@/lib/stripe', () => ({
    stripe: {
        webhooks: {
            constructEvent: vi.fn(),
        },
        subscriptions: {
            retrieve: vi.fn(),
        },
    },
    STRIPE_WEBHOOK_SECRET: 'whsec_test_secret',
}))

vi.mock('@/lib/db', () => ({
    db: {
        query: {
            subscriptions: {
                findFirst: vi.fn(),
            },
        },
        insert: vi.fn(() => ({ values: vi.fn() })),
        update: vi.fn(() => ({ set: vi.fn(() => ({ where: vi.fn() })) })),
    },
}))

describe('Stripe Webhook Handler', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    describe('POST /api/webhooks/stripe', () => {
        it('should return 400 if signature is missing', async () => {
            const request = new NextRequest('http://localhost/api/webhooks/stripe', {
                method: 'POST',
                body: JSON.stringify({}),
            })

            const response = await POST(request)
            const data = await response.json()

            expect(response.status).toBe(400)
            expect(data.error).toBe('Missing stripe-signature header')
        })

        it('should return 400 if signature verification fails', async () => {
            const { stripe } = await import('@/lib/stripe')

            vi.mocked(stripe.webhooks.constructEvent).mockImplementation(() => {
                throw new Error('Invalid signature')
            })

            const request = new NextRequest('http://localhost/api/webhooks/stripe', {
                method: 'POST',
                headers: {
                    'stripe-signature': 'invalid_signature',
                },
                body: JSON.stringify({}),
            })

            const response = await POST(request)
            const data = await response.json()

            expect(response.status).toBe(400)
            expect(data.error).toBe('Invalid signature')
        })

        it('should process checkout.session.completed event', async () => {
            const { stripe } = await import('@/lib/stripe')
            const { db } = await import('@/lib/db')

            const mockEvent: Stripe.Event = {
                id: 'evt_test',
                object: 'event',
                type: 'checkout.session.completed',
                data: {
                    object: {
                        id: 'cs_test',
                        customer: 'cus_test',
                        subscription: 'sub_test',
                        metadata: {
                            tenantId: '1',
                            planId: '1',
                        },
                    } as Stripe.Checkout.Session,
                },
            } as Stripe.Event

            vi.mocked(stripe.webhooks.constructEvent).mockReturnValue(mockEvent)
            vi.mocked(stripe.subscriptions.retrieve).mockResolvedValue({
                id: 'sub_test',
                status: 'active',
                current_period_start: Math.floor(Date.now() / 1000),
                current_period_end: Math.floor(Date.now() / 1000) + 2592000,
                trial_start: null,
                trial_end: null,
            } as Stripe.Subscription)

            vi.mocked(db.query.subscriptions.findFirst).mockResolvedValue(null)

            const request = new NextRequest('http://localhost/api/webhooks/stripe', {
                method: 'POST',
                headers: {
                    'stripe-signature': 'valid_signature',
                },
                body: JSON.stringify(mockEvent),
            })

            const response = await POST(request)
            const data = await response.json()

            expect(response.status).toBe(200)
            expect(data.received).toBe(true)
        })

        it('should handle unhandled event types gracefully', async () => {
            const { stripe } = await import('@/lib/stripe')

            const mockEvent: Stripe.Event = {
                id: 'evt_test',
                object: 'event',
                type: 'customer.created',
                data: {
                    object: {} as Stripe.Customer,
                },
            } as Stripe.Event

            vi.mocked(stripe.webhooks.constructEvent).mockReturnValue(mockEvent)

            const request = new NextRequest('http://localhost/api/webhooks/stripe', {
                method: 'POST',
                headers: {
                    'stripe-signature': 'valid_signature',
                },
                body: JSON.stringify(mockEvent),
            })

            const response = await POST(request)
            const data = await response.json()

            expect(response.status).toBe(200)
            expect(data.received).toBe(true)
        })
    })
})
