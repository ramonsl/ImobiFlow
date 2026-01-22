import { db } from '@/lib/db'
import { users } from '@/db/schema'
import { eq } from 'drizzle-orm'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

async function fixAdminRole() {
    const admin = await db.query.users.findFirst({
        where: eq(users.email, 'admin@imobiflow.com')
    })

    console.log('Current admin user:', {
        email: admin?.email,
        role: admin?.role,
        tenantId: admin?.tenantId
    })

    if (!admin) {
        console.log('❌ Admin user not found!')
        process.exit(1)
    }

    if (admin.role !== 'admin' || admin.tenantId !== null) {
        console.log('⚠️  Fixing admin role and tenantId...')

        await db.update(users)
            .set({ role: 'admin', tenantId: null })
            .where(eq(users.email, 'admin@imobiflow.com'))

        console.log('✅ Fixed! Admin now has:')
        console.log('   - role: admin')
        console.log('   - tenantId: null')
    } else {
        console.log('✅ Admin role is correct!')
    }

    console.log('\n🔑 Admin credentials:')
    console.log('Email: admin@imobiflow.com')
    console.log('Password: Admin@123')
    console.log('Dashboard: http://localhost:3000/admin')

    process.exit(0)
}

fixAdminRole().catch(console.error)
