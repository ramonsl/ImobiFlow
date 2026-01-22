
import { test, expect } from '@playwright/test';
import { createTestUser } from './utils/seed';

const TEST_EMAIL = `auth-test-${Date.now()}@imobiflow.com`;
const TEST_SLUG = `auth-tenant-${Date.now()}`;
let globalUser: any;

test.describe('Authentication', () => {
    test.describe.configure({ mode: 'serial' });

    test.beforeAll(async () => {
        const { user } = await createTestUser(TEST_EMAIL, TEST_SLUG);
        globalUser = user;
    });

    test('should login successfully with valid credentials (Happy Path)', async ({ page }) => {
        await page.goto('/login');
        await page.fill('input[type="email"]', TEST_EMAIL);
        await page.fill('input[type="password"]', 'password123');
        await page.click('button[type="submit"]');

        // Should redirect to dashboard
        await expect(page).toHaveURL(new RegExp(`/${TEST_SLUG}/dashboard`));
    });

    test('should fail to login with invalid password (Sad Path)', async ({ page }) => {
        await page.goto('/login');
        await page.fill('input[type="email"]', TEST_EMAIL);
        await page.fill('input[type="password"]', 'wrongpassword');
        await page.click('button[type="submit"]');

        // Verify error message (Toast or Alert)
        // Assuming the app shows a toast or text for invalid credentials
        // Usually "Invalid credentials" or "Credenciais inválidas"
        // Check if we are still on login page (which means failure)
        expect(page.url()).toContain('/login');

        // Optional: Check for error message if available
        // await expect(page.getByText(/inválid|erro|error/i)).toBeVisible();
    });

    test('should fail to login with non-existent email (Sad Path)', async ({ page }) => {
        await page.goto('/login');
        await page.fill('input[type="email"]', 'nobody@imobiflow.com');
        await page.fill('input[type="password"]', 'password123');
        await page.click('button[type="submit"]');

        await expect(page).not.toHaveURL(new RegExp(`/${TEST_SLUG}/dashboard`));
        expect(page.url()).toContain('/login');
    });
});
