import { db } from '@/lib/db'
import { stripe } from '@/lib/stripe'
import { subscriptions, subscriptionPlans, tenants } from '@/db/schema'
import { eq, and } from 'drizzle-orm'
import type { CreateCheckoutSession, UpdateSubscription, CancelSubscription } from './billing-schemas'

/**
 * Subscription Service
 * Handles all subscription-related operations with Stripe
 */

/**
 * Create a Stripe checkout session for a new subscription
 */
export async function createCheckoutSession(data: CreateCheckoutSession) {
    // Get the plan
    const plan = await db.query.subscriptionPlans.findFirst({
        where: eq(subscriptionPlans.slug, data.planSlug),
    })

    if (!plan) {
        throw new Error(`Plan ${data.planSlug} not found`)
    }

    // Get tenant
    const tenant = await db.query.tenants.findFirst({
        where: eq(tenants.id, data.tenantId),
    })

    if (!tenant) {
        throw new Error('Tenant not found')
    }

    // Create or get Stripe customer
    let customerId = tenant.stripeCustomerId

    if (!customerId) {
        const customer = await stripe.customers.create({
            metadata: {
                tenantId: data.tenantId.toString(),
            },
        })
        customerId = customer.id

        // Update tenant with customer ID
        await db.update(tenants)
            .set({ stripeCustomerId: customerId })
            .where(eq(tenants.id, data.tenantId))
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
        customer: customerId,
        mode: 'subscription',
        payment_method_types: ['card'],
        line_items: [
            {
                price: plan.stripePriceId,
                quantity: 1,
            },
        ],
        subscription_data: {
            trial_period_days: plan.trialDays || undefined,
            metadata: {
                tenantId: data.tenantId.toString(),
                planId: plan.id.toString(),
            },
        },
        success_url: data.successUrl,
        cancel_url: data.cancelUrl,
        allow_promotion_codes: true,
    })

    return session
}

export async function getSubscription(tenantId: number) {
    const subscription = await db.query.subscriptions.findFirst({
        where: eq(subscriptions.tenantId, tenantId),
    })

    if (!subscription) {
        return null
    }

    // Get plan separately if planId exists
    let plan = null
    if (subscription.planId) {
        plan = await db.query.subscriptionPlans.findFirst({
            where: eq(subscriptionPlans.id, subscription.planId),
        })
    }

    return {
        ...subscription,
        plan,
    }
}

/**
 * Update subscription to a new plan (upgrade/downgrade)
 */
export async function updateSubscription(
    tenantId: number,
    data: UpdateSubscription
) {
    const subscription = await getSubscription(tenantId)

    if (!subscription || !subscription.stripeSubscriptionId) {
        throw new Error('No active subscription found')
    }

    const newPlan = await db.query.subscriptionPlans.findFirst({
        where: eq(subscriptionPlans.slug, data.newPlanSlug),
    })

    if (!newPlan) {
        throw new Error(`Plan ${data.newPlanSlug} not found`)
    }

    // Update subscription in Stripe
    const stripeSubscription = await stripe.subscriptions.retrieve(
        subscription.stripeSubscriptionId
    )

    const updatedSubscription = await stripe.subscriptions.update(
        subscription.stripeSubscriptionId,
        {
            items: [
                {
                    id: stripeSubscription.items.data[0].id,
                    price: newPlan.stripePriceId,
                },
            ],
            proration_behavior: data.prorationBehavior,
        }
    ) as any

    // Update in database
    await db.update(subscriptions)
        .set({
            planId: newPlan.id,
            currentPeriodStart: new Date(updatedSubscription.current_period_start * 1000),
            currentPeriodEnd: new Date(updatedSubscription.current_period_end * 1000),
            updatedAt: new Date(),
        })
        .where(eq(subscriptions.tenantId, tenantId))

    return updatedSubscription
}

/**
 * Cancel subscription
 */
