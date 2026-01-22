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
