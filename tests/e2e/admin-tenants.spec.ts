import { test, expect } from '@playwright/test';
import { db } from '../../src/lib/db';
import { users } from '../../src/db/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';

const TEST_EMAIL = 'test-admin@imobiflow.com';
const TEST_PASSWORD = 'password123';

test.describe('Admin Tenants Page', () => {

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
                tenantId: null
            });
        }
    });

    test('should load tenants dashboard without runtime errors', async ({ page }) => {
        // Login
        await page.goto('/login');
        await page.fill('input[type="email"]', TEST_EMAIL);
        await page.fill('input[type="password"]', TEST_PASSWORD);
        await page.click('button[type="submit"]');

        // Wait for login to complete
        await expect(page).toHaveURL(/\/admin/);

        // Go to tenants page
        await page.goto('/admin/tenants');

        // Verify page loaded
        await expect(page.getByRole('heading', { name: 'Imobiliárias', level: 1 })).toBeVisible();

        // Verify table structure
        await expect(page.getByRole('table')).toBeVisible();
        await expect(page.getByRole('cell', { name: 'Plano' }).first()).toBeVisible(); // Check header
        await expect(page.getByText('Total de Imóveis')).toBeVisible();
        await expect(page.getByText('Total de Corretores')).toBeVisible();
        await expect(page.getByText('Total de Vendas')).toBeVisible();
    });
});
