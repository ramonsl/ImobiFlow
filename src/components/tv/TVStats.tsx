"use client"

import { DollarSign, Target } from "lucide-react"
import { Progress } from "@/components/ui/progress"

interface StatsData {
    totalVGV: number
    goalVGV: number
    totalDeals: number
}

interface TVStatsProps {
    stats: StatsData
    fullscreen?: boolean
}

export default function TVStats({ stats, fullscreen = false }: TVStatsProps) {
    const progressPercentage = stats.goalVGV > 0
        ? (stats.totalVGV / stats.goalVGV) * 100
        : 0

    // Cap progress bar at 100% but show real percentage in text
    const progressBarValue = Math.min(progressPercentage, 100)

    if (fullscreen) {
        // Fullscreen version with larger elements
        return (
            <div className="grid grid-cols-2 gap-12">
                {/* Total VGV - Fullscreen */}
                <div className="bg-gradient-to-br from-primary/10 to-primary/5 border-4 border-primary/30 rounded-3xl p-12 flex flex-col">
                    <div className="flex items-center gap-6 mb-8">
                        <div className="p-6 bg-primary/20 rounded-2xl">
                            <DollarSign className="h-16 w-16 text-primary" />
                        </div>
                        <h3 className="text-4xl font-semibold text-zinc-300">VGV Total</h3>
                    </div>
                    <p className="text-7xl font-bold text-foreground mb-6 break-words">
                        {new Intl.NumberFormat('pt-BR', {
                            style: 'currency',
                            currency: 'BRL',
                            minimumFractionDigits: 0,
                            maximumFractionDigits: 0
                        }).format(stats.totalVGV)}
                    </p>
                    <p className="text-2xl text-muted-foreground">{stats.totalDeals} vendas realizadas</p>
                </div>

                {/* Goal Progress - Fullscreen */}
                <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-4 border-purple-500/30 rounded-3xl p-12 flex flex-col">
                    <div className="flex items-center gap-6 mb-8">
                        <div className="p-6 bg-purple-500/20 rounded-2xl">
                            <Target className="h-16 w-16 text-purple-400" />
                        </div>
                        <h3 className="text-4xl font-semibold text-zinc-300">Meta do Ano</h3>
                    </div>
                    <div className="space-y-6 flex-1 flex flex-col justify-center">
                        {/* Percentage - Main focus */}
                        <div className="text-center">
                            <p className="text-9xl font-bold text-foreground">
                                {progressPercentage > 0 && !isNaN(progressPercentage)
                                    ? `${progressPercentage.toFixed(1)}%`
                                    : '0%'}
                            </p>
                            <p className="text-2xl text-muted-foreground mt-4">atingido da meta</p>
                        </div>

                        {/* Progress bar */}
                        <Progress value={progressBarValue} className="h-6" />

                        {/* Values below */}
                        <div className="flex justify-between text-xl gap-4 pt-4">
                            <div className="text-left">
                                <p className="text-zinc-500 text-sm uppercase">Vendido</p>
                                <p className="text-primary font-bold text-2xl">
                                    {new Intl.NumberFormat('pt-BR', {
                                        style: 'currency',
                                        currency: 'BRL',
                                        minimumFractionDigits: 0,
                                        maximumFractionDigits: 0,
                                        notation: 'compact',
                                        compactDisplay: 'short'
                                    }).format(stats.totalVGV)}
                                </p>
                            </div>
                            <div className="text-right">
                                <p className="text-zinc-500 text-sm uppercase">Meta</p>
                                <p className="text-purple-400 font-bold text-2xl">
                                    {new Intl.NumberFormat('pt-BR', {
                                        style: 'currency',
                                        currency: 'BRL',
                                        minimumFractionDigits: 0,
                                        maximumFractionDigits: 0,
                                        notation: 'compact',
                                        compactDisplay: 'short'
                                    }).format(stats.goalVGV)}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    // Normal compact version (not used anymore but kept for compatibility)
    return (
        <div className="grid grid-cols-2 gap-6">
            {/* Total VGV */}
            <div className="bg-gradient-to-br from-primary/10 to-primary/5 border-2 border-primary/30 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-3">
                    <div className="p-3 bg-primary/20 rounded-lg">
                        <DollarSign className="h-8 w-8 text-primary" />
                    </div>
                    <h3 className="text-xl font-semibold text-zinc-300">VGV Total</h3>
                </div>
                <p className="text-4xl font-bold text-foreground">
                    {new Intl.NumberFormat('pt-BR', {
                        style: 'currency',
                        currency: 'BRL',
                        minimumFractionDigits: 0
                    }).format(stats.totalVGV)}
                </p>
                <p className="text-muted-foreground mt-2">{stats.totalDeals} vendas realizadas</p>
            </div>

            {/* Goal Progress */}
            <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-2 border-purple-500/30 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-3">
                    <div className="p-3 bg-purple-500/20 rounded-lg">
                        <Target className="h-8 w-8 text-purple-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-zinc-300">Meta do Ano</h3>
                </div>
                <div className="space-y-3">
                    <div className="flex items-baseline gap-2">
                        <p className="text-4xl font-bold text-foreground">
                            {new Intl.NumberFormat('pt-BR', {
                                style: 'currency',
                                currency: 'BRL',
                                minimumFractionDigits: 0,
                                maximumFractionDigits: 0
                            }).format(stats.totalVGV)}
                        </p>
                    </div>
                    <Progress value={progressBarValue} className="h-3" />
                    <div className="flex justify-between text-sm">
                        <p className="text-muted-foreground">
                            {progressPercentage > 0 && !isNaN(progressPercentage)
                                ? `${progressPercentage.toFixed(1)}% atingido`
                                : 'Meta não definida'}
                        </p>
                        <p className="text-muted-foreground">
                            Meta: {new Intl.NumberFormat('pt-BR', {
                                style: 'currency',
                                currency: 'BRL',
                                minimumFractionDigits: 0,
                                maximumFractionDigits: 0
                            }).format(stats.goalVGV)}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}
