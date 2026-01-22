
import { test, expect } from '@playwright/test';
import { createTestUser } from './utils/seed';

const TEST_EMAIL = `collab-test-${Date.now()}@imobiflow.com`;
const TEST_SLUG = `collab-tenant-${Date.now()}`;
let globalUser: any;
let globalTenant: any;

test.describe('Collaborators Management', () => {
    test.describe.configure({ mode: 'serial' });

    test.beforeAll(async () => {
        const { user, tenant } = await createTestUser(TEST_EMAIL, TEST_SLUG);
        globalUser = user;
        globalTenant = tenant;
    });

    test.beforeEach(async ({ page }) => {
        // Login
        await page.goto('/login');
        await page.fill('input[type="email"]', TEST_EMAIL);
        await page.fill('input[type="password"]', 'password123'); // Password from seed.ts
        await page.click('button[type="submit"]');
        await expect(page).toHaveURL(new RegExp(`/${TEST_SLUG}/dashboard`));
    });

    test('should create a new collaborator', async ({ page }) => {
        await page.goto(`/${TEST_SLUG}/configuracoes`);

        // Navigate to Brokers tab (SettingsTabs uses buttons)
        await page.getByRole('button', { name: 'Colaboradores' }).click();

        // Click "Novo Colaborador"
        await page.click('button:has-text("Novo Colaborador")');

        const brokerName = `Broker ${Date.now()}`;

        // Fill form
        await page.fill('input[placeholder="Nome do colaborador"]', brokerName);
        await page.fill('input[placeholder="corretor@email.com"]', `broker-${Date.now()}@test.com`);
        await page.fill('input[placeholder="(XX) XXXXX-XXXX"]', '11999887766');

        // Type is Select. Playwright handles selects differently depending on implementation.
        // If standard select:
        // await page.selectOption('select', 'corretor'); 
        // But there are multiple selects (year, etc).
        // The modal has label "Tipo *". Nearest select.
        // Or specific unique selector.
        // In BrokerModal: 
        // <label>Tipo *</label> <select>...

        // Let's use locator with label
        // await page.locator('label:has-text("Tipo *") + div select').selectOption('corretor');
        // Actually the structure is label -> div -> select sometimes
        // In BrokerModal: <div><label>Tipo *</label><div class="relative"><select>

        // Meta Anual
        await page.locator('label:has-text("Meta 20")').locator('..').locator('input').fill('500000');
        // Or placeholder "0" but that's ambiguous? 
        // There is 'Meta {year} (R$)' label.

        await page.click('button:has-text("Adicionar")');

        // Verify success
        // Expect modal to close and name to appear in table
        await expect(page.getByText(brokerName)).toBeVisible();
    });

    test('should fail to create collaborator with empty fields (Sad Path)', async ({ page }) => {
        await page.goto(`/${TEST_SLUG}/configuracoes`);
        await page.getByRole('button', { name: 'Colaboradores' }).click();

        await page.click('button:has-text("Novo Colaborador")');

        // Submit without filling anything
        await page.click('button:has-text("Adicionar")');

        // Expect validation errors
        // Based on BrokerModal, it sets inline errors like "Nome é obrigatório"
        await expect(page.getByText('Nome é obrigatório')).toBeVisible();
        await expect(page.getByText('Email é obrigatório')).toBeVisible();

        // Modal should still be open (button "Adicionar" still visible)
        await expect(page.locator('button:has-text("Adicionar")')).toBeVisible();
    });
});
