'use server'

import { db } from '@/lib/db'
import { tenants, users, subscriptions, subscriptionPlans } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { onboardingSchema, type OnboardingInput } from '@/lib/schemas/onboarding'
import bcrypt from 'bcryptjs'
import { logger } from '@/lib/logger'

/**
 * Onboard a new Imobiliária (Tenant)
 */
export async function onboardTenant(data: OnboardingInput) {
    logger.debug('🚀 Onboarding started for:', data.slug)

    try {
        // 1. Validate Input
        const validated = onboardingSchema.parse(data)

        // 2. Check Uniqueness (Slug and Email)
        const existingTenant = await db.query.tenants.findFirst({
            where: eq(tenants.slug, validated.slug)
        })

        if (existingTenant) {
            return { success: false, error: 'Este endereço (slug) já está sendo usado.' }
        }

        const existingUser = await db.query.users.findFirst({
            where: eq(users.email, validated.adminEmail)
        })

        if (existingUser) {
            return { success: false, error: 'Este e-mail já está cadastrado.' }
        }

        // 3. Get Plan
        const plan = await db.query.subscriptionPlans.findFirst({
            where: eq(subscriptionPlans.slug, validated.planSlug)
        })

        if (!plan) {
            return { success: false, error: 'Plano selecionado não encontrado.' }
        }

        // 4. Hash Password
        const hashedPassword = await bcrypt.hash(validated.password, 10)

        // 5. Sequential Inserts (Transaction not supported by neon-http)
        // Create Tenant
        const [newTenant] = await db.insert(tenants).values({
            name: validated.name,
            slug: validated.slug,
            subscriptionStatus: 'trialing',
            trialEndsAt: new Date(Date.now() + (plan.trialDays || 30) * 24 * 60 * 60 * 1000)
        }).returning()

        // Create Admin User
        await db.insert(users).values({
            name: validated.adminName,
            email: validated.adminEmail,
            password: hashedPassword,
            role: 'admin',
            tenantId: newTenant.id
        })

        // Create Initial Subscription (Trial)
        await db.insert(subscriptions).values({
            tenantId: newTenant.id,
            planId: plan.id,
            status: 'trialing',
            trialStart: new Date(),
            trialEnd: new Date(Date.now() + (plan.trialDays || 30) * 24 * 60 * 60 * 1000),
            currentPeriodStart: new Date(),
            currentPeriodEnd: new Date(Date.now() + (plan.trialDays || 30) * 24 * 60 * 60 * 1000)
        })

        logger.info('🎉 Onboarding successful for:', validated.slug)

        return {
            success: true,
            data: {
                tenantSlug: newTenant.slug,
                email: validated.adminEmail
            }
        }

    } catch (error) {
        logger.error('❌ Onboarding failed:', error)

        if (error instanceof Error) {
            return { success: false, error: error.message }
        }

        return { success: false, error: 'Erro inesperado ao realizar cadastro.' }
    }
}
