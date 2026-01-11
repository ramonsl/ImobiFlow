import 'dotenv/config'
import { db } from '@/lib/db'
import { subscriptionPlans } from './schema'

/**
 * Seed script for subscription plans
 * Run with: npx tsx src/db/seed-plans.ts
 */

async function seedPlans() {
    console.log('🌱 Seeding subscription plans...')

    const plans = [
        {
            name: 'Starter',
            slug: 'starter',
            stripePriceId: process.env.STRIPE_PRICE_STARTER || 'price_starter_placeholder',
            amount: 1990, // R$ 19,90
            currency: 'brl',
            interval: 'month',
            trialDays: 30, // 1 month free trial
            maxUsers: 5,
            maxProperties: 50,
            maxDealsPerMonth: null, // unlimited after trial
            features: ['brokers', 'ranking', 'tv_mode'], // during trial
            isActive: true,
        },
        {
            name: 'Professional',
            slug: 'professional',
            stripePriceId: process.env.STRIPE_PRICE_PROFESSIONAL || 'price_professional_placeholder',
            amount: 2990, // R$ 29,90
            currency: 'brl',
            interval: 'month',
            trialDays: 0, // no trial
            maxUsers: null, // unlimited
            maxProperties: 200,
            maxDealsPerMonth: 2, // limit: 2 deals per month
            features: ['*'], // all features
            isActive: true,
        },
        {
            name: 'Enterprise',
            slug: 'enterprise',
            stripePriceId: process.env.STRIPE_PRICE_ENTERPRISE || 'price_enterprise_placeholder',
            amount: 4990, // R$ 49,90
            currency: 'brl',
            interval: 'month',
            trialDays: 0, // no trial
            maxUsers: null, // unlimited
            maxProperties: null, // unlimited
            maxDealsPerMonth: null, // unlimited
            features: ['*'], // all features
            isActive: true,
        },
    ]

    try {
        for (const plan of plans) {
            const existing = await db.query.subscriptionPlans.findFirst({
                where: (plans, { eq }) => eq(plans.slug, plan.slug),
            })

            if (existing) {
                console.log(`✓ Plan "${plan.name}" already exists, skipping...`)
                continue
            }

            await db.insert(subscriptionPlans).values(plan)
            console.log(`✓ Created plan: ${plan.name} (R$ ${(plan.amount / 100).toFixed(2)}/mês)`)
        }

        console.log('✅ Subscription plans seeded successfully!')
    } catch (error) {
        console.error('❌ Error seeding plans:', error)
        throw error
    } finally {
        process.exit(0)
    }
}

seedPlans()
