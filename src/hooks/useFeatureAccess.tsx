'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'

export interface FeatureAccess {
    hasAccess: boolean
    isLoading: boolean
    planName: string | null
    isInTrial: boolean
}

/**
 * Hook to check if user has access to a specific feature
 * based on their subscription plan
 */
export function useFeatureAccess(featureKey: string): FeatureAccess {
    const { data: session, status } = useSession()
    const [access, setAccess] = useState<FeatureAccess>({
        hasAccess: false,
        isLoading: true,
        planName: null,
        isInTrial: false,
    })

    useEffect(() => {
        async function checkAccess() {
            if (status === 'loading') {
                return
            }

            if (!session?.user?.tenantId) {
                setAccess({
                    hasAccess: false,
                    isLoading: false,
                    planName: null,
                    isInTrial: false,
                })
                return
            }

            try {
                // Call API to check feature access
                const response = await fetch(`/api/features/check?feature=${featureKey}`)
                const data = await response.json()

                setAccess({
                    hasAccess: data.hasAccess || false,
                    isLoading: false,
                    planName: data.planName || null,
                    isInTrial: data.isInTrial || false,
                })
            } catch (error) {
                console.error('Error checking feature access:', error)
                setAccess({
                    hasAccess: false,
                    isLoading: false,
                    planName: null,
                    isInTrial: false,
                })
            }
        }

        checkAccess()
    }, [featureKey, session, status])

    return access
}

/**
 * Component wrapper to conditionally render based on feature access
 */
interface FeatureGateProps {
    feature: string
    children: React.ReactNode
    fallback?: React.ReactNode
    onAccessDenied?: () => void
}

export function FeatureGate({ feature, children, fallback, onAccessDenied }: FeatureGateProps) {
    const { hasAccess, isLoading } = useFeatureAccess(feature)

    useEffect(() => {
        if (!isLoading && !hasAccess && onAccessDenied) {
            onAccessDenied()
        }
    }, [hasAccess, isLoading, onAccessDenied])

    if (isLoading) {
        return null
    }

    if (!hasAccess) {
        return fallback || null
    }

    return <>{children}</>
}
