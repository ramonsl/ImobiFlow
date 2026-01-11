import 'dotenv/config'

async function testAction() {
    console.log('🧪 Testing createPlan Action...')
    const { createPlan } = await import('@/actions/plans')
    const { db } = await import('@/lib/db')
    const { subscriptionPlans } = await import('@/db/schema')
    const { eq } = await import('drizzle-orm')

    const dummySlug = `action-test-${Date.now()}`

    try {
        console.log('Attempting createPlan with empty stripePriceId...')

        // Simular payload do form
        const payload = {
            name: 'Action Test Plan',
            slug: dummySlug,
            stripePriceId: '', // O form envia string vazia!
            amount: 2500,
            interval: 'month' as const,
            trialDays: 0,
            currency: 'brl' as const,
            maxUsers: null,
            maxProperties: null,
            maxDealsPerMonth: null,
            features: ['test'],
            isActive: true
        }

        const result = await createPlan(payload)

        if (result.success) {
            console.log('✅ Action Success!', result.data)
            // Cleanup
            console.log('🧹 Cleaning up...')
            await db.delete(subscriptionPlans).where(eq(subscriptionPlans.slug, dummySlug))
        } else {
            console.error('❌ Action Failed:', result.error)
        }

    } catch (error) {
        console.error('❌ Unexpected Error during test:', error)
    }
}

testAction().then(() => process.exit(0))
