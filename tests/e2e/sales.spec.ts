
import { test, expect } from '@playwright/test';
import { createTestUser, createTestBroker, createTestProperty } from './utils/seed';

const TEST_EMAIL = `sales-test-${Date.now()}@imobiflow.com`;
const TEST_SLUG = `sales-tenant-${Date.now()}`;
let globalUser: any;
let globalTenant: any;
let globalBroker: any;
let globalProperty: any;

test.describe('Sales (Vendas) Management', () => {
    test.describe.configure({ mode: 'serial' });

    test.beforeAll(async () => {
        const auth = await createTestUser(TEST_EMAIL, TEST_SLUG);
        globalUser = auth.user;
        globalTenant = auth.tenant;
        globalBroker = await createTestBroker(globalTenant.id);
        globalProperty = await createTestProperty(globalTenant.id);
    });

    test.beforeEach(async ({ page }) => {
        await page.goto('/login');
        await page.fill('input[type="email"]', TEST_EMAIL);
        await page.fill('input[type="password"]', 'password123');
        await page.click('button[type="submit"]');
        await expect(page).toHaveURL(new RegExp(`/${TEST_SLUG}/dashboard`));
    });

    test('should register a new sale successfully (Happy Path)', async ({ page }) => {
        await page.goto(`/${TEST_SLUG}/vendas`);
        await page.click('button:has-text("Nova Venda")');

        // 1. Select Property
        // Trigger autocomplete by typing
        await page.fill('input[placeholder="Digite para buscar imóvel..."]', globalProperty.title);

        // Wait for results and click the item (it renders as a button)
        await page.click(`button:has-text("${globalProperty.title}")`);

        // 2. Fill values
        // Sale value might be auto-filled from property but let's ensure
        await page.locator('label:has-text("Valor da Venda")').locator('..').locator('input').fill('600000');

        // 3. Add Participant
        // Scope to the Distribution card
        const distributionSection = page.locator('.bg-card').filter({ hasText: 'Distribuição da Comissão' });
        await distributionSection.getByRole('button', { name: 'Adicionar' }).click();

        // Select Broker by Label (Name)
        const participantrow = distributionSection.locator('.space-y-3 > div').first();
        await participantrow.locator('select').selectOption({ label: globalBroker.name });

        // Set as Responsible
        await participantrow.locator('input[type="checkbox"]').check();

        // 4. Submit
        await page.click('button:has-text("Registrar Venda")');

        // 5. Verify Success
        // Expect success modal
        await expect(page.getByText('Venda Registrada!')).toBeVisible();

        // Click OK to redirect
        await page.click('button:has-text("OK")');

        await expect(page).toHaveURL(new RegExp(`/${TEST_SLUG}/vendas$`));

        // Verify it appears in list
        await expect(page.getByText(globalProperty.title)).toBeVisible();
    });

    test('should fail to register sale without key data (Sad Path)', async ({ page }) => {
        await page.goto(`/${TEST_SLUG}/vendas/nova`);

        // Don't select property, don't fill value
        const submitButton = page.locator('button:has-text("Registrar Venda")');
        await expect(submitButton).toBeDisabled();

        // FeedbackModal warning should NOT appear because we can't click
        await expect(page.getByText('Dados Incompletos')).not.toBeVisible();

        // Now fill property but not responsible
        await page.fill('input[placeholder="Digite para buscar imóvel..."]', globalProperty.title);
        await page.click(`button:has-text("${globalProperty.title}")`);

        await page.locator('label:has-text("Valor da Venda")').locator('..').locator('input').fill('600000');

        await page.click('button:has-text("Registrar Venda")');

        // FeedbackModal warning for missing responsible
        await expect(page.getByText('Responsável Obrigatório')).toBeVisible();
    });
});
