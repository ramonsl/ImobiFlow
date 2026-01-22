import { db } from '@/lib/db'
import { users, tenants } from '@/db/schema'
import { eq } from 'drizzle-orm'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

async function checkUser() {
    const email = 'admin@imobiflow.com' // ou o email que você está usando

    const user = await db.query.users.findFirst({
        where: eq(users.email, email)
    })

    if (!user) {
        console.log('❌ User not found:', email)
        process.exit(1)
    }

    console.log('✅ User found:', {
        id: user.id,
        email: user.email,
        role: user.role,
        tenantId: user.tenantId,
        hasPassword: !!user.password
    })

    if (user.tenantId) {
        const tenant = await db.query.tenants.findFirst({
            where: eq(tenants.id, user.tenantId)
        })
        console.log('✅ Tenant:', {
            id: tenant?.id,
            name: tenant?.name,
            slug: tenant?.slug
        })
    }

    process.exit(0)
}

checkUser().catch(console.error)
