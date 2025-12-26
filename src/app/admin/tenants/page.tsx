import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { db } from "@/lib/db"
import { tenants, users, deals, properties, brokers } from "@/db/schema"
import { eq, count, and } from "drizzle-orm"
import { Building2, Users as UsersIcon, Calendar, Home, TrendingUp } from "lucide-react"
import Link from "next/link"

export default async function TenantsPage() {
    const session = await auth()

    if (!session?.user || session.user.role !== 'admin') {
        redirect("/login")
    }

    // Fetch all tenants with comprehensive stats
    const tenantsList = await db.select().from(tenants).orderBy(tenants.createdAt)

    // Get comprehensive stats for each tenant
    const tenantsWithStats = await Promise.all(
        tenantsList.map(async (tenant) => {
            // Count brokers (collaborators)
            const [brokerCount] = await db
                .select({ count: count() })
                .from(brokers)
                .where(eq(brokers.tenantId, tenant.id))

            // Count properties
            const [propertyCount] = await db
                .select({ count: count() })
                .from(properties)
                .where(eq(properties.tenantId, tenant.id))

            // Count deals
            const [dealCount] = await db
                .select({ count: count() })
                .from(deals)
                .where(eq(deals.tenantId, tenant.id))

            return {
                ...tenant,
                brokerCount: brokerCount.count,
                propertyCount: propertyCount.count,
                dealCount: dealCount.count
            }
        })
    )

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">
                        Imobiliárias
                    </h1>
                    <p className="text-muted-foreground">Gerencie todas as imobiliárias cadastradas</p>
                </div>
            </div>

            {/* Tenants Table */}
            <div className="bg-zinc-900 border border-border rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-zinc-950 border-b border-border">
                            <tr>
                                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Imobiliária</th>
                                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Slug</th>
                                <th className="text-center p-4 text-sm font-medium text-muted-foreground">Imóveis</th>
                                <th className="text-center p-4 text-sm font-medium text-muted-foreground">Corretores</th>
                                <th className="text-center p-4 text-sm font-medium text-muted-foreground">Vendas</th>
                                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Cadastro</th>
                                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {tenantsWithStats.length > 0 ? (
                                tenantsWithStats.map((tenant) => (
                                    <tr key={tenant.id} className="border-b border-border hover:bg-zinc-800/50 transition-colors">
                                        <td className="p-4">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-primary/10 rounded-lg">
                                                    <Building2 className="h-5 w-5 text-primary" />
                                                </div>
                                                <div>
                                                    <p className="font-medium text-foreground">{tenant.name}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <code className="text-sm text-muted-foreground bg-zinc-950 px-2 py-1 rounded">
                                                /{tenant.slug}
                                            </code>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex items-center justify-center gap-2 text-muted-foreground">
                                                <Home className="h-4 w-4" />
                                                <span className="font-medium">{tenant.propertyCount}</span>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex items-center justify-center gap-2 text-muted-foreground">
                                                <UsersIcon className="h-4 w-4" />
                                                <span className="font-medium">{tenant.brokerCount}</span>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex items-center justify-center gap-2 text-muted-foreground">
                                                <TrendingUp className="h-4 w-4" />
                                                <span className="font-medium">{tenant.dealCount}</span>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex items-center gap-2 text-muted-foreground">
                                                <Calendar className="h-4 w-4" />
                                                <span className="text-sm">
                                                    {tenant.createdAt ? new Date(tenant.createdAt).toLocaleDateString('pt-BR') : 'N/A'}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <Link
                                                href={`/${tenant.slug}/dashboard`}
                                                target="_blank"
                                                className="text-primary hover:text-primary/80 text-sm font-medium"
                                            >
                                                Acessar →
                                            </Link>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={7} className="p-8 text-center text-zinc-500">
                                        Nenhuma imobiliária cadastrada ainda
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Summary */}
            <div className="grid md:grid-cols-5 gap-4">
                <div className="bg-zinc-900 border border-border rounded-xl p-6">
                    <h3 className="text-sm font-medium text-muted-foreground mb-2">Imobiliárias</h3>
                    <p className="text-3xl font-bold text-foreground">{tenantsWithStats.length}</p>
                </div>
                <div className="bg-zinc-900 border border-border rounded-xl p-6">
                    <h3 className="text-sm font-medium text-muted-foreground mb-2">Total de Imóveis</h3>
                    <p className="text-3xl font-bold text-foreground">
                        {tenantsWithStats.reduce((sum, t) => sum + t.propertyCount, 0)}
                    </p>
                </div>
                <div className="bg-zinc-900 border border-border rounded-xl p-6">
                    <h3 className="text-sm font-medium text-muted-foreground mb-2">Total de Corretores</h3>
                    <p className="text-3xl font-bold text-foreground">
                        {tenantsWithStats.reduce((sum, t) => sum + t.brokerCount, 0)}
                    </p>
                </div>
                <div className="bg-zinc-900 border border-border rounded-xl p-6">
                    <h3 className="text-sm font-medium text-muted-foreground mb-2">Total de Vendas</h3>
                    <p className="text-3xl font-bold text-foreground">
                        {tenantsWithStats.reduce((sum, t) => sum + t.dealCount, 0)}
                    </p>
                </div>
                <div className="bg-zinc-900 border border-border rounded-xl p-6">
                    <h3 className="text-sm font-medium text-muted-foreground mb-2">Média de Vendas</h3>
                    <p className="text-3xl font-bold text-foreground">
                        {tenantsWithStats.length > 0
                            ? Math.round(tenantsWithStats.reduce((sum, t) => sum + t.dealCount, 0) / tenantsWithStats.length)
                            : 0
                        }
                    </p>
                </div>
            </div>
        </div>
    )
}
