import { auth } from "@/auth"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Sidebar } from "@/components/dashboard/Sidebar"
import { Button } from "@/components/ui/button"
import { SalesFilters } from "@/components/vendas/SalesFilters"
import { Pagination } from "@/components/vendas/Pagination"
import { db } from "@/lib/db"
import { tenants, deals, brokers, dealParticipants } from "@/db/schema"
import { eq, desc, and, gte, lte, like, count, sql } from "drizzle-orm"
import { Plus, Home, Calendar, DollarSign, Users, Eye } from "lucide-react"

interface SearchParams {
    page?: string
    limit?: string
    status?: string
    brokerId?: string
    search?: string
    dateFrom?: string
    dateTo?: string
}

export default async function VendasPage({
    params,
    searchParams
}: {
    params: Promise<{ slug: string }>
    searchParams: Promise<SearchParams>
}) {
    const { slug } = await params
    const filters = await searchParams

    const session = await auth()

    if (!session?.user) {
        redirect("/login")
    }

    if (session.user.tenantSlug !== slug) {
        redirect("/login")
    }

    const tenant = await db.select().from(tenants).where(eq(tenants.slug, slug)).then(res => res[0])
    if (!tenant) {
        redirect("/login")
    }

    // Fetch brokers for filter
    const brokersList = await db
        .select()
        .from(brokers)
        .where(eq(brokers.tenantId, tenant.id))
        .orderBy(brokers.name)

    // Parse pagination params
    const page = parseInt(filters.page || '1')
    const limit = parseInt(filters.limit || '25')
    const offset = (page - 1) * limit

    // Build filter conditions
    const conditions = [eq(deals.tenantId, tenant.id)]

    if (filters.status) {
        conditions.push(eq(deals.status, filters.status))
    }

    if (filters.dateFrom) {
        conditions.push(gte(deals.saleDate, new Date(filters.dateFrom)))
    }

    if (filters.dateTo) {
        conditions.push(lte(deals.saleDate, new Date(filters.dateTo)))
    }

    if (filters.search) {
        conditions.push(
            sql`(${deals.propertyTitle} ILIKE ${'%' + filters.search + '%'} OR ${deals.propertyAddress} ILIKE ${'%' + filters.search + '%'})`
        )
    }

    // If filtering by broker, we need to join with dealParticipants
    let dealsList
    if (filters.brokerId) {
        dealsList = await db
            .selectDistinct({
                id: deals.id,
                tenantId: deals.tenantId,
                propertyId: deals.propertyId,
                propertyTitle: deals.propertyTitle,
                propertyAddress: deals.propertyAddress,
                saleValue: deals.saleValue,
                saleDate: deals.saleDate,
                netCommission: deals.netCommission,
                status: deals.status,
                createdAt: deals.createdAt,
                updatedAt: deals.updatedAt
            })
            .from(deals)
            .innerJoin(dealParticipants, eq(dealParticipants.dealId, deals.id))
            .where(and(
                ...conditions,
                eq(dealParticipants.brokerId, parseInt(filters.brokerId))
            ))
            .orderBy(desc(deals.saleDate))
            .limit(limit)
            .offset(offset)
    } else {
        dealsList = await db
            .select()
            .from(deals)
            .where(and(...conditions))
            .orderBy(desc(deals.saleDate))
            .limit(limit)
            .offset(offset)
    }

    // Get total count for pagination
    const [{ total }] = filters.brokerId
        ? await db
            .select({ total: count() })
            .from(deals)
            .innerJoin(dealParticipants, eq(dealParticipants.dealId, deals.id))
            .where(and(
                ...conditions,
                eq(dealParticipants.brokerId, parseInt(filters.brokerId))
            ))
        : await db
            .select({ total: count() })
            .from(deals)
            .where(and(...conditions))

    const totalPages = Math.ceil(total / limit)

    const formatCurrency = (value: string | null) => {
        if (!value) return "R$ 0,00"
        return `R$ ${parseFloat(value).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
    }

    const formatDate = (date: Date | null) => {
        if (!date) return "-"
        return new Date(date).toLocaleDateString('pt-BR')
    }

    const getStatusBadge = (status: string | null) => {
        switch (status) {
            case 'completed':
                return <span className="px-2 py-1 rounded-full text-xs font-medium bg-primary/20 text-primary">Concluída</span>
            case 'pending':
                return <span className="px-2 py-1 rounded-full text-xs font-medium bg-amber-500/20 text-amber-400">Pendente</span>
            case 'cancelled':
                return <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-500/20 text-red-400">Cancelada</span>
            default:
                return <span className="px-2 py-1 rounded-full text-xs font-medium bg-zinc-500/20 text-muted-foreground">-</span>
        }
    }

    // Calculate totals (only for current filtered results)
    const totalSales = dealsList.reduce((sum, d) => sum + parseFloat(d.saleValue || '0'), 0)
    const totalCommission = dealsList.reduce((sum, d) => sum + parseFloat(d.netCommission || '0'), 0)

    return (
        <div className="flex min-h-screen bg-background">
            <Sidebar tenantSlug={slug} tenantName={tenant.name} logoUrl={tenant.logoUrl} />

            <main className="flex-1 ml-64 p-8">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-foreground mb-2">Vendas</h1>
                        <p className="text-muted-foreground">Gerencie as vendas da imobiliária</p>
                    </div>
                    <Link href={`/${slug}/vendas/nova`}>
                        <Button className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20 border border-primary/50">
                            <Plus className="h-4 w-4 mr-2" />
                            Nova Venda
                        </Button>
                    </Link>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-3 gap-6 mb-8">
                    <div className="bg-card border border-border rounded-lg p-6">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 rounded-lg bg-primary/20">
                                <DollarSign className="h-5 w-5 text-primary" />
                            </div>
                            <span className="text-muted-foreground text-sm">Total Vendas (Filtrado)</span>
                        </div>
                        <p className="text-2xl font-bold text-foreground">{formatCurrency(totalSales.toString())}</p>
                    </div>
                    <div className="bg-card border border-border rounded-lg p-6">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 rounded-lg bg-blue-500/20">
                                <Users className="h-5 w-5 text-blue-500" />
                            </div>
                            <span className="text-muted-foreground text-sm">Total Comissões</span>
                        </div>
                        <p className="text-2xl font-bold text-foreground">{formatCurrency(totalCommission.toString())}</p>
                    </div>
                    <div className="bg-card border border-border rounded-lg p-6">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 rounded-lg bg-purple-500/20">
                                <Home className="h-5 w-5 text-purple-500" />
                            </div>
                            <span className="text-muted-foreground text-sm">Vendas Encontradas</span>
                        </div>
                        <p className="text-2xl font-bold text-foreground">{total}</p>
                    </div>
                </div>

                {/* Filters */}
                <SalesFilters brokers={brokersList} />

                {/* Deals Table */}
                <div className="bg-card border border-border rounded-lg overflow-hidden">
                    <table className="w-full">
                        <thead className="border-b border-border">
                            <tr className="text-muted-foreground text-sm">
                                <th className="text-left p-4 font-medium">Imóvel</th>
                                <th className="text-left p-4 font-medium">Data</th>
                                <th className="text-left p-4 font-medium">Valor Venda</th>
                                <th className="text-left p-4 font-medium">Comissão</th>
                                <th className="text-left p-4 font-medium">Status</th>
                                <th className="text-right p-4 font-medium">Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {dealsList.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="text-center py-12 text-muted-foreground">
                                        <Home className="h-12 w-12 mx-auto mb-3 text-zinc-600" />
                                        <p>Nenhuma venda encontrada</p>
                                        {Object.keys(filters).length > 0 ? (
                                            <p className="text-sm mt-2">Tente ajustar os filtros</p>
                                        ) : (
                                            <Link href={`/${slug}/vendas/nova`}>
                                                <Button variant="link" className="text-primary mt-2">
                                                    Registrar primeira venda
                                                </Button>
                                            </Link>
                                        )}
                                    </td>
                                </tr>
                            ) : dealsList.map((deal) => (
                                <tr key={deal.id} className="border-b border-border/50 hover:bg-zinc-800/30">
                                    <td className="p-4">
                                        <div>
                                            <p className="text-foreground font-medium">{deal.propertyTitle}</p>
                                            {deal.propertyAddress && (
                                                <p className="text-zinc-500 text-sm truncate max-w-xs">{deal.propertyAddress}</p>
                                            )}
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <span className="text-zinc-300">{formatDate(deal.saleDate)}</span>
                                    </td>
                                    <td className="p-4">
                                        <span className="text-foreground font-semibold">{formatCurrency(deal.saleValue)}</span>
                                    </td>
                                    <td className="p-4">
                                        <span className="text-primary font-semibold">{formatCurrency(deal.netCommission)}</span>
                                    </td>
                                    <td className="p-4">
                                        {getStatusBadge(deal.status)}
                                    </td>
                                    <td className="p-4 text-right">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="text-muted-foreground hover:text-foreground"
                                        >
                                            <Eye className="h-4 w-4" />
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <Pagination
                    currentPage={page}
                    totalPages={totalPages}
                    totalItems={total}
                    itemsPerPage={limit}
                />
            </main>
        </div>
    )
}
