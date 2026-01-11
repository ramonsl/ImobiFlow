'use client'

import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { CheckCircle2, Lock, TrendingUp } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { FEATURE_NAMES, type FeatureKey } from '@/lib/feature-permissions'

interface UpgradeModalProps {
    isOpen: boolean
    onClose: () => void
    feature: FeatureKey
    currentPlan?: string
}

const PLAN_FEATURES: Record<string, FeatureKey[]> = {
    starter: ['brokers', 'ranking', 'tv_mode', 'deals', 'commissions', 'expenses', 'properties_import', 'whatsapp', 'pipeline', 'badges'],
    professional: ['brokers', 'ranking', 'tv_mode', 'deals', 'commissions', 'expenses', 'properties_import', 'whatsapp', 'pipeline', 'badges'],
    enterprise: ['brokers', 'ranking', 'tv_mode', 'deals', 'commissions', 'expenses', 'properties_import', 'whatsapp', 'pipeline', 'badges'],
}

const PLAN_INFO = {
    starter: {
        name: 'Starter',
        price: 'R$ 19,90',
        description: 'Ideal para imobiliárias pequenas',
    },
    professional: {
        name: 'Professional',
        price: 'R$ 29,90',
        description: 'Para imobiliárias em crescimento',
    },
    enterprise: {
        name: 'Enterprise',
        price: 'R$ 49,90',
        description: 'Solução completa sem limites',
    },
}

export function UpgradeModal({ isOpen, onClose, feature, currentPlan = 'trial' }: UpgradeModalProps) {
    const router = useRouter()
    const featureName = FEATURE_NAMES[feature]

    // Find which plans include this feature
    const plansWithFeature = Object.entries(PLAN_FEATURES)
        .filter(([_, features]) => features.includes(feature))
        .map(([planKey]) => planKey)

    // Get the cheapest plan that includes this feature
    const recommendedPlan = plansWithFeature[0] || 'starter'

    const handleUpgrade = () => {
        // Navigate to billing page
        router.push(`/${currentPlan}/billing`)
        onClose()
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-primary/10 rounded-lg">
                            <Lock className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                            <DialogTitle>Funcionalidade Bloqueada</DialogTitle>
                            <DialogDescription className="mt-1">
                                Esta funcionalidade não está disponível no seu plano atual
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    {/* Feature Info */}
                    <div className="bg-secondary/50 border border-border rounded-lg p-4">
                        <h4 className="font-semibold mb-1">{featureName}</h4>
                        <p className="text-sm text-muted-foreground">
                            Para acessar esta funcionalidade, faça upgrade para um plano que a inclua.
                        </p>
                    </div>

                    {/* Recommended Plan */}
                    <div className="border-2 border-primary rounded-lg p-4 space-y-3">
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="flex items-center gap-2">
                                    <h3 className="font-bold text-lg">{PLAN_INFO[recommendedPlan as keyof typeof PLAN_INFO].name}</h3>
                                    <Badge variant="default">Recomendado</Badge>
                                </div>
                                <p className="text-sm text-muted-foreground mt-1">
                                    {PLAN_INFO[recommendedPlan as keyof typeof PLAN_INFO].description}
                                </p>
                            </div>
                            <div className="text-right">
                                <p className="text-2xl font-bold text-primary">
                                    {PLAN_INFO[recommendedPlan as keyof typeof PLAN_INFO].price}
                                </p>
                                <p className="text-xs text-muted-foreground">/mês</p>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <p className="text-sm font-medium">Inclui:</p>
                            <ul className="grid grid-cols-2 gap-2 text-sm">
                                {PLAN_FEATURES[recommendedPlan].slice(0, 6).map((feat) => (
                                    <li key={feat} className="flex items-center gap-2">
                                        <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0" />
                                        <span className="truncate">{FEATURE_NAMES[feat as FeatureKey]}</span>
                                    </li>
                                ))}
                            </ul>
                            {PLAN_FEATURES[recommendedPlan].length > 6 && (
                                <p className="text-xs text-muted-foreground">
                                    +{PLAN_FEATURES[recommendedPlan].length - 6} outras funcionalidades
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Trial Info */}
                    {currentPlan === 'trial' && (
                        <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                            <p className="text-sm text-blue-900 dark:text-blue-100">
                                💡 <strong>Você está em período de teste.</strong> Após o trial, você terá acesso a todas as funcionalidades do plano Starter.
                            </p>
                        </div>
                    )}
                </div>

                <DialogFooter className="flex-col sm:flex-row gap-2">
                    <Button variant="outline" onClick={onClose} className="w-full sm:w-auto">
                        Voltar
                    </Button>
                    <Button onClick={handleUpgrade} className="w-full sm:w-auto">
                        <TrendingUp className="h-4 w-4 mr-2" />
                        Fazer Upgrade
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
