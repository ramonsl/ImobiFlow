import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { db } from "@/lib/db"
import { users, tenants, deals } from "@/db/schema"
import { sql, count, sum } from "drizzle-orm"
import { Building2, Users as UsersIcon, DollarSign, TrendingUp } from "lucide-react"

export default async function AdminDashboard() {
    const session = await auth()

    if (!session?.user || session.user.role !== 'admin') {
        redirect("/login")
    }

    // Fetch real stats from database
    const [tenantsCount] = await db.select({ count: count() }).from(tenants)
    const [brokersCount] = await db.select({ count: count() }).from(users)

    const dealsStats = await db
        .select({
            totalDeals: count(),
            totalVGV: sum(deals.saleValue)
        })
        .from(deals)

    const totalDeals = dealsStats[0]?.totalDeals || 0
    const totalVGV = Number(dealsStats[0]?.totalVGV || 0)

    // Calculate MRR (placeholder - will be real when subscription system is implemented)
    const mrr = 0

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">
                    Dashboard Admin
                </h1>
                <p className="text-muted-foreground">Bem-vindo, {session.user.name}!</p>
            </div>

            {/* Stats Grid */}
            <div className="grid md:grid-cols-4 gap-6">
                {/* Imobiliárias */}
                <div className="bg-zinc-900 border border-border rounded-xl p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-3 bg-primary/10 rounded-lg">
                            <Building2 className="h-6 w-6 text-primary" />
                        </div>
                        <h3 className="text-sm font-medium text-muted-foreground">Imobiliárias</h3>
                    </div>
                    <p className="text-4xl font-bold text-foreground">{tenantsCount.count}</p>
                    <p className="text-xs text-zinc-500 mt-2">Total de clientes ativos</p>
                </div>

                {/* Corretores */}
                <div className="bg-zinc-900 border border-border rounded-xl p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-3 bg-primary/5 rounded-lg">
                            <UsersIcon className="h-6 w-6 text-primary" />
                        </div>
                        <h3 className="text-sm font-medium text-muted-foreground">Corretores</h3>
                    </div>
                    <p className="text-4xl font-bold text-foreground">{brokersCount.count}</p>
                    <p className="text-xs text-zinc-500 mt-2">Total de usuários</p>
                </div>

                {/* Vendas */}
                <div className="bg-zinc-900 border border-border rounded-xl p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-3 bg-blue-500/10 rounded-lg">
                            <TrendingUp className="h-6 w-6 text-blue-400" />
                        </div>
                        <h3 className="text-sm font-medium text-muted-foreground">Vendas</h3>
                    </div>
                    <p className="text-4xl font-bold text-foreground">{totalDeals}</p>
                    <p className="text-xs text-zinc-500 mt-2">Total de negócios fechados</p>
                </div>

                {/* VGV Total */}
                <div className="bg-zinc-900 border border-border rounded-xl p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-3 bg-purple-500/10 rounded-lg">
                            <DollarSign className="h-6 w-6 text-purple-400" />
                        </div>
                        <h3 className="text-sm font-medium text-muted-foreground">VGV Total</h3>
                    </div>
                    <p className="text-4xl font-bold text-foreground">
                        {new Intl.NumberFormat('pt-BR', {
                            style: 'currency',
                            currency: 'BRL',
                            minimumFractionDigits: 0,
                            maximumFractionDigits: 0,
                            notation: 'compact',
                            compactDisplay: 'short'
                        }).format(totalVGV)}
                    </p>
                    <p className="text-xs text-zinc-500 mt-2">Valor total de vendas</p>
                </div>
            </div>

            {/* Recent Tenants */}
            <div className="bg-zinc-900 border border-border rounded-xl p-6">
                <h2 className="text-xl font-semibold text-foreground mb-4">Imobiliárias Recentes</h2>
                <div className="space-y-3">
                    {await db.select().from(tenants).limit(5).then(tenantsList =>
                        tenantsList.length > 0 ? (
                            tenantsList.map((tenant) => (
                                <div key={tenant.id} className="flex items-center justify-between p-4 bg-zinc-950 rounded-lg border border-border">
                                    <div>
                                        <h3 className="font-medium text-foreground">{tenant.name}</h3>
                                        <p className="text-sm text-zinc-500">/{tenant.slug}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs text-zinc-500">
                                            {tenant.createdAt ? new Date(tenant.createdAt).toLocaleDateString('pt-BR') : '-'}
                                        </p>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="text-zinc-500 text-center py-8">Nenhuma imobiliária cadastrada ainda</p>
                        )
                    )}
                </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-zinc-900 border border-border rounded-xl p-6">
                <h2 className="text-xl font-semibold text-foreground mb-4">Próximos Passos</h2>
                <ul className="space-y-2 text-muted-foreground">
                    <li>✅ Dashboard com dados reais implementado</li>
                    <li>⏳ Criar sistema de planos de assinatura</li>
                    <li>⏳ Implementar gestão de imobiliárias</li>
                    <li>⏳ Integrar Stripe/Asaas para pagamentos</li>
                </ul>
            </div>
        </div>
    )
}
