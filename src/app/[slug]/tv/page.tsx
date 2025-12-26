import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { db } from "@/lib/db"
import { tenants } from "@/db/schema"
import { eq } from "drizzle-orm"
import TVDashboard from "@/components/tv/TVDashboard"

export default async function TVModePage({
    params,
}: {
    params: Promise<{ slug: string }>
}) {
    const { slug } = await params
    const session = await auth()

    if (!session?.user) {
        redirect("/login")
    }

    // Get tenant info
    const [tenant] = await db
        .select()
        .from(tenants)
        .where(eq(tenants.slug, slug))
        .limit(1)

    if (!tenant) {
        redirect("/")
    }

    return (
        <div className="h-screen w-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-blue-950 overflow-hidden">
            <TVDashboard tenantId={tenant.id} tenantName={tenant.name} logoUrl={tenant.logoUrl} />
        </div>
    )
}
