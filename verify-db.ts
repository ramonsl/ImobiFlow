import { db } from './src/lib/db';
import { tenants, users } from './src/db/schema';
import { like } from 'drizzle-orm';

async function verify() {
    try {
        const res = await db.select().from(tenants).where(like(tenants.slug, 'e2e-test-%'));
        console.log('--- DB VERIFICATION ---');
        console.log(`Found ${res.length} e2e tenants`);
        res.forEach(t => console.log(`- Tenant: ${t.name} (${t.slug})`));

        const count = await db.select().from(users).where(like(users.email, 'admin-e2e-test-%'));
        console.log(`Found ${count.length} e2e admin users`);
        console.log('--- END ---');
    } catch (e) {
        console.error(e);
    }
}

verify();
