import * as dotenv from "dotenv"
dotenv.config({ path: ".env.local" })

import { db } from "../src/lib/db"
import { users } from "../src/db/schema"
import { eq } from "drizzle-orm"

async function fixUserRole() {
    console.log("Fixing user role for dono@confianca.com.br...")

    const result = await db
        .update(users)
        .set({ role: "manager" })
        .where(eq(users.email, "dono@confianca.com.br"))
        .returning()

    if (result.length > 0) {
        console.log("✅ User role updated successfully!")
        console.log("Email:", result[0].email)
        console.log("Role:", result[0].role)
        console.log("Tenant ID:", result[0].tenantId)
    } else {
        console.log("❌ User not found")
    }

    process.exit(0)
}

fixUserRole().catch((err) => {
    console.error("Error:", err)
    process.exit(1)
})
