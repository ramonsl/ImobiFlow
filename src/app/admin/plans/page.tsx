import { auth } from '@/auth'
import { db } from '@/lib/db'
import { subscriptionPlans } from '@/db/schema'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Package, CheckCircle2 } from 'lucide-react'
import { desc } from 'drizzle-orm'
import { PlansPageClient } from '@/components/admin/PlansPageClient'

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
            <PlansPageClient plans={plans} />

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
                                        Nenhum plano cadastrado. Execute: npm run db:seed-plans
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
                                                        {plan.slug}
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
                                                <span className="text-muted-foreground text-sm">-</span>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <div className="space-y-1 text-sm">
                                                <div className="flex items-center gap-2">
                                                    <CheckCircle2 className="h-3 w-3 text-primary" />
                                                    <span>{plan.maxUsers || '∞'} usuários</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <CheckCircle2 className="h-3 w-3 text-primary" />
                                                    <span>{plan.maxProperties || '∞'} imóveis</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <CheckCircle2 className="h-3 w-3 text-primary" />
                                                    <span>{plan.maxDealsPerMonth || '∞'} vendas/mês</span>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={plan.isActive ? 'default' : 'secondary'}>
                                                {plan.isActive ? 'Ativo' : 'Inativo'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            {/* Actions will be rendered by client component */}
                                            <div id={`plan-actions-${plan.id}`} />
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

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
                    </CardContent>
                </Card>
            )}
        </div>
    )
}
