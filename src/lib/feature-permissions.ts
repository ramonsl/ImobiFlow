// Feature permissions per plan
export const PLAN_FEATURES = {
    starter_trial: ['brokers', 'ranking', 'tv_mode'], // During 1-month trial
    starter: ['*'], // After trial period - All features
    professional: ['*'], // All features
    enterprise: ['*'], // All features
} as const

export const FEATURE_NAMES = {
    brokers: 'Cadastro de Corretores',
    ranking: 'Ranking de Vendas',
    tv_mode: 'Modo TV',
    deals: 'Registro de Vendas',
    commissions: 'Gestão de Comissões',
    expenses: 'Lançamento de Despesas',
    properties_import: 'Importação de Imóveis',
    whatsapp: 'WhatsApp Bot',
    pipeline: 'Pipeline de Vendas',
    badges: 'Sistema de Conquistas',
} as const

export type FeatureKey = keyof typeof FEATURE_NAMES
export type PlanKey = keyof typeof PLAN_FEATURES

/**
 * Check if a feature is available for a given plan
 */
export function hasFeatureAccess(
    planKey: PlanKey,
    feature: FeatureKey
): boolean {
    const planFeatures = PLAN_FEATURES[planKey]

    // If plan has all features (*)
    if (planFeatures.includes('*')) {
        return true
    }

    // Check if specific feature is in the plan
    return planFeatures.includes(feature)
}

/**
 * Get all available features for a plan
 */
export function getPlanFeatures(planKey: PlanKey): FeatureKey[] {
    const planFeatures = PLAN_FEATURES[planKey]

    if (planFeatures.includes('*')) {
        return Object.keys(FEATURE_NAMES) as FeatureKey[]
    }

    return planFeatures as FeatureKey[]
}

/**
 * Get locked features for a plan
 */
export function getLockedFeatures(planKey: PlanKey): FeatureKey[] {
    const allFeatures = Object.keys(FEATURE_NAMES) as FeatureKey[]
    const availableFeatures = getPlanFeatures(planKey)

    return allFeatures.filter(f => !availableFeatures.includes(f))
}
