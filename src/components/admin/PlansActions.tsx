'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Edit, Trash2, Plus, Power, PowerOff } from 'lucide-react'
import { PlanFormModal } from './PlanFormModal'
import { DeletePlanDialog } from './DeletePlanDialog'
import { togglePlanStatus } from '@/actions/plans'
import { useToast } from '@/hooks/use-toast'

interface PlansActionsProps {
    plans: any[]
}

export function PlansActions({ plans }: PlansActionsProps) {
    const { toast } = useToast()
    const [formModal, setFormModal] = useState<{
        isOpen: boolean
        mode: 'create' | 'edit'
        plan?: any
    }>({
        isOpen: false,
        mode: 'create',
    })
    const [deleteDialog, setDeleteDialog] = useState<{
        isOpen: boolean
        plan: { id: number; name: string } | null
    }>({
        isOpen: false,
        plan: null,
    })

    const handleToggleStatus = async (plan: any) => {
        const result = await togglePlanStatus(plan.id)

        if (result.success) {
            toast({
                title: plan.isActive ? 'Plano desativado' : 'Plano ativado',
                description: `O plano "${plan.name}" foi ${plan.isActive ? 'desativado' : 'ativado'} com sucesso.`,
            })
        } else {
            toast({
                title: 'Erro',
                description: result.error,
                variant: 'destructive',
            })
        }
    }

    return (
        <>
            {/* Create Button */}
            <Button onClick={() => setFormModal({ isOpen: true, mode: 'create' })}>
                <Plus className="h-4 w-4 mr-2" />
                Novo Plano
            </Button>

            {/* Action Buttons for each plan */}
            <div className="hidden">
                {plans.map((plan) => (
                    <div key={plan.id} className="flex items-center gap-2">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleToggleStatus(plan)}
                            title={plan.isActive ? 'Desativar plano' : 'Ativar plano'}
                        >
                            {plan.isActive ? (
                                <PowerOff className="h-4 w-4 text-orange-500" />
                            ) : (
                                <Power className="h-4 w-4 text-green-500" />
                            )}
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setFormModal({ isOpen: true, mode: 'edit', plan })}
                        >
                            <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="text-destructive hover:text-destructive"
                            onClick={() => setDeleteDialog({ isOpen: true, plan: { id: plan.id, name: plan.name } })}
                        >
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>
                ))}
            </div>

            {/* Modals */}
            <PlanFormModal
                isOpen={formModal.isOpen}
                onClose={() => setFormModal({ ...formModal, isOpen: false })}
                mode={formModal.mode}
                plan={formModal.plan}
            />

            <DeletePlanDialog
                isOpen={deleteDialog.isOpen}
                onClose={() => setDeleteDialog({ isOpen: false, plan: null })}
                plan={deleteDialog.plan}
            />
        </>
    )
}

// Export individual action buttons for use in the table
export function PlanActionButtons({ plan, onEdit, onDelete, onToggleStatus }: any) {
    return (
        <div className="flex items-center justify-end gap-2">
            <Button
                variant="ghost"
                size="sm"
                onClick={() => onToggleStatus(plan)}
                title={plan.isActive ? 'Desativar plano' : 'Ativar plano'}
            >
                {plan.isActive ? (
                    <PowerOff className="h-4 w-4 text-orange-500" />
                ) : (
                    <Power className="h-4 w-4 text-green-500" />
                )}
            </Button>
            <Button variant="ghost" size="sm" onClick={() => onEdit(plan)}>
                <Edit className="h-4 w-4" />
            </Button>
            <Button
                variant="ghost"
                size="sm"
                className="text-destructive hover:text-destructive"
                onClick={() => onDelete(plan)}
            >
                <Trash2 className="h-4 w-4" />
            </Button>
        </div>
    )
}
