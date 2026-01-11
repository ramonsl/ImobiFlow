import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { checkFeatureAccess } from '@/lib/subscription-service'

/**
 * API endpoint to check if user has access to a feature
 * GET /api/features/check?feature=deals
 */
export async function GET(request: NextRequest) {
    const session = await auth()

    if (!session?.user?.tenantId) {
        return NextResponse.json(
            { error: 'Unauthorized' },
            { status: 401 }
        )
    }

    const searchParams = request.nextUrl.searchParams
    const feature = searchParams.get('feature')

    if (!feature) {
        return NextResponse.json(
            { error: 'Feature parameter is required' },
            { status: 400 }
        )
    }

    try {
        const hasAccess = await checkFeatureAccess(session.user.tenantId, feature)

        // Get subscription info for additional context
        const { getSubscription } = await import('@/lib/subscription-service')
        const subscription = await getSubscription(session.user.tenantId)

        return NextResponse.json({
            hasAccess,
            planName: subscription?.plan?.name || null,
            isInTrial: subscription?.status === 'trialing',
        })
    } catch (error) {
        console.error('Error checking feature access:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}
