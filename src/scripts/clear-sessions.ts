import { db } from '@/lib/db'
import { sessions } from '@/db/schema'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

async function clearSessions() {
    console.log('Clearing all sessions...')
    await db.delete(sessions)
    console.log('✅ All sessions cleared. Users will need to login again.')
    process.exit(0)
}

clearSessions().catch(console.error)
