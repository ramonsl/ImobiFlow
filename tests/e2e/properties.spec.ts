
import { test, expect } from '@playwright/test';
import { createTestUser } from './utils/seed';

const TEST_EMAIL = `prop-test-${Date.now()}@imobiflow.com`;
const TEST_SLUG = `prop-tenant-${Date.now()}`;
let globalUser: any;

test.describe('Properties Management', () => {
    test.describe.configure({ mode: 'serial' });

    test.beforeAll(async () => {
        const { user } = await createTestUser(TEST_EMAIL, TEST_SLUG);
        globalUser = user;
    });

    test.beforeEach(async ({ page }) => {
        await page.goto('/login');
        await page.fill('input[type="email"]', TEST_EMAIL);
        await page.fill('input[type="password"]', 'password123');
        await page.click('button[type="submit"]');
        await expect(page).toHaveURL(new RegExp(`/${TEST_SLUG}/dashboard`));
    });

    test('should create a new property (Happy Path)', async ({ page }) => {
        await page.goto(`/${TEST_SLUG}/configuracoes`);
        await page.getByRole('button', { name: 'Imóveis' }).click();

        await page.click('button:has-text("Novo Imóvel")');

        const propertyTitle = `Haus Test ${Date.now()}`;

        // Fill form
        await page.fill('input[placeholder="Ex: Casa 3 quartos no Centro"]', propertyTitle);

        // Type (Select)
        // Using the same strategy as before or specific selector if IDs were added.
        // PropertyModal uses native select
        await page.locator('label:has-text("Tipo")').locator('..').locator('select').selectOption('casa');

        // Status
        await page.locator('label:has-text("Status")').locator('..').locator('select').selectOption('active');

        // Price
        await page.locator('label:has-text("Preço (R$)")').locator('..').locator('input').fill('500000');

        // Address
        await page.fill('input[placeholder="Rua, número, bairro"]', 'Rua Teste, 123');

        await page.click('button:has-text("Adicionar")');

        // Verify success
        await expect(page.getByText(propertyTitle)).toBeVisible();
    });

    test('should fail to create property without title (Sad Path)', async ({ page }) => {
        await page.goto(`/${TEST_SLUG}/configuracoes`);
        await page.getByRole('button', { name: 'Imóveis' }).click();

        await page.click('button:has-text("Novo Imóvel")');

        // Submit without filling Title (only price maybe)
        await page.locator('label:has-text("Preço (R$)")').locator('..').locator('input').fill('500000');

        await page.click('button:has-text("Adicionar")');

        // Expect validation error
        await expect(page.getByText('Título é obrigatório')).toBeVisible();
    });
});
