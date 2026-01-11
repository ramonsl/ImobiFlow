import { auth } from '@/auth'
import { db } from '@/lib/db'
import { subscriptions, subscriptionPlans, tenants, invoices } from '@/db/schema'
import { eq, desc } from 'drizzle-orm'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { CreditCard, Download, CheckCircle2, XCircle, Clock, TrendingUp } from 'lucide-react'

interface BillingPageProps {
    params: {
        slug: string
    }
}

export default async function BillingPage({ params }: BillingPageProps) {
    const session = await auth()

    if (!session?.user) {
        redirect('/login')
    }

    // Get tenant
    const tenant = await db.query.tenants.findFirst({
        where: eq(tenants.slug, params.slug),
    })

    if (!tenant) {
        redirect('/login')
    }

    // Check access
    if (session.user.role !== 'admin' && session.user.tenantSlug !== params.slug) {
        redirect('/login')
    }

    // Get subscription
    const subscription = await db.query.subscriptions.findFirst({
        where: eq(subscriptions.tenantId, tenant.id),
    })

    // Get plan separately if subscription exists
    let currentPlan = null
    if (subscription?.planId) {
        currentPlan = await db.query.subscriptionPlans.findFirst({
            where: eq(subscriptionPlans.id, subscription.planId),
        })
    }

    // Get all available plans
    const allPlans = await db.query.subscriptionPlans.findMany({
        where: eq(subscriptionPlans.isActive, true),
    })

    // Get invoices
    const tenantInvoices = await db.query.invoices.findMany({
        where: eq(invoices.tenantId, tenant.id),
        orderBy: [desc(invoices.createdAt)],
        limit: 10,
    })

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
        return new Intl.DateTimeFormat('pt-BR', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
        }).format(date)
    }

    const isInTrial = subscription?.status === 'trialing'

    return (
        <div className="container mx-auto py-8 space-y-8">
            <div>
                <h1 className="text-3xl font-bold">Assinatura e Cobrança</h1>
                <p className="text-muted-foreground">
                    Gerencie sua assinatura, visualize faturas e atualize seu plano
                </p>
            </div>

            {/* Current Plan */}
            <Card>
                <CardHeader>
                    <CardTitle>Plano Atual</CardTitle>
                    <CardDescription>
                        {isInTrial ? 'Você está em período de teste' : 'Seu plano ativo'}
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    {subscription && currentPlan ? (
                        <>
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-2xl font-bold">{currentPlan.name}</h3>
                                    <p className="text-3xl font-bold text-primary mt-2">
                                        {formatCurrency(currentPlan.amount)}
                                        <span className="text-sm text-muted-foreground font-normal">/mês</span>
                                    </p>
                                </div>
                                <Badge variant={isInTrial ? 'secondary' : 'default'} className="text-sm px-4 py-2">
                                    {isInTrial ? '🎁 Trial Ativo' : '✓ Ativo'}
                                </Badge>
                            </div>

                            {isInTrial && subscription.trialEnd && (
                                <div className="bg-secondary/50 border border-border rounded-lg p-4">
                                    <div className="flex items-center gap-2 text-sm">
                                        <Clock className="h-4 w-4" />
                                        <span>
                                            Seu período de teste termina em{' '}
                                            <strong>{formatDate(subscription.trialEnd)}</strong>
                                        </span>
                                    </div>
                                    <p className="text-xs text-muted-foreground mt-2">
                                        Após o trial, você será cobrado {formatCurrency(currentPlan.amount)} mensalmente
                                    </p>
                                </div>
                            )}

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div className="space-y-1">
                                    <p className="text-sm text-muted-foreground">Usuários</p>
                                    <p className="text-lg font-semibold">
                                        {currentPlan.maxUsers || '∞'}
                                    </p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-sm text-muted-foreground">Imóveis</p>
                                    <p className="text-lg font-semibold">
                                        {currentPlan.maxProperties || '∞'}
                                    </p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-sm text-muted-foreground">Vendas/Mês</p>
                                    <p className="text-lg font-semibold">
                                        {currentPlan.maxDealsPerMonth || '∞'}
                                    </p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-sm text-muted-foreground">Próxima Cobrança</p>
                                    <p className="text-lg font-semibold">
                                        {formatDate(subscription.currentPeriodEnd)}
                                    </p>
                                </div>
                            </div>

                            {subscription.cancelAtPeriodEnd && (
                                <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
                                    <div className="flex items-center gap-2 text-sm text-destructive">
                                        <XCircle className="h-4 w-4" />
                                        <span>
                                            Sua assinatura será cancelada em{' '}
                                            <strong>{formatDate(subscription.currentPeriodEnd)}</strong>
                                        </span>
                                    </div>
                                    <Button variant="outline" size="sm" className="mt-3">
                                        Reativar Assinatura
                                    </Button>
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="text-center py-8">
                            <p className="text-muted-foreground mb-4">Você não possui uma assinatura ativa</p>
                            <Button>Escolher um Plano</Button>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Available Plans */}
            <Card>
                <CardHeader>
                    <CardTitle>Planos Disponíveis</CardTitle>
                    <CardDescription>
                        Faça upgrade ou downgrade do seu plano a qualquer momento
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid md:grid-cols-3 gap-4">
                        {allPlans.map((plan) => {
                            const isCurrentPlan = currentPlan?.id === plan.id
                            const isUpgrade = currentPlan && plan.amount > currentPlan.amount

                            return (
                                <Card key={plan.id} className={isCurrentPlan ? 'border-primary' : ''}>
                                    <CardHeader>
                                        <div className="flex items-center justify-between">
                                            <CardTitle className="text-lg">{plan.name}</CardTitle>
                                            {isCurrentPlan && (
                                                <Badge variant="default">Atual</Badge>
                                            )}
                                        </div>
                                        <div className="text-3xl font-bold">
                                            {formatCurrency(plan.amount)}
                                            <span className="text-sm text-muted-foreground font-normal">/mês</span>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <ul className="space-y-2 text-sm">
                                            <li className="flex items-center gap-2">
                                                <CheckCircle2 className="h-4 w-4 text-primary" />
                                                {plan.maxUsers || 'Usuários ilimitados'}
                                                {plan.maxUsers && ' usuários'}
                                            </li>
                                            <li className="flex items-center gap-2">
                                                <CheckCircle2 className="h-4 w-4 text-primary" />
                                                {plan.maxProperties || 'Imóveis ilimitados'}
                                                {plan.maxProperties && ' imóveis'}
                                            </li>
                                            <li className="flex items-center gap-2">
                                                <CheckCircle2 className="h-4 w-4 text-primary" />
                                                {plan.maxDealsPerMonth
                                                    ? `${plan.maxDealsPerMonth} vendas/mês`
                                                    : 'Vendas ilimitadas'}
                                            </li>
                                        </ul>

                                        {!isCurrentPlan && (
                                            <Button
                                                className="w-full"
                                                variant={isUpgrade ? 'default' : 'outline'}
                                            >
                                                {isUpgrade ? (
                                                    <>
                                                        <TrendingUp className="h-4 w-4 mr-2" />
                                                        Fazer Upgrade
                                                    </>
                                                ) : (
                                                    'Mudar para este Plano'
                                                )}
                                            </Button>
                                        )}
                                    </CardContent>
                                </Card>
                            )
                        })}
                    </div>
                </CardContent>
            </Card>

            {/* Invoice History */}
            <Card>
                <CardHeader>
                    <CardTitle>Histórico de Faturas</CardTitle>
                    <CardDescription>
                        Visualize e baixe suas faturas anteriores
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {tenantInvoices.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                            Nenhuma fatura encontrada
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Data</TableHead>
                                    <TableHead>Valor</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Ações</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {tenantInvoices.map((invoice) => (
                                    <TableRow key={invoice.id}>
                                        <TableCell>{formatDate(invoice.createdAt)}</TableCell>
                                        <TableCell className="font-medium">
                                            {formatCurrency(invoice.amount)}
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={invoice.status === 'paid' ? 'default' : 'destructive'}>
                                                {invoice.status === 'paid' ? 'Pago' : 'Pendente'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            {invoice.invoicePdf && (
                                                <Button variant="ghost" size="sm" asChild>
                                                    <a href={invoice.invoicePdf} target="_blank" rel="noopener noreferrer">
                                                        <Download className="h-4 w-4 mr-2" />
                                                        PDF
                                                    </a>
                                                </Button>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>

            {/* Payment Method */}
            <Card>
                <CardHeader>
                    <CardTitle>Método de Pagamento</CardTitle>
                    <CardDescription>
                        Gerencie seu cartão de crédito
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <CreditCard className="h-8 w-8 text-muted-foreground" />
                            <div>
                                <p className="font-medium">•••• •••• •••• 4242</p>
                                <p className="text-sm text-muted-foreground">Expira em 12/2025</p>
                            </div>
                        </div>
                        <Button variant="outline">Atualizar Cartão</Button>
                    </div>
                </CardContent>
            </Card>

            {/* Danger Zone */}
            {subscription && !subscription.cancelAtPeriodEnd && (
                <Card className="border-destructive/50">
                    <CardHeader>
                        <CardTitle className="text-destructive">Zona de Perigo</CardTitle>
                        <CardDescription>
                            Ações irreversíveis relacionadas à sua assinatura
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="font-medium">Cancelar Assinatura</p>
                                <p className="text-sm text-muted-foreground">
                                    Você manterá acesso até {formatDate(subscription.currentPeriodEnd)}
                                </p>
                            </div>
                            <Button variant="destructive">Cancelar Plano</Button>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}
