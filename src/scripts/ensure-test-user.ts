import { db } from '@/lib/db'
import { users, tenants } from '@/db/schema'
import { eq } from 'drizzle-orm'
import bcrypt from 'bcryptjs'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

async function ensureTestUser() {
    const email = 'admin@imobiflow.com'
    const password = 'admin123'

    // Check if user exists
    const existingUser = await db.query.users.findFirst({
        where: eq(users.email, email)
    })

    if (existingUser) {
        console.log('✅ User already exists:', {
            email: existingUser.email,
            role: existingUser.role,
            tenantId: existingUser.tenantId
        })

        if (existingUser.tenantId) {
            const tenant = await db.query.tenants.findFirst({
                where: eq(tenants.id, existingUser.tenantId)
            })
            console.log('✅ Tenant:', tenant)
        }

        process.exit(0)
    }

    // Create tenant first
    const [tenant] = await db.insert(tenants).values({
        name: 'Imobiliária Confiança',
        slug: 'confianca',
        subscriptionStatus: 'active'
    }).returning()

    console.log('✅ Created tenant:', tenant)

    // Create user
    const hashedPassword = await bcrypt.hash(password, 10)
    const [user] = await db.insert(users).values({
        name: 'Admin',
        email,
        password: hashedPassword,
        role: 'manager',
        tenantId: tenant.id
    }).returning()

    console.log('✅ Created user:', {
        email: user.email,
        role: user.role,
        tenantId: user.tenantId
    })

    console.log('\n🎉 Login credentials:')
    console.log(`Email: ${email}`)
    console.log(`Password: ${password}`)
    console.log(`Dashboard: http://localhost:3000/${tenant.slug}/dashboard`)

    process.exit(0)
}

ensureTestUser().catch(console.error)
