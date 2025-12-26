"use client"

import { motion, AnimatePresence } from "framer-motion"
import { Trophy, Medal, Award } from "lucide-react"

interface RankingData {
    brokerId: number
    brokerName: string
    avatarUrl: string | null
    totalSales: number
    totalVGV: number
}

interface TVRankingDisplayProps {
    ranking: RankingData[]
    showPodium: boolean
}

const podiumHeights = {
    1: "h-64",
    2: "h-48",
    3: "h-40"
}

const podiumColors = {
    1: "from-yellow-500/20 to-yellow-600/20 border-yellow-500/50",
    2: "from-zinc-500/20 to-zinc-600/20 border-zinc-500/50",
    3: "from-orange-500/20 to-orange-600/20 border-orange-500/50"
}

const icons = {
    1: Trophy,
    2: Medal,
    3: Award
}

const iconColors = {
    1: "text-yellow-500",
    2: "text-muted-foreground",
    3: "text-orange-500"
}

export default function TVRankingDisplay({ ranking, showPodium }: TVRankingDisplayProps) {
    if (ranking.length === 0) {
        return (
            <div className="flex items-center justify-center h-full">
                <p className="text-zinc-500 text-2xl">Nenhuma venda registrada ainda</p>
            </div>
        )
    }

    // Podium display (TOP 3)
    const podiumOrder = [
        ranking[1], // 2nd place
        ranking[0], // 1st place
        ranking[2]  // 3rd place
    ].filter(Boolean)

    // Table display (TOP 10)
    const top10 = ranking.slice(0, 10)

    return (
        <AnimatePresence mode="wait">
            {showPodium ? (
                // Podium View
                <motion.div
                    key="podium"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.5 }}
                    className="flex items-end justify-center gap-3 h-full"
                >
                    {podiumOrder.map((broker, index) => {
                        const actualPosition = index === 0 ? 2 : index === 1 ? 1 : 3
                        const Icon = icons[actualPosition as keyof typeof icons]

                        return (
                            <motion.div
                                key={broker.brokerId}
                                initial={{ opacity: 0, y: 50 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.2, duration: 0.5 }}
                                className="flex flex-col items-center gap-2"
                            >
                                {/* Avatar and Info */}
                                <div className="flex flex-col items-center gap-2">
                                    <div className="relative">
                                        {broker.avatarUrl ? (
                                            <img
                                                src={broker.avatarUrl}
                                                alt={broker.brokerName}
                                                className={`w-24 h-24 rounded-full border-4 ${actualPosition === 1 ? 'border-yellow-500' :
                                                    actualPosition === 2 ? 'border-zinc-400' :
                                                        'border-orange-500'
                                                    }`}
                                            />
                                        ) : (
                                            <div className={`w-24 h-24 rounded-full border-4 ${actualPosition === 1 ? 'border-yellow-500 bg-yellow-500/20' :
                                                actualPosition === 2 ? 'border-zinc-400 bg-zinc-500/20' :
                                                    'border-orange-500 bg-orange-500/20'
                                                } flex items-center justify-center`}>
                                                <span className="text-4xl font-bold text-foreground">
                                                    {broker.brokerName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                                                </span>
                                            </div>
                                        )}
                                        <div className={`absolute -bottom-1 -right-1 w-7 h-7 rounded-full ${actualPosition === 1 ? 'bg-yellow-500' :
                                            actualPosition === 2 ? 'bg-zinc-400' :
                                                'bg-orange-500'
                                            } flex items-center justify-center border-4 border-zinc-900`}>
                                            <span className="text-zinc-900 font-bold text-sm">{actualPosition}</span>
                                        </div>
                                    </div>

                                    <div className="text-center">
                                        <h3 className="text-2xl font-bold text-foreground">{broker.brokerName}</h3>
                                        <p className="text-primary text-xl font-semibold">
                                            {new Intl.NumberFormat('pt-BR', {
                                                style: 'currency',
                                                currency: 'BRL',
                                                minimumFractionDigits: 0
                                            }).format(broker.totalVGV)}
                                        </p>
                                        <p className="text-muted-foreground text-xs">{broker.totalSales} vendas</p>
                                    </div>
                                </div>

                                {/* Podium Block */}
                                <div className={`
                                    w-40 ${podiumHeights[actualPosition as keyof typeof podiumHeights]}
                                    bg-gradient-to-b ${podiumColors[actualPosition as keyof typeof podiumColors]}
                                    border-2 rounded-t-xl
                                    flex flex-col items-center justify-start pt-6
                                `}>
                                    <Icon className={`h-12 w-12 ${iconColors[actualPosition as keyof typeof iconColors]}`} />
                                </div>
                            </motion.div>
                        )
                    })}
                </motion.div>
            ) : (
                // Table View (TOP 10) - Compact version
                <motion.div
                    key="table"
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -50 }}
                    transition={{ duration: 0.5 }}
                    className="h-full flex items-center"
                >
                    <div className="w-full space-y-1.5">
                        {top10.map((broker, index) => (
                            <motion.div
                                key={broker.brokerId}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.05, duration: 0.3 }}
                                className={`
                                    flex items-center gap-3 p-2 rounded-lg border transition-all
                                    ${index === 0 ? 'bg-yellow-500/10 border-yellow-500/50' :
                                        index === 1 ? 'bg-zinc-500/10 border-zinc-500/50' :
                                            index === 2 ? 'bg-orange-500/10 border-orange-500/50' :
                                                'bg-zinc-800/50 border-input'}
                                `}
                            >
                                {/* Position */}
                                <div className={`
                                    w-8 h-8 rounded-full flex items-center justify-center font-bold text-base flex-shrink-0
                                    ${index === 0 ? 'bg-yellow-500 text-zinc-900' :
                                        index === 1 ? 'bg-zinc-400 text-zinc-900' :
                                            index === 2 ? 'bg-orange-500 text-zinc-900' :
                                                'bg-zinc-700 text-foreground'}
                                `}>
                                    {index + 1}
                                </div>

                                {/* Avatar */}
                                {broker.avatarUrl ? (
                                    <img
                                        src={broker.avatarUrl}
                                        alt={broker.brokerName}
                                        className="w-10 h-10 rounded-full border-2 border-primary flex-shrink-0"
                                    />
                                ) : (
                                    <div className="w-10 h-10 rounded-full bg-primary/20 border-2 border-primary flex items-center justify-center flex-shrink-0">
                                        <span className="text-lg font-bold text-foreground">
                                            {broker.brokerName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                                        </span>
                                    </div>
                                )}

                                {/* Info */}
                                <div className="flex-1 min-w-0">
                                    <h4 className="text-foreground font-bold text-base truncate">{broker.brokerName}</h4>
                                    <p className="text-muted-foreground text-xs">{broker.totalSales} vendas</p>
                                </div>

                                {/* VGV - Compact notation */}
                                <div className="text-right flex-shrink-0">
                                    <p className="text-primary font-bold text-base">
                                        {new Intl.NumberFormat('pt-BR', {
                                            style: 'currency',
                                            currency: 'BRL',
                                            minimumFractionDigits: 0,
                                            maximumFractionDigits: 0,
                                            notation: 'compact',
                                            compactDisplay: 'short'
                                        }).format(broker.totalVGV)}
                                    </p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}
