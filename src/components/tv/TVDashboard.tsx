"use client"

import { useEffect, useState } from "react"
import TVRankingDisplay from "./TVRankingDisplay"
import TVStats from "./TVStats"
import TVSalesFeed from "./TVSalesFeed"
import { Trophy, TrendingUp } from "lucide-react"

interface TVDashboardProps {
    tenantId: number
    tenantName: string
    logoUrl?: string | null
}

interface RankingData {
    brokerId: number
    brokerName: string
    avatarUrl: string | null
    totalSales: number
    totalVGV: number
}

interface DealData {
    id: number
    propertyName: string
    propertyAddress: string
    vgv: number
    saleDate: string
    participants: {
        name: string
        role: string
        isResponsible: boolean
    }[]
}

interface StatsData {
    totalVGV: number
    goalVGV: number
    totalDeals: number
}

export default function TVDashboard({ tenantId, tenantName, logoUrl }: TVDashboardProps) {
    const [ranking, setRanking] = useState<RankingData[]>([])
    const [recentDeals, setRecentDeals] = useState<DealData[]>([])
    const [stats, setStats] = useState<StatsData>({ totalVGV: 0, goalVGV: 0, totalDeals: 0 })
    const [currentTime, setCurrentTime] = useState(new Date())
    const [currentPeriodIndex, setCurrentPeriodIndex] = useState(0)
    const [showPodium, setShowPodium] = useState(true)
    const [showStatsOnly, setShowStatsOnly] = useState(false)

    const periods = [
        { key: 'month', label: 'do Mês', periodValue: new Date().getMonth() + 1 },
        { key: 'quarter', label: 'do Trimestre', periodValue: Math.ceil((new Date().getMonth() + 1) / 3) },
        { key: 'semester', label: 'do Semestre', periodValue: Math.ceil((new Date().getMonth() + 1) / 6) },
        { key: 'anual', label: 'do Ano', periodValue: 1 }
    ]

    const currentPeriod = periods[currentPeriodIndex]

    const fetchData = async () => {
        try {
            const currentYear = new Date().getFullYear()

            console.log(`[TV Mode] Fetching data for tenant ${tenantId}, period ${currentPeriod.key}, year ${currentYear}`)

            // Fetch ranking
            const rankingRes = await fetch(`/api/rankings?tenantId=${tenantId}&period=${currentPeriod.key}&year=${currentYear}&periodValue=${currentPeriod.periodValue}`)
            if (!rankingRes.ok) {
                console.error('[TV Mode] Failed to fetch rankings:', await rankingRes.text())
                throw new Error('Failed to fetch rankings')
            }

            const rankingData = await rankingRes.json()
            console.log('[TV Mode] Ranking data:', rankingData)

            const mappedRanking = (Array.isArray(rankingData) ? rankingData : []).slice(0, 10).map(item => ({
                brokerId: item.id,
                brokerName: item.name,
                avatarUrl: item.avatarUrl || null,
                totalSales: 1,
                totalVGV: item.vendido || 0
            }))

            setRanking(mappedRanking)

            // Fetch recent deals
            const dealsRes = await fetch(`/api/deals?tenantId=${tenantId}&year=${currentYear}`)
            if (!dealsRes.ok) {
                console.error('[TV Mode] Failed to fetch deals:', await dealsRes.text())
                throw new Error('Failed to fetch deals')
            }

            const dealsData = await dealsRes.json()
            console.log('[TV Mode] Deals data:', dealsData)

            const mappedDeals = (Array.isArray(dealsData) ? dealsData : [])
                .sort((a, b) => new Date(b.saleDate).getTime() - new Date(a.saleDate).getTime())
                .slice(0, 7)
                .map(deal => ({
                    id: deal.id,
                    propertyName: deal.propertyTitle || 'Imóvel',
                    propertyAddress: deal.propertyAddress || '',
                    vgv: typeof deal.saleValue === 'string' ? parseFloat(deal.saleValue) : (deal.saleValue || 0),
                    saleDate: deal.saleDate || new Date().toISOString(),
                    participants: (deal.participants || []).map((p: any) => ({
                        name: p.brokerName || p.participantName || 'Participante',
                        role: p.role || 'Corretor',
                        isResponsible: p.isResponsible || false
                    }))
                }))

            setRecentDeals(mappedDeals)

            // Calculate total VGV
            const totalVGV = (Array.isArray(dealsData) ? dealsData : []).reduce((sum, deal) => {
                const value = typeof deal.saleValue === 'string' ? parseFloat(deal.saleValue) : (deal.saleValue || 0)
                return sum + value
            }, 0)
            const totalDeals = Array.isArray(dealsData) ? dealsData.length : 0

            // Fetch tenant goal
            let goalVGV = 0
            try {
                const goalsRes = await fetch(`/api/settings/goals?tenantId=${tenantId}&year=${currentYear}`)
                if (goalsRes.ok) {
                    const goalsData = await goalsRes.json()
                    console.log('[TV Mode] Goals data:', goalsData)

                    if (goalsData.metaAnual) {
                        goalVGV = typeof goalsData.metaAnual === 'string'
                            ? parseFloat(goalsData.metaAnual)
                            : goalsData.metaAnual
                    }
                }
            } catch (err) {
                console.error('[TV Mode] Failed to fetch goals:', err)
            }

            console.log('[TV Mode] Stats:', { totalVGV, totalDeals, goalVGV })

            setStats({
                totalVGV,
                goalVGV,
                totalDeals
            })
        } catch (error) {
            console.error("Erro ao buscar dados do TV Mode:", error)
        }
    }

    useEffect(() => {
        fetchData()
        const interval = setInterval(fetchData, 60000)
        return () => clearInterval(interval)
    }, [tenantId, currentPeriodIndex])

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000)
        return () => clearInterval(timer)
    }, [])

    // Rotation cycle: Podium → Table for each of 4 periods, then Stats fullscreen
    useEffect(() => {
        const rotationInterval = setInterval(() => {
            if (showStatsOnly) {
                // End of stats view, restart cycle
                setShowStatsOnly(false)
                setCurrentPeriodIndex(0)
                setShowPodium(true)
            } else if (showPodium) {
                // Podium → Table
                setShowPodium(false)
            } else {
                // Table → next
                if (currentPeriodIndex < periods.length - 1) {
                    // Go to next period podium
                    setCurrentPeriodIndex(prev => prev + 1)
                    setShowPodium(true)
                } else {
                    // Last period done, show stats
                    setShowStatsOnly(true)
                }
            }
        }, 10000)

        return () => clearInterval(rotationInterval)
    }, [showPodium, showStatsOnly, currentPeriodIndex])

    return (
        <div className="h-full w-full p-8 flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-6">
                    {logoUrl ? (
                        <div className="bg-white/10 p-4 rounded-xl backdrop-blur-sm border border-white/10 shadow-2xl flex items-center justify-center min-w-[200px]">
                            <img
                                src={logoUrl}
                                alt={tenantName}
                                className="max-h-20 w-auto object-contain"
                            />
                        </div>
                    ) : (
                        <h1 className="text-4xl font-bold text-foreground">
                            <span className="text-primary">{tenantName}</span> Ranking
                        </h1>
                    )}
                    {logoUrl && (
                        <h1 className="text-4xl font-bold text-foreground">
                            Ranking
                        </h1>
                    )}
                </div>
                <div className="text-right">
                    <div className="text-5xl font-bold text-foreground">
                        {currentTime.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                    </div>
                    <div className="text-muted-foreground text-lg">
                        {currentTime.toLocaleDateString('pt-BR', {
                            weekday: 'long',
                            day: 'numeric',
                            month: 'long'
                        })}
                    </div>
                </div>
            </div>

            {/* Main Content */}
            {showStatsOnly ? (
                // Stats Full Screen View
                <div className="flex-1 flex items-center justify-center">
                    <div className="w-full max-w-7xl px-12">
                        <TVStats stats={stats} fullscreen={true} />
                    </div>
                </div>
            ) : (
                // Normal Grid View
                <div className="flex-1 grid grid-cols-3 gap-8 overflow-hidden">
                    {/* Left Column - Podium/Ranking */}
                    <div className="col-span-2 flex flex-col overflow-hidden">
                        <div className="bg-zinc-900/50 backdrop-blur-xl rounded-2xl border border-border p-8 flex-1 flex flex-col overflow-hidden">
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-3">
                                    <Trophy className="h-8 w-8 text-primary" />
                                    <h2 className="text-3xl font-bold text-foreground">TOP 3 {currentPeriod.label}</h2>
                                </div>
                                <div className="flex gap-2">
                                    {periods.map((period, index) => (
                                        <div
                                            key={period.key}
                                            className={`h-2 w-8 rounded-full transition-all ${index === currentPeriodIndex
                                                ? 'bg-primary'
                                                : 'bg-zinc-700'
                                                }`}
                                        />
                                    ))}
                                </div>
                            </div>
                            <div className="flex-1 overflow-hidden">
                                <TVRankingDisplay ranking={ranking} showPodium={showPodium} />
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Recent Sales */}
                    <div className="bg-zinc-900/50 backdrop-blur-xl rounded-2xl border border-border p-6 overflow-hidden flex flex-col">
                        <div className="flex items-center gap-3 mb-6">
                            <TrendingUp className="h-7 w-7 text-primary" />
                            <h2 className="text-2xl font-bold text-foreground">Últimas Vendas</h2>
                        </div>
                        <div className="flex-1 overflow-hidden">
                            <TVSalesFeed deals={recentDeals} />
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
