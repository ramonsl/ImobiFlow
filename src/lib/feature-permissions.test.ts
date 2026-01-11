import { describe, it, expect, vi, beforeEach } from 'vitest'
import { hasFeatureAccess, getPlanFeatures, getLockedFeatures } from '@/lib/feature-permissions'

describe('Feature Permissions', () => {
    describe('hasFeatureAccess', () => {
        it('should allow access to basic features during starter trial', () => {
            expect(hasFeatureAccess('starter_trial', 'brokers')).toBe(true)
            expect(hasFeatureAccess('starter_trial', 'ranking')).toBe(true)
            expect(hasFeatureAccess('starter_trial', 'tv_mode')).toBe(true)
        })

        it('should block advanced features during starter trial', () => {
            expect(hasFeatureAccess('starter_trial', 'deals')).toBe(false)
            expect(hasFeatureAccess('starter_trial', 'commissions')).toBe(false)
            expect(hasFeatureAccess('starter_trial', 'expenses')).toBe(false)
        })

        it('should allow all features for starter plan after trial', () => {
            expect(hasFeatureAccess('starter', 'deals')).toBe(true)
            expect(hasFeatureAccess('starter', 'commissions')).toBe(true)
            expect(hasFeatureAccess('starter', 'whatsapp')).toBe(true)
        })

        it('should allow all features for professional plan', () => {
            expect(hasFeatureAccess('professional', 'deals')).toBe(true)
            expect(hasFeatureAccess('professional', 'pipeline')).toBe(true)
            expect(hasFeatureAccess('professional', 'badges')).toBe(true)
        })

        it('should allow all features for enterprise plan', () => {
            expect(hasFeatureAccess('enterprise', 'deals')).toBe(true)
            expect(hasFeatureAccess('enterprise', 'whatsapp')).toBe(true)
            expect(hasFeatureAccess('enterprise', 'badges')).toBe(true)
        })
    })

    describe('getPlanFeatures', () => {
        it('should return only basic features for trial', () => {
            const features = getPlanFeatures('starter_trial')
            expect(features).toEqual(['brokers', 'ranking', 'tv_mode'])
        })

        it('should return all features for paid plans', () => {
            const starterFeatures = getPlanFeatures('starter')
            const professionalFeatures = getPlanFeatures('professional')
            const enterpriseFeatures = getPlanFeatures('enterprise')

            expect(starterFeatures.length).toBeGreaterThan(3)
            expect(professionalFeatures.length).toBeGreaterThan(3)
            expect(enterpriseFeatures.length).toBeGreaterThan(3)
        })
    })

    describe('getLockedFeatures', () => {
        it('should return locked features for trial', () => {
            const locked = getLockedFeatures('starter_trial')

            expect(locked).toContain('deals')
            expect(locked).toContain('commissions')
            expect(locked).toContain('expenses')
            expect(locked).not.toContain('brokers')
            expect(locked).not.toContain('ranking')
        })

        it('should return empty array for plans with all features', () => {
            expect(getLockedFeatures('starter')).toEqual([])
            expect(getLockedFeatures('professional')).toEqual([])
            expect(getLockedFeatures('enterprise')).toEqual([])
        })
    })
})
