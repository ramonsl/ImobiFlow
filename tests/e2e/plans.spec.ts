import { test, expect } from '@playwright/test';
import { db } from '../../src/lib/db';
import { users, subscriptionPlans } from '../../src/db/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';

const TEST_EMAIL = 'test-admin@imobiflow.com';
const TEST_PASSWORD = 'password123';

test.describe('Subscription Plans Management', () => {

    test.describe.configure({ mode: 'serial' });

    test.beforeAll(async () => {
        // Ensure test admin exists
        let user = await db.query.users.findFirst({
            where: eq(users.email, TEST_EMAIL)
        });

        if (!user) {
            const hashedPassword = await bcrypt.hash(TEST_PASSWORD, 10);
            await db.insert(users).values({
                name: 'Test Admin',
                email: TEST_EMAIL,
                password: hashedPassword,
                role: 'admin',
                tenantId: null // Admin has no tenant or specific system tenant
            });
        }
    });

    test.beforeEach(async ({ page }) => {
        // Login
        await page.goto('/login');
        await page.fill('input[type="email"]', TEST_EMAIL);
        await page.fill('input[type="password"]', TEST_PASSWORD);
        await page.click('button[type="submit"]');

        // Wait for login to complete (any URL starting with /admin)
        await expect(page).toHaveURL(/\/admin/);

        await page.goto('/admin/plans');
    });

    test('should list existing plans', async ({ page }) => {
        await expect(page.getByRole('heading', { name: 'Planos de Assinatura' })).toBeVisible();
        await expect(page.getByRole('table')).toBeVisible();
    });

    test('should create a new plan', async ({ page }) => {
        const planName = `E2E Plan ${Date.now()}`;

        await page.click('button:has-text("Novo Plano")');

        await page.fill('#name', planName);
        await page.fill('#slug', `e2e-plan-${Date.now()}`);
        await page.fill('#amount', '2990'); // 29.90
        await page.fill('#trialDays', '7');

        await page.click('button[type="submit"]');

        await expect(page.getByText('Plano criado!')).toBeVisible();
        await expect(page.getByText(planName)).toBeVisible();
    });

    test('should update an existing plan', async ({ page }) => {
        // First create a plan to update
        const planName = `Update Test ${Date.now()}`;
        await page.click('button:has-text("Novo Plano")');
        await page.fill('#name', planName);
        await page.fill('#slug', `update-test-${Date.now()}`);
        await page.fill('#amount', '1000');
        await page.click('button[type="submit"]');
        await expect(page.getByText(planName)).toBeVisible();

        // Update it
        // Find row by plan name
        const row = page.locator('tr', { hasText: planName });
        await expect(row).toBeVisible();

        // Use data-testid to find the button reliably
        const editBtn = row.locator('[data-testid="edit-plan-btn"]');
        await editBtn.click();

        const newName = `${planName} (Updated)`;
        await page.fill('#name', newName);
        await page.click('button[type="submit"]');

        await expect(page.getByText('Plano atualizado!')).toBeVisible();
        await expect(page.getByText(newName)).toBeVisible();
    });

    test('should delete a plan', async ({ page }) => {
        // Create plan to delete
        const planName = `Delete Test ${Date.now()}`;
        await page.click('button:has-text("Novo Plano")');
        await page.fill('#name', planName);
        await page.fill('#slug', `delete-test-${Date.now()}`);
        await page.fill('#amount', '1000');
        await page.click('button[type="submit"]');
        await expect(page.getByText(planName)).toBeVisible();

        // Delete it
        const row = page.locator('tr', { hasText: planName });
        await expect(row).toBeVisible();

        const deleteBtn = row.locator('[data-testid="delete-plan-btn"]');
        await deleteBtn.click();

        await page.click('button:has-text("Excluir")'); // Confirm dialog

        await expect(page.getByText('Plano excluído!')).toBeVisible(); // Or whatever the toast message is
        await expect(page.getByText(planName)).not.toBeVisible();
    });
});
