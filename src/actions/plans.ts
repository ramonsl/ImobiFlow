'use server'

import { db } from '@/lib/db'
import { subscriptionPlans } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

/**
 * Zod schema for plan validation
 */
export const planSchema = z.object({
    name: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres'),
    slug: z.string().min(3, 'Slug deve ter no mínimo 3 caracteres').regex(/^[a-z0-9-]+$/, 'Slug deve conter apenas letras minúsculas, números e hífens'),
    stripePriceId: z.preprocess(
        (val) => val === '' ? null : val,
        z.string().nullable().optional()
    ),
    amount: z.number().min(0, 'Valor deve ser maior ou igual a zero'),
    currency: z.enum(['brl', 'usd']).default('brl'),
    interval: z.enum(['month', 'year']).default('month'),
    trialDays: z.number().min(0).max(365).default(0),
    maxUsers: z.number().nullable(),
    maxProperties: z.number().nullable(),
    maxDealsPerMonth: z.number().nullable(),
    features: z.array(z.string()).default([]),
    isActive: z.boolean().default(true),
})

export type PlanInput = z.infer<typeof planSchema>

/**
 * Create a new subscription plan
 */
export async function createPlan(data: PlanInput) {
    console.log('📝 createPlan input:', data)
    try {
        // Validate input
        const validated = planSchema.parse(data)
        console.log('✅ createPlan validated:', validated)

        // Check if slug already exists
        const existingSlug = await db.query.subscriptionPlans.findFirst({
            where: eq(subscriptionPlans.slug, validated.slug),
        })

        if (existingSlug) {
            return {
                success: false,
                error: 'Já existe um plano com este slug',
            }
        }

        // Check if stripePriceId already exists (if provided)
        if (validated.stripePriceId) {
            const existingStripeId = await db.query.subscriptionPlans.findFirst({
                where: eq(subscriptionPlans.stripePriceId, validated.stripePriceId),
            })

            if (existingStripeId) {
                return {
                    success: false,
                    error: 'Já existe um plano com este ID do Stripe',
                }
            }
        }

        // Create plan
        const [plan] = await db.insert(subscriptionPlans).values(validated).returning()
        console.log('🎉 createPlan success:', plan.id)

        try {
            revalidatePath('/admin/plans')
        } catch (e) {
            console.error('❌ Revalidate failed:', e)
        }

        return {
            success: true,
            data: { id: plan.id },
        }
    } catch (error: any) {
        console.error('❌ Error creating plan:', error)

        if (error instanceof z.ZodError) {
            return {
                success: false,
                error: (error as any).issues.map((e: any) => `${e.path.join('.')}: ${e.message}`).join(', '),
            }
        }

        return {
            success: false,
            error: error.message || 'Erro desconhecido ao criar plano',
        }
    }
}

/**
 * Update an existing subscription plan
 */
export async function updatePlan(id: number, data: Partial<PlanInput>) {
    console.log('📝 updatePlan input:', { id, data })
    try {
        // Validate input
        const validated = planSchema.partial().parse(data)
        console.log('✅ updatePlan validated:', validated)

        // Check if plan exists
        const existing = await db.query.subscriptionPlans.findFirst({
            where: eq(subscriptionPlans.id, id),
        })

        if (!existing) {
            return {
                success: false,
                error: 'Plano não encontrado',
            }
        }

        // If changing slug, check if new slug is available
        if (validated.slug && validated.slug !== existing.slug) {
            const slugExists = await db.query.subscriptionPlans.findFirst({
                where: eq(subscriptionPlans.slug, validated.slug),
            })

            if (slugExists) {
                return {
                    success: false,
                    error: 'Já existe um plano com este slug',
                }
            }
        }

        // If changing stripePriceId, check uniqueness
        if (validated.stripePriceId && validated.stripePriceId !== existing.stripePriceId) {
            const stripeIdExists = await db.query.subscriptionPlans.findFirst({
                where: eq(subscriptionPlans.stripePriceId, validated.stripePriceId),
            })

            if (stripeIdExists) {
                return {
                    success: false,
                    error: 'Já existe um plano com este ID do Stripe',
                }
            }
        }

        // Update plan
        const [plan] = await db
            .update(subscriptionPlans)
            .set({
                ...validated,
                updatedAt: new Date(),
            })
            .where(eq(subscriptionPlans.id, id))
            .returning()

        console.log('🎉 updatePlan success:', plan.id)

        try {
            revalidatePath('/admin/plans')
        } catch (e) {
            console.error('❌ Revalidate failed:', e)
        }

        return {
            success: true,
            data: { id: plan.id },
        }
    } catch (error: any) {
        console.error('❌ Error updating plan:', error)

        if (error instanceof z.ZodError) {
            return {
                success: false,
                error: (error as any).issues.map((e: any) => `${e.path.join('.')}: ${e.message}`).join(', '),
            }
        }

        return {
            success: false,
            error: error.message || 'Erro desconhecido ao atualizar plano',
        }
    }
}

/**
 * Delete a subscription plan
 */
export async function deletePlan(id: number) {
    try {
        // Check if plan exists
        const existing = await db.query.subscriptionPlans.findFirst({
            where: eq(subscriptionPlans.id, id),
        })

        if (!existing) {
            return {
                success: false,
                error: 'Plano não encontrado',
            }
        }

        // Check if plan has active subscriptions
        const { subscriptions } = await import('@/db/schema')
        const activeSubscriptions = await db.query.subscriptions.findFirst({
            where: eq(subscriptions.planId, id),
        })

        if (activeSubscriptions) {
            return {
                success: false,
                error: 'Não é possível excluir um plano com assinaturas ativas. Desative o plano ao invés de excluí-lo.',
            }
        }

        // Delete plan
        await db.delete(subscriptionPlans).where(eq(subscriptionPlans.id, id))

        try {
            revalidatePath('/admin/plans')
        } catch (e) {
            console.error('❌ Revalidate failed:', e)
        }

        return {
            success: true,
        }
    } catch (error) {
        console.error('Error deleting plan:', error)
        return {
            success: false,
            error: 'Erro ao excluir plano',
        }
    }
}

/**
 * Toggle plan active status
 */
export async function togglePlanStatus(id: number) {
    try {
        const existing = await db.query.subscriptionPlans.findFirst({
            where: eq(subscriptionPlans.id, id),
        })

        if (!existing) {
            return {
                success: false,
                error: 'Plano não encontrado',
            }
        }

        const [plan] = await db
            .update(subscriptionPlans)
            .set({
                isActive: !existing.isActive,
                updatedAt: new Date(),
            })
            .where(eq(subscriptionPlans.id, id))
            .returning()

        try {
            revalidatePath('/admin/plans')
        } catch (e) {
            console.error('❌ Revalidate failed:', e)
        }

        return {
            success: true,
            data: { id: plan.id },
        }
    } catch (error) {
        console.error('Error toggling plan status:', error)
        return {
            success: false,
            error: 'Erro ao alterar status do plano',
        }
    }
}
