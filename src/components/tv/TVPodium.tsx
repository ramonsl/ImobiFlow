"use client"

import { motion } from "framer-motion"
import { Trophy, Medal, Award } from "lucide-react"

interface RankingData {
    brokerId: number
    brokerName: string
    avatarUrl: string | null
    totalSales: number
    totalVGV: number
}

interface TVPodiumProps {
    ranking: RankingData[]
}

const podiumHeights = {
    1: "h-48",
    2: "h-36",
    3: "h-28"
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

export default function TVPodium({ ranking }: TVPodiumProps) {
    if (ranking.length === 0) {
        return (
            <div className="flex items-center justify-center h-full">
                <p className="text-zinc-500 text-2xl">Nenhuma venda registrada ainda</p>
            </div>
        )
    }

    // Reorder for podium display: 2nd, 1st, 3rd
    const podiumOrder = [
        ranking[1], // 2nd place
        ranking[0], // 1st place
        ranking[2]  // 3rd place
    ].filter(Boolean)

    return (
        <div className="flex items-end justify-center gap-3 h-full">
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
                                        className={`w-16 h-16 rounded-full border-4 ${actualPosition === 1 ? 'border-yellow-500' :
                                                actualPosition === 2 ? 'border-zinc-400' :
                                                    'border-orange-500'
                                            }`}
                                    />
                                ) : (
                                    <div className={`w-16 h-16 rounded-full border-4 ${actualPosition === 1 ? 'border-yellow-500 bg-yellow-500/20' :
                                            actualPosition === 2 ? 'border-zinc-400 bg-zinc-500/20' :
                                                'border-orange-500 bg-orange-500/20'
                                        } flex items-center justify-center`}>
                                        <span className="text-2xl font-bold text-foreground">
                                            {broker.brokerName.charAt(0)}
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
                                <h3 className="text-lg font-bold text-foreground">{broker.brokerName}</h3>
                                <p className="text-primary text-base font-semibold">
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
                            w-32 ${podiumHeights[actualPosition as keyof typeof podiumHeights]}
                            bg-gradient-to-b ${podiumColors[actualPosition as keyof typeof podiumColors]}
                            border-2 rounded-t-xl
                            flex flex-col items-center justify-start pt-4
                        `}>
                            <Icon className={`h-8 w-8 ${iconColors[actualPosition as keyof typeof iconColors]}`} />
                        </div>
                    </motion.div>
                )
            })}
        </div>
    )
}
