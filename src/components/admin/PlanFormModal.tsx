'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { createPlan, updatePlan, type PlanInput } from '@/actions/plans'
import { useToast } from '@/hooks/use-toast'
import { Loader2 } from 'lucide-react'

interface PlanFormModalProps {
    isOpen: boolean
    onClose: () => void
    plan?: any // Existing plan for edit mode
    mode: 'create' | 'edit'
}

export function PlanFormModal({ isOpen, onClose, plan, mode }: PlanFormModalProps) {
    const { toast } = useToast()
    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState<Partial<PlanInput>>({
        name: '',
        slug: '',
        stripePriceId: '',
        amount: 0,
        currency: 'brl',
        interval: 'month',
        trialDays: 0,
        maxUsers: null,
        maxProperties: null,
        maxDealsPerMonth: null,
        isActive: true,
    })

    useEffect(() => {
        if (isOpen) {
            if (mode === 'edit' && plan) {
                setFormData({
                    name: plan.name,
                    slug: plan.slug,
                    stripePriceId: plan.stripePriceId || '',
                    amount: plan.amount,
                    currency: plan.currency,
                    interval: plan.interval,
                    trialDays: plan.trialDays || 0,
                    maxUsers: plan.maxUsers,
                    maxProperties: plan.maxProperties,
                    maxDealsPerMonth: plan.maxDealsPerMonth,
                    isActive: plan.isActive,
                })
            } else {
                setFormData({
                    name: '',
                    slug: '',
                    stripePriceId: '',
                    amount: 0,
                    currency: 'brl',
                    interval: 'month',
                    trialDays: 0,
                    maxUsers: null,
                    maxProperties: null,
                    maxDealsPerMonth: null,
                    isActive: true,
                })
            }
        }
    }, [isOpen, plan, mode])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            const result = mode === 'create'
                ? await createPlan(formData as PlanInput)
                : await updatePlan(plan.id, formData)

            if (result.success) {
                toast({
                    title: mode === 'create' ? 'Plano criado!' : 'Plano atualizado!',
                    description: `O plano foi ${mode === 'create' ? 'criado' : 'atualizado'} com sucesso.`,
                })
                onClose()
            } else {
                toast({
                    title: 'Erro',
                    description: result.error,
                    variant: 'destructive',
                })
            }
        } catch (error) {
            toast({
                title: 'Erro',
                description: 'Ocorreu um erro inesperado',
                variant: 'destructive',
            })
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>
                        {mode === 'create' ? 'Novo Plano' : 'Editar Plano'}
                    </DialogTitle>
                    <DialogDescription>
                        {mode === 'create'
                            ? 'Crie um novo plano de assinatura'
                            : 'Atualize as informações do plano'}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Nome do Plano *</Label>
                            <Input
                                id="name"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="Ex: Professional"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="slug">Slug *</Label>
                            <Input
                                id="slug"
                                value={formData.slug}
                                onChange={(e) => setFormData({ ...formData, slug: e.target.value.toLowerCase() })}
                                placeholder="Ex: professional"
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="stripePriceId">Stripe Price ID</Label>
                        <Input
                            id="stripePriceId"
                            value={formData.stripePriceId}
                            onChange={(e) => setFormData({ ...formData, stripePriceId: e.target.value })}
                            placeholder="price_..."
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="amount">Valor (em centavos) *</Label>
                            <Input
                                id="amount"
                                type="number"
                                value={formData.amount}
                                onChange={(e) => setFormData({ ...formData, amount: parseInt(e.target.value) })}
                                placeholder="1990 = R$ 19,90"
                                required
                            />
                            <p className="text-xs text-muted-foreground">
                                R$ {((formData.amount || 0) / 100).toFixed(2)}
                            </p>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="trialDays">Dias de Trial</Label>
                            <Input
                                id="trialDays"
                                type="number"
                                value={formData.trialDays}
                                onChange={(e) => setFormData({ ...formData, trialDays: parseInt(e.target.value) })}
                                placeholder="0"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="maxUsers">Máx. Usuários</Label>
                            <Input
                                id="maxUsers"
                                type="number"
                                value={formData.maxUsers || ''}
                                onChange={(e) => setFormData({ ...formData, maxUsers: e.target.value ? parseInt(e.target.value) : null })}
                                placeholder="Ilimitado"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="maxProperties">Máx. Imóveis</Label>
                            <Input
                                id="maxProperties"
                                type="number"
                                value={formData.maxProperties || ''}
                                onChange={(e) => setFormData({ ...formData, maxProperties: e.target.value ? parseInt(e.target.value) : null })}
                                placeholder="Ilimitado"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="maxDeals">Máx. Vendas/Mês</Label>
                            <Input
                                id="maxDeals"
                                type="number"
                                value={formData.maxDealsPerMonth || ''}
                                onChange={(e) => setFormData({ ...formData, maxDealsPerMonth: e.target.value ? parseInt(e.target.value) : null })}
                                placeholder="Ilimitado"
                            />
                        </div>
                    </div>

                    <div className="flex items-center space-x-2">
                        <Switch
                            id="isActive"
                            checked={formData.isActive}
                            onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                        />
                        <Label htmlFor="isActive">Plano ativo</Label>
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={loading}>
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {mode === 'create' ? 'Criar Plano' : 'Salvar Alterações'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
