
import { db } from '../../../src/lib/db';
import { users, tenants, brokers, properties, brokerGoals } from '../../../src/db/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';

export async function createTestUser(email: string, slug: string) {
    const hashedPassword = await bcrypt.hash('password123', 10);

    // Create Tenant first
    const [tenant] = await db.insert(tenants).values({
        name: `Test Tenant ${slug}`,
        slug: slug,
        subscriptionStatus: 'active',
        // plan: 'enterprise', // Removed as column doesn't exist
        logoUrl: null,
        // active: true // Removed as column doesn't exist directly on tenant (subscription status handles it)
    }).returning();

    // Create User linked to Tenant
    const [user] = await db.insert(users).values({
        name: 'Test Setup User',
        email: email,
        password: hashedPassword,
        tenantId: tenant.id,
        role: 'manager',
        // tenantSlug: slug // Removed as column doesn't exist
    }).returning();

    return { user, tenant };
}

export async function createTestBroker(tenantId: number) {
    const [broker] = await db.insert(brokers).values({
        tenantId,
        name: `Broker ${Date.now()}`,
        email: `broker-${Date.now()}@test.com`,
        phone: '11999999999',
        type: 'corretor',
        active: true,
        // metaAnual: '1000000' // Removed, belongs to brokerGoals
    }).returning();

    // Create Goal for current year
    const currentYear = new Date().getFullYear();
    await db.insert(brokerGoals).values({
        brokerId: broker.id,
        year: currentYear,
        metaAnual: '1000000'
    });

    return broker;
}

export async function createTestProperty(tenantId: number) {
    const [property] = await db.insert(properties).values({
        tenantId,
        title: `Property ${Date.now()}`,
        type: 'casa',
        price: '500000',
        status: 'active',
        source: 'manual'
    }).returning();
    return property;
}
