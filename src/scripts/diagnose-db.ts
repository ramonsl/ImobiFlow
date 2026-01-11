import 'dotenv/config' // Load env first

async function diagnose() {
    console.log('🔍 Diagnosing Database...')
    console.log('Env check - DATABASE_URL exists?', !!process.env.DATABASE_URL)

    try {
        // Dynamic import to ensure env is loaded
        const { db } = await import('@/lib/db')
        const { subscriptionPlans } = await import('@/db/schema')
        const { desc, eq } = await import('drizzle-orm')

        // 1. Check connection and read
        console.log('1. Testing connectivity and READ...')
        const plans = await db.query.subscriptionPlans.findMany({
            orderBy: [desc(subscriptionPlans.amount)],
            limit: 1
        })
        console.log('✅ Connected! Plans found:', plans.length)
        if (plans.length > 0) {
            console.log('Sample plan type:', typeof plans[0].stripePriceId)
            console.log('Sample plan:', JSON.stringify(plans[0], null, 2))
        } else {
            console.log('No plans found in database.')
        }

        // 2. Try INSERT with nullable stripePriceId and various empty field combinations
        console.log('\n2. Testing INSERT logic...')
        const dummySlug = `test-plan-${Date.now()}`

        try {
            console.log('Attempting insert with null stripePriceId...')
            const result = await db.insert(subscriptionPlans).values({
                name: 'Test Plan Diagnostic',
                slug: dummySlug,
                stripePriceId: null, // Explicitly testing null
                amount: 1000,
                interval: 'month',
                features: ['test'],
                trialDays: 0,
                currency: 'brl',
                maxUsers: null,
                maxProperties: null
            }).returning()

            console.log('✅ Insert successful!', result)

            // Cleanup
            console.log('🧹 Cleaning up test plan...')
            await db.delete(subscriptionPlans).where(eq(subscriptionPlans.slug, dummySlug))
            console.log('✅ Cleanup successful!')

        } catch (insertError: any) {
            console.error('❌ INSERT FAILED:', insertError)
            console.error('Error Code:', insertError.code)
            // 23505 = unique_violation, 23502 = not_null_violation
            if (insertError.code === '23502') {
                console.error('🚨 NOT NULL VIOLATION! A column that should be nullable is NOT nullable.')
                console.error('Check stripe_price_id definition in database.')
            }
        }

    } catch (error: any) {
        console.error('❌ FATAL ERROR:', error)
    }
}

diagnose().then(() => process.exit(0))
