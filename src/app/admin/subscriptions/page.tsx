import { auth } from '@/auth'
import { db } from '@/lib/db'
import { subscriptions, subscriptionPlans, tenants, invoices } from '@/db/schema'
import { eq, sql, desc, and, gte } from 'drizzle-orm'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { DollarSign, TrendingUp, Users, AlertCircle } from 'lucide-react'

export default async function AdminSubscriptionsPage() {
    const session = await auth()

    // Only admins can access
    if (!session?.user || session.user.role !== 'admin') {
        redirect('/login')
    }

    // Get all subscriptions with tenant and plan info
    const allSubscriptions = await db
        .select({
            subscription: subscriptions,
            tenant: tenants,
            plan: subscriptionPlans,
        })
        .from(subscriptions)
        .leftJoin(tenants, eq(subscriptions.tenantId, tenants.id))
        .leftJoin(subscriptionPlans, eq(subscriptions.planId, subscriptionPlans.id))
        .orderBy(desc(subscriptions.createdAt))

    // Calculate MRR (Monthly Recurring Revenue)
    const activeSubscriptions = allSubscriptions.filter(
        (s) => s.subscription.status === 'active' || s.subscription.status === 'trialing'
    )

    const mrr = activeSubscriptions.reduce((total, sub) => {
        return total + (sub.plan?.amount || 0)
    }, 0)

    // Get subscription counts by status
    const statusCounts = {
        active: allSubscriptions.filter((s) => s.subscription.status === 'active').length,
        trialing: allSubscriptions.filter((s) => s.subscription.status === 'trialing').length,
        past_due: allSubscriptions.filter((s) => s.subscription.status === 'past_due').length,
        canceled: allSubscriptions.filter((s) => s.subscription.status === 'canceled').length,
    }

    // Get upcoming renewals (next 30 days)
    const thirtyDaysFromNow = new Date()
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30)

    const upcomingRenewals = activeSubscriptions.filter((s) => {
        const endDate = s.subscription.currentPeriodEnd
        return endDate && endDate <= thirtyDaysFromNow
    })

    const upcomingRevenue = upcomingRenewals.reduce((total, sub) => {
        return total + (sub.plan?.amount || 0)
    }, 0)

    // Format currency
    const formatCurrency = (cents: number) => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL',
        }).format(cents / 100)
    }

    // Format date
    const formatDate = (date: Date | null) => {
        if (!date) return '-'
        return new Intl.DateTimeFormat('pt-BR').format(date)
    }

    // Get status badge
    const getStatusBadge = (status: string) => {
        const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
            active: 'default',
            trialing: 'secondary',
            past_due: 'destructive',
            canceled: 'outline',
        }

        const labels: Record<string, string> = {
            active: 'Ativo',
            trialing: 'Trial',
            past_due: 'Inadimplente',
            canceled: 'Cancelado',
            unpaid: 'Não Pago',
        }

        return (
            <Badge variant={variants[status] || 'outline'}>
                {labels[status] || status}
            </Badge>
        )
    }

    return (
        <div className="container mx-auto py-8 space-y-8">
            <div>
                <h1 className="text-3xl font-bold">Assinaturas</h1>
                <p className="text-muted-foreground">
                    Gerencie todas as assinaturas e visualize métricas de receita
                </p>
            </div>

            {/* Metrics Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">MRR</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatCurrency(mrr)}</div>
                        <p className="text-xs text-muted-foreground">
                            Receita Recorrente Mensal
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Assinantes Ativos</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{statusCounts.active}</div>
                        <p className="text-xs text-muted-foreground">
                            +{statusCounts.trialing} em trial
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Próximos 30 Dias</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatCurrency(upcomingRevenue)}</div>
                        <p className="text-xs text-muted-foreground">
                            {upcomingRenewals.length} renovações
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Inadimplentes</CardTitle>
                        <AlertCircle className="h-4 w-4 text-destructive" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{statusCounts.past_due}</div>
                        <p className="text-xs text-muted-foreground">
                            Requer atenção
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Subscriptions Table */}
            <Card>
                <CardHeader>
                    <CardTitle>Todas as Assinaturas</CardTitle>
                    <CardDescription>
                        Lista completa de imobiliárias e seus status de assinatura
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Imobiliária</TableHead>
                                <TableHead>Plano</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Valor</TableHead>
                                <TableHead>Período Atual</TableHead>
                                <TableHead>Criado em</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {allSubscriptions.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center text-muted-foreground">
                                        Nenhuma assinatura encontrada
                                    </TableCell>
                                </TableRow>
                            ) : (
                                allSubscriptions.map((item) => (
                                    <TableRow key={item.subscription.id}>
                                        <TableCell className="font-medium">
                                            {item.tenant?.name || 'N/A'}
                                        </TableCell>
                                        <TableCell>
                                            {item.plan?.name || 'N/A'}
                                        </TableCell>
                                        <TableCell>
                                            {getStatusBadge(item.subscription.status)}
                                        </TableCell>
                                        <TableCell>
                                            {formatCurrency(item.plan?.amount || 0)}
                                        </TableCell>
                                        <TableCell className="text-sm text-muted-foreground">
                                            {formatDate(item.subscription.currentPeriodStart)} -{' '}
                                            {formatDate(item.subscription.currentPeriodEnd)}
                                        </TableCell>
                                        <TableCell className="text-sm text-muted-foreground">
                                            {formatDate(item.subscription.createdAt)}
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    )
}
