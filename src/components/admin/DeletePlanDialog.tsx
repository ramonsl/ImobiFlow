'use client'

import { useState } from 'react'
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { deletePlan } from '@/actions/plans'
import { useToast } from '@/hooks/use-toast'
import { Loader2 } from 'lucide-react'

interface DeletePlanDialogProps {
    isOpen: boolean
    onClose: () => void
    plan: { id: number; name: string } | null
}

export function DeletePlanDialog({ isOpen, onClose, plan }: DeletePlanDialogProps) {
    const { toast } = useToast()
    const [loading, setLoading] = useState(false)

    const handleDelete = async () => {
        if (!plan) return

        setLoading(true)
        try {
            const result = await deletePlan(plan.id)

            if (result.success) {
                toast({
                    title: 'Plano excluído!',
                    description: `O plano "${plan.name}" foi excluído com sucesso.`,
                })
                onClose()
            } else {
                toast({
                    title: 'Erro ao excluir',
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
        <AlertDialog open={isOpen} onOpenChange={onClose}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Tem certeza?</AlertDialogTitle>
                    <AlertDialogDescription>
                        Você está prestes a excluir o plano <strong>"{plan?.name}"</strong>.
                        Esta ação não pode ser desfeita.
                        {' '}
                        Se houver assinaturas ativas neste plano, a exclusão será bloqueada.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel disabled={loading}>Cancelar</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={handleDelete}
                        disabled={loading}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Excluir Plano
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}
