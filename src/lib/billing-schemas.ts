import { z } from 'zod'

// Subscription plan validation
export const subscriptionPlanSchema = z.object({
    id: z.number().int().positive(),
    name: z.string().min(1),
    slug: z.enum(['starter', 'professional', 'enterprise']),
    stripePriceId: z.string().min(1),
    amount: z.number().int().positive(),
    currency: z.string().default('brl'),
    interval: z.enum(['month', 'year']),
    trialDays: z.number().int().min(0).default(0),
    maxUsers: z.number().int().positive().nullable(),
    maxProperties: z.number().int().positive().nullable(),
    maxDealsPerMonth: z.number().int().positive().nullable(),
    features: z.array(z.string()),
    isActive: z.boolean().default(true),
})

// Checkout session creation
export const createCheckoutSessionSchema = z.object({
    planSlug: z.enum(['starter', 'professional', 'enterprise']),
    tenantId: z.number().int().positive(),
    successUrl: z.string().url(),
    cancelUrl: z.string().url(),
})

// Subscription update
export const updateSubscriptionSchema = z.object({
    newPlanSlug: z.enum(['starter', 'professional', 'enterprise']),
    prorationBehavior: z.enum(['create_prorations', 'none', 'always_invoice']).default('create_prorations'),
})

// Cancel subscription
export const cancelSubscriptionSchema = z.object({
    cancelAtPeriodEnd: z.boolean().default(true),
    cancellationReason: z.string().optional(),
})

export type SubscriptionPlan = z.infer<typeof subscriptionPlanSchema>
export type CreateCheckoutSession = z.infer<typeof createCheckoutSessionSchema>
export type UpdateSubscription = z.infer<typeof updateSubscriptionSchema>
export type CancelSubscription = z.infer<typeof cancelSubscriptionSchema>
