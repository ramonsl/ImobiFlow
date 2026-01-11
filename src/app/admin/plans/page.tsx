import { auth } from '@/auth'
import { db } from '@/lib/db'
import { subscriptionPlans } from '@/db/schema'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Package, Edit, Trash2, Plus, CheckCircle2 } from 'lucide-react'
import { desc } from 'drizzle-orm'

export default async function PlansPage() {
    const session = await auth()

    if (!session?.user || session.user.role !== 'admin') {
        redirect('/login')
    }

    // Get all plans from database
    const plans = await db.query.subscriptionPlans.findMany({
        orderBy: [desc(subscriptionPlans.amount)],
    })

    // Format currency
    const formatCurrency = (cents: number) => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL',
        }).format(cents / 100)
    }

    return (
        <div className="container mx-auto py-8 space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Planos de Assinatura</h1>
                    <p className="text-muted-foreground">
                        Gerencie os planos disponíveis para as imobiliárias
                    </p>
                </div>
                <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Novo Plano
                </Button>
            </div>

            {/* Plans Table */}
            <Card>
                <CardHeader>
                    <CardTitle>Planos Cadastrados</CardTitle>
                    <CardDescription>
                        {plans.length} plano(s) disponível(is)
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Plano</TableHead>
                                <TableHead>Valor</TableHead>
                                <TableHead>Trial</TableHead>
                                <TableHead>Limites</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Ações</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {plans.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                                        Nenhum plano cadastrado. Execute o seed script para criar os planos padrão.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                plans.map((plan) => (
                                    <TableRow key={plan.id}>
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-primary/10 rounded-lg">
                                                    <Package className="h-4 w-4 text-primary" />
                                                </div>
                                                <div>
                                                    <p className="font-medium">{plan.name}</p>
                                                    <p className="text-xs text-muted-foreground">
                                                        Stripe ID: {plan.stripePriceId || 'N/A'}
                                                    </p>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <p className="font-semibold">{formatCurrency(plan.amount)}</p>
                                            <p className="text-xs text-muted-foreground">
                                                {plan.interval === 'month' ? 'mensal' : 'anual'}
                                            </p>
                                        </TableCell>
                                        <TableCell>
                                            {plan.trialDays ? (
                                                <Badge variant="secondary">{plan.trialDays} dias</Badge>
                                            ) : (
                                                <span className="text-muted-foreground text-sm">Sem trial</span>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <div className="space-y-1 text-sm">
                                                <div className="flex items-center gap-2">
                                                    <CheckCircle2 className="h-3 w-3 text-primary" />
                                                    <span>
                                                        {plan.maxUsers || '∞'} usuários
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <CheckCircle2 className="h-3 w-3 text-primary" />
                                                    <span>
                                                        {plan.maxProperties || '∞'} imóveis
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <CheckCircle2 className="h-3 w-3 text-primary" />
                                                    <span>
                                                        {plan.maxDealsPerMonth || '∞'} vendas/mês
                                                    </span>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={plan.isActive ? 'default' : 'secondary'}>
                                                {plan.isActive ? 'Ativo' : 'Inativo'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <Button variant="ghost" size="sm">
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                                <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* Plans Grid View */}
            <div className="grid md:grid-cols-3 gap-6">
                {plans.map((plan) => (
                    <Card key={plan.id} className={plan.isActive ? 'border-primary/50' : ''}>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-lg">{plan.name}</CardTitle>
                                <Badge variant={plan.isActive ? 'default' : 'secondary'}>
                                    {plan.isActive ? 'Ativo' : 'Inativo'}
                                </Badge>
                            </div>
                            <div className="text-3xl font-bold">
                                {formatCurrency(plan.amount)}
                                <span className="text-sm text-muted-foreground font-normal">/mês</span>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {plan.trialDays && (
                                <div className="bg-secondary/50 rounded-lg p-3">
                                    <p className="text-sm font-medium">🎁 Trial de {plan.trialDays} dias</p>
                                </div>
                            )}

                            <div className="space-y-2">
                                <p className="text-sm font-medium">Limites:</p>
                                <ul className="space-y-1 text-sm text-muted-foreground">
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
                            </div>

                            <div className="pt-4 border-t">
                                <Button variant="outline" className="w-full">
                                    <Edit className="h-4 w-4 mr-2" />
                                    Editar Plano
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Info Box */}
            {plans.length === 0 && (
                <Card className="border-blue-500/20 bg-blue-500/5">
                    <CardHeader>
                        <CardTitle className="text-blue-400">💡 Nenhum Plano Cadastrado</CardTitle>
                        <CardDescription>
                            Execute o seed script para criar os planos padrão:
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <code className="block bg-black/50 p-4 rounded-lg text-sm">
                            npm run db:seed-plans
                        </code>
                        <p className="text-sm text-muted-foreground mt-4">
                            Isso criará os planos Starter (R$ 19,90), Professional (R$ 29,90) e Enterprise (R$ 49,90)
                        </p>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}