export async function cancelSubscription(
    tenantId: number,
    data: CancelSubscription
) {
    const subscription = await getSubscription(tenantId)

    if (!subscription || !subscription.stripeSubscriptionId) {
        throw new Error('No active subscription found')
    }

    if (data.cancelAtPeriodEnd) {
        // Cancel at period end (keeps access until end of billing period)
        const updatedSubscription = await stripe.subscriptions.update(
            subscription.stripeSubscriptionId,
            {
                cancel_at_period_end: true,
                cancellation_details: {
                    comment: data.cancellationReason,
                },
            }
        )

        await db.update(subscriptions)
            .set({
                cancelAtPeriodEnd: true,
                updatedAt: new Date(),
            })
            .where(eq(subscriptions.tenantId, tenantId))

        return updatedSubscription
    } else {
        // Cancel immediately
        const canceledSubscription = await stripe.subscriptions.cancel(
            subscription.stripeSubscriptionId
        )

        await db.update(subscriptions)
            .set({
                status: 'canceled',
                canceledAt: new Date(),
                updatedAt: new Date(),
            })
            .where(eq(subscriptions.tenantId, tenantId))

        // Update tenant status
        await db.update(tenants)
            .set({ subscriptionStatus: 'canceled' })
            .where(eq(tenants.id, tenantId))

        return canceledSubscription
    }
}

/**
 * Reactivate a canceled subscription
 */
export async function reactivateSubscription(tenantId: number) {
    const subscription = await getSubscription(tenantId)

    if (!subscription || !subscription.stripeSubscriptionId) {
        throw new Error('No subscription found')
    }

    if (!subscription.cancelAtPeriodEnd) {
        throw new Error('Subscription is not scheduled for cancellation')
    }

    // Reactivate in Stripe
    const updatedSubscription = await stripe.subscriptions.update(
        subscription.stripeSubscriptionId,
        {
            cancel_at_period_end: false,
        }
    )

    // Update in database
    await db.update(subscriptions)
        .set({
            cancelAtPeriodEnd: false,
            updatedAt: new Date(),
        })
        .where(eq(subscriptions.tenantId, tenantId))

    return updatedSubscription
}

/**
 * Check if tenant has access to a feature
 */
export async function checkFeatureAccess(
    tenantId: number,
    feature: string
): Promise<boolean> {
    const subscription = await getSubscription(tenantId)

    if (!subscription || !subscription.plan) {
        return false
    }

    // Check if in trial period
    const isInTrial = subscription.status === 'trialing'

    if (isInTrial && subscription.plan.slug === 'starter') {
        // During trial, only basic features
        const trialFeatures = ['brokers', 'ranking', 'tv_mode']
        return trialFeatures.includes(feature)
    }

    // After trial or other plans, check plan features
    const planFeatures = subscription.plan.features || []
    return planFeatures.includes('*') || planFeatures.includes(feature)
}

/**
 * Check usage limits
 */
export async function checkUsageLimits(tenantId: number) {
    const subscription = await getSubscription(tenantId)

    if (!subscription || !subscription.plan) {
        return {
            canAddUsers: false,
            canAddProperties: false,
            canAddDeals: false,
            limits: null,
        }
    }

    // Get current usage (you'll need to implement these queries)
    // const userCount = await getUserCount(tenantId)
    // const propertyCount = await getPropertyCount(tenantId)
    // const dealsThisMonth = await getDealsThisMonth(tenantId)

    const plan = subscription.plan

    return {
        canAddUsers: plan.maxUsers === null, // || userCount < plan.maxUsers,
        canAddProperties: plan.maxProperties === null, // || propertyCount < plan.maxProperties,
        canAddDeals: plan.maxDealsPerMonth === null, // || dealsThisMonth < plan.maxDealsPerMonth,
        limits: {
            maxUsers: plan.maxUsers,
            maxProperties: plan.maxProperties,
            maxDealsPerMonth: plan.maxDealsPerMonth,
        },
    }
}
