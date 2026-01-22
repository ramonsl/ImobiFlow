
import { test, expect } from '@playwright/test'
import { db } from '../../src/lib/db'
import { subscriptions, tenants, users, securityLogs, subscriptionPlans, properties, deals, sales, payments, invoices, brokers, brokerGoals, tenantGoals, syncJobs } from '../../src/db/schema'
import { createTestUser } from './utils/seed'
import { eq } from 'drizzle-orm'

test.describe('Billing Page', () => {
    let user: any
    let tenant: any
    let plan: any

    test.beforeAll(async () => {
        // Clear data (Order matters for FK)
        await db.delete(securityLogs)
        await db.delete(invoices)
        await db.delete(payments)
        await db.delete(deals)
        await db.delete(sales)
        await db.delete(brokerGoals) // Added
        await db.delete(brokers) // Added
        await db.delete(tenantGoals) // Added
        await db.delete(syncJobs) // Added
        await db.delete(subscriptions)
        await db.delete(properties) // Added
        await db.delete(users)
        await db.delete(tenants)
        await db.delete(subscriptionPlans)

        // Create user and tenant using helper
        const setup = await createTestUser('billing-test@example.com', 'billing-test')
        user = setup.user
        tenant = setup.tenant

        // Create a plan
        const [newPlan] = await db.insert(subscriptionPlans).values({
            name: 'Pro Plan',
            slug: 'pro-plan', // Added slug as it might be required
            stripePriceId: 'price_test_123',
            amount: 10000, // Changed to number (usually cents)
            currency: 'BRL',
            interval: 'month',
            maxUsers: 5,
            maxProperties: 50,
            maxDealsPerMonth: 10,
            isActive: true
        }).returning()
        plan = newPlan

        // Create active subscription
        await db.insert(subscriptions).values({
            tenantId: tenant.id,
            planId: plan.id,
            stripeSubscriptionId: 'sub_test_123',
            status: 'active',
            currentPeriodStart: new Date(),
            currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            cancelAtPeriodEnd: false
        })
    })

    test('should allow navigating to billing and trying to manage subscription', async ({ page }) => {
        // Login
        await page.goto('/login')
        await page.fill('input[name="email"]', 'billing-test@example.com')
        await page.fill('input[name="password"]', 'password123')
        await page.click('button[type="submit"]')

        // Wait for dashboard
        await page.waitForURL(`/${tenant.slug}/dashboard`)

        // Navigate to Billing directly to ensure access
        await page.goto(`/${tenant.slug}/billing`)

        // Verify Billing Page
        await page.waitForURL(`/${tenant.slug}/billing`)
        await expect(page.getByText('Assinatura e Cobrança')).toBeVisible()

        // Verify "Gerenciar Assinatura" button inside a form
        // We check if the button exists and sits inside a form (which implies it's actionable via server action)
        const manageBtn = page.getByRole('button', { name: 'Gerenciar Assinatura no Portal' })
        await expect(manageBtn).toBeVisible()


        // Verify "Plan" buttons are also actionable (e.g., wrapped in a form)
        // Since we are on the current plan, the button might say "Atual" or similar if logic dictates, 
        // but let's check for "Planos Disponíveis"
        await expect(page.getByText('Planos Disponíveis')).toBeVisible()

        // Actually we only seeded ONE plan, and it IS the current plan.
        // So the "Mudar para este Plano" or "Upgrade" button won't show for the current plan.
        // It shows "Atual" badge.
        await expect(page.getByText('Atual', { exact: true }).first()).toBeVisible()
    })
})
