import { z } from 'zod'

export const onboardingSchema = z.object({
    name: z.string().min(3, 'Nome da imobiliária deve ter pelo menos 3 caracteres'),
    slug: z.string()
        .min(3, 'O slug deve ter pelo menos 3 caracteres')
        .regex(/^[a-z0-9-]+$/, 'O slug deve conter apenas letras minúsculas, números e hífens'),
    adminName: z.string().min(3, 'Nome do administrador deve ter pelo menos 3 caracteres'),
    adminEmail: z.string().email('E-mail inválido'),
    password: z.string().min(8, 'A senha deve ter pelo menos 8 caracteres'),
    planSlug: z.string().min(1, 'Selecione um plano'),
})

export type OnboardingInput = z.infer<typeof onboardingSchema>
