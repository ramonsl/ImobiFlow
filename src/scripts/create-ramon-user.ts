import { db } from '@/lib/db'
import { users, tenants } from '@/db/schema'
import { eq } from 'drizzle-orm'
import bcrypt from 'bcryptjs'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

async function createUserWithEmail() {
    const email = 'ramonsl@gmail.com'
    const password = 'admin123' // Use a senha que você quiser

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
        process.exit(0)
    }

    // Get the tenant "confianca"
    const tenant = await db.query.tenants.findFirst({
        where: eq(tenants.slug, 'confianca')
    })

    if (!tenant) {
        console.log('❌ Tenant "confianca" not found')
        process.exit(1)
    }

    // Create user
    const hashedPassword = await bcrypt.hash(password, 10)
    const [user] = await db.insert(users).values({
        name: 'Ramon Lummertz',
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

createUserWithEmail().catch(console.error)
