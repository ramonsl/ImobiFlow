'use server'

import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { createCustomerPortalSession } from '@/lib/subscription-service'

export async function manageSubscriptionAction(slug: string) {
    const session = await auth()

    if (!session?.user || !session.user.tenantId) {
        redirect('/login')
    }

    // Ensure user is admin or accessing their own tenant
    if (session.user.role !== 'admin' && session.user.tenantSlug !== slug) {
        throw new Error('Unauthorized')
    }

    const returnUrl = `${process.env.NEXT_PUBLIC_APP_URL}/${slug}/billing`

    try {
        const portalUrl = await createCustomerPortalSession(session.user.tenantId, returnUrl)
        redirect(portalUrl)
    } catch (error) {
        if (error instanceof Error && error.message.includes('NEXT_REDIRECT')) {
            throw error
        }
        console.error('Failed to create portal session:', error)
        // If error, redirect back to billing with error param
        redirect(`/${slug}/billing?error=portal_creation_failed`)
    }
}
