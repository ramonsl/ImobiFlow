import { test, expect } from '@playwright/test';
import { db } from '../../src/lib/db';
import { tenants, users, subscriptionPlans } from '../../src/db/schema';
import { eq } from 'drizzle-orm';

test.describe('Marketing Onboarding Flow', () => {

    test.beforeAll(async () => {
        // Ensure some plans exist for the test
        const starter = await db.query.subscriptionPlans.findFirst({
            where: eq(subscriptionPlans.slug, 'starter')
        });

        if (!starter) {
            await db.insert(subscriptionPlans).values({
                name: 'Starter',
                slug: 'starter',
                amount: 0,
                interval: 'month',
                trialDays: 30,
                isActive: true
            });
        }
    });

    test('should allow a new imobiliária to register from the landing page', async ({ page }) => {
        const uniqueSlug = `e2e-test-${Date.now()}`;
        const uniqueEmail = `admin-${uniqueSlug}@test.com`;

        // 1. Visit landing page
        await page.goto('/', { waitUntil: 'networkidle', timeout: 60000 });

        // Take a screenshot to debug
        await page.screenshot({ path: 'landing-page-debug.png' });

        // 2. Click on "Começar Agora" tab
        const registerTab = page.locator('text=Começar Agora').first();
        await expect(registerTab).toBeVisible({ timeout: 10000 });
        await registerTab.click();

        // 3. Fill the form
        await page.fill('input[name="name"]', 'Minha E2E Imob');
        await page.fill('input[name="slug"]', uniqueSlug);

        // Select plan (shadow dom or select component)
        await page.getByRole('combobox').click();
        await page.getByRole('option', { name: 'Plano Starter (Teste Grátis)' }).click();

        await page.fill('input[name="adminName"]', 'E2E Admin');
        await page.fill('input[name="adminEmail"]', uniqueEmail);
        await page.fill('input[name="password"]', 'password123');

        // 4. Submit
        await page.click('button:has-text("Criar Minha Imobiliária")');

        // 5. Verify success - wait for toast or redirect
        await expect(page.locator('text=sucesso').first()).toBeVisible({ timeout: 15000 });
        await page.waitForURL(/\/login/, { timeout: 15000 });

        // 6. Verify data in DB
        const createdTenant = await db.query.tenants.findFirst({
            where: eq(tenants.slug, uniqueSlug)
        });
        expect(createdTenant).not.toBeNull();
        expect(createdTenant?.subscriptionStatus).toBe('trialing');

        const createdUser = await db.query.users.findFirst({
            where: eq(users.email, uniqueEmail)
        });
        expect(createdUser).toBeDefined();
        expect(createdUser?.role).toBe('admin');
        expect(createdUser?.tenantId).toBe(createdTenant?.id);
    });
});
