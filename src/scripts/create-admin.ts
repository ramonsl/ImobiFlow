import { db } from '@/lib/db'
import { users } from '@/db/schema'
import { eq } from 'drizzle-orm'
import bcrypt from 'bcryptjs'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

async function createAdminUser() {
    const email = 'admin@imobiflow.com'
    const password = 'Admin@123'

    // Check if admin exists
    const existingAdmin = await db.query.users.findFirst({
        where: eq(users.email, email)
    })

    if (existingAdmin) {
        console.log('⚠️  Admin user already exists. Updating password...')

        // Update password
        const hashedPassword = await bcrypt.hash(password, 10)
        await db.update(users)
            .set({ password: hashedPassword })
            .where(eq(users.email, email))

        console.log('✅ Password updated!')
    } else {
        // Create new admin
        const hashedPassword = await bcrypt.hash(password, 10)
        await db.insert(users).values({
            name: 'Admin ImobiFlow',
            email,
            password: hashedPassword,
            role: 'admin',
            tenantId: null // Admin não tem tenant
        })

        console.log('✅ Admin user created!')
    }

    console.log('\n🎉 Admin Login Credentials:')
    console.log(`Email: ${email}`)
    console.log(`Password: ${password}`)
    console.log(`Dashboard: http://localhost:3000/admin`)

    process.exit(0)
}

createAdminUser().catch(console.error)
