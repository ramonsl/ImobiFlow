'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Edit, Trash2, Power, PowerOff } from 'lucide-react'
import { PlanFormModal } from './PlanFormModal'
import { DeletePlanDialog } from './DeletePlanDialog'
import { togglePlanStatus } from '@/actions/plans'
import { useToast } from '@/hooks/use-toast'

interface PlanRowActionsProps {
    plan: any // Typed as any to handle serialization looseness, can be stricter later
}

export function PlanRowActions({ plan }: PlanRowActionsProps) {
    const { toast } = useToast()
    const [formModalOpen, setFormModalOpen] = useState(false)
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)

    // Local loading state for toggle could be added, but optimistic UI is fine for now

    const handleToggleStatus = async () => {
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
        <div className="flex items-center justify-end gap-2">
            <Button
                variant="ghost"
                size="sm"
                onClick={handleToggleStatus}
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
                onClick={() => setFormModalOpen(true)}
                data-testid="edit-plan-btn"
            >
                <Edit className="h-4 w-4" />
            </Button>
            <Button
                variant="ghost"
                size="sm"
                className="text-destructive hover:text-destructive"
                onClick={() => setDeleteDialogOpen(true)}
                data-testid="delete-plan-btn"
            >
                <Trash2 className="h-4 w-4" />
            </Button>

            <PlanFormModal
                isOpen={formModalOpen}
                onClose={() => setFormModalOpen(false)}
                mode="edit"
                plan={plan}
            />

            <DeletePlanDialog
                isOpen={deleteDialogOpen}
                onClose={() => setDeleteDialogOpen(false)}
                plan={plan}
            />
        </div>
    )
}
