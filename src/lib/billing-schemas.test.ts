import { describe, it, expect } from 'vitest'
import { z } from 'zod'
import {
    subscriptionPlanSchema,
    createCheckoutSessionSchema,
    updateSubscriptionSchema,
    cancelSubscriptionSchema,
} from '@/lib/billing-schemas'

describe('Billing Schemas', () => {
    describe('subscriptionPlanSchema', () => {
        it('should validate a valid subscription plan', () => {
            const validPlan = {
                id: 1,
                name: 'Starter',
                slug: 'starter',
                stripePriceId: 'price_123',
                amount: 1990,
                currency: 'brl',
                interval: 'month',
                trialDays: 30,
                maxUsers: 5,
                maxProperties: 50,
                maxDealsPerMonth: null,
                features: ['brokers', 'ranking'],
                isActive: true,
            }

            const result = subscriptionPlanSchema.safeParse(validPlan)
            expect(result.success).toBe(true)
        })

        it('should reject invalid plan slug', () => {
            const invalidPlan = {
                id: 1,
                name: 'Invalid',
                slug: 'invalid_slug',
                stripePriceId: 'price_123',
                amount: 1990,
                currency: 'brl',
                interval: 'month',
                trialDays: 0,
                maxUsers: null,
                maxProperties: null,
                maxDealsPerMonth: null,
                features: [],
                isActive: true,
            }

            const result = subscriptionPlanSchema.safeParse(invalidPlan)
            expect(result.success).toBe(false)
        })

        it('should reject negative amount', () => {
            const invalidPlan = {
                id: 1,
                name: 'Starter',
                slug: 'starter',
                stripePriceId: 'price_123',
                amount: -100,
                currency: 'brl',
                interval: 'month',
                trialDays: 0,
                maxUsers: 5,
                maxProperties: 50,
                maxDealsPerMonth: null,
                features: [],
                isActive: true,
            }

            const result = subscriptionPlanSchema.safeParse(invalidPlan)
            expect(result.success).toBe(false)
        })
    })

    describe('createCheckoutSessionSchema', () => {
        it('should validate valid checkout session data', () => {
            const validData = {
                planSlug: 'starter',
                tenantId: 1,
                successUrl: 'https://example.com/success',
                cancelUrl: 'https://example.com/cancel',
            }

            const result = createCheckoutSessionSchema.safeParse(validData)
            expect(result.success).toBe(true)
        })

        it('should reject invalid URLs', () => {
            const invalidData = {
                planSlug: 'starter',
                tenantId: 1,
                successUrl: 'not-a-url',
                cancelUrl: 'https://example.com/cancel',
            }

            const result = createCheckoutSessionSchema.safeParse(invalidData)
            expect(result.success).toBe(false)
        })

        it('should reject invalid tenant ID', () => {
            const invalidData = {
                planSlug: 'starter',
                tenantId: -1,
                successUrl: 'https://example.com/success',
                cancelUrl: 'https://example.com/cancel',
            }

            const result = createCheckoutSessionSchema.safeParse(invalidData)
            expect(result.success).toBe(false)
        })
    })

    describe('updateSubscriptionSchema', () => {
        it('should validate valid update data', () => {
            const validData = {
                newPlanSlug: 'professional',
                prorationBehavior: 'create_prorations',
            }

            const result = updateSubscriptionSchema.safeParse(validData)
            expect(result.success).toBe(true)
            expect(result.data?.prorationBehavior).toBe('create_prorations')
        })

        it('should use default proration behavior', () => {
            const validData = {
                newPlanSlug: 'enterprise',
            }

            const result = updateSubscriptionSchema.safeParse(validData)
            expect(result.success).toBe(true)
            expect(result.data?.prorationBehavior).toBe('create_prorations')
        })
    })

    describe('cancelSubscriptionSchema', () => {
        it('should validate cancel data with reason', () => {
            const validData = {
                cancelAtPeriodEnd: true,
                cancellationReason: 'Too expensive',
            }

            const result = cancelSubscriptionSchema.safeParse(validData)
            expect(result.success).toBe(true)
        })

        it('should use default cancelAtPeriodEnd value', () => {
            const validData = {}

            const result = cancelSubscriptionSchema.safeParse(validData)
            expect(result.success).toBe(true)
            expect(result.data?.cancelAtPeriodEnd).toBe(true)
        })

        it('should allow immediate cancellation', () => {
            const validData = {
                cancelAtPeriodEnd: false,
            }

            const result = cancelSubscriptionSchema.safeParse(validData)
            expect(result.success).toBe(true)
            expect(result.data?.cancelAtPeriodEnd).toBe(false)
        })
    })
})
