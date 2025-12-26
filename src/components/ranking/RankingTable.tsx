"use client"

import { useEffect, useState } from "react"
import { Crown } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"

interface BrokerRanking {
    position: number
    id: number
    name: string
    email: string
    metaAnual: number
    vendido: number
    percentMeta: number
    avatarUrl?: string | null
}

interface RankingTableProps {
    tenantId: number
    period: "anual" | "semestral" | "trimestral" | "mensal"
    year: number
    periodValue?: number
    searchTerm: string
    sortBy: string
}

export function RankingTable({ tenantId, period, year, periodValue, searchTerm, sortBy }: RankingTableProps) {
    const [rankings, setRankings] = useState<BrokerRanking[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchRankings = async () => {
            setLoading(true)
            try {
                const params = new URLSearchParams({
                    tenantId: tenantId.toString(),
                    period,
                    year: year.toString(),
                    search: searchTerm,
                    sort: sortBy
                })

                if (periodValue) {
                    params.append('periodValue', periodValue.toString())
                }

                const response = await fetch(`/api/rankings?${params}`)
                const data = await response.json()
                setRankings(data)
            } catch (error) {
                console.error("Error fetching rankings:", error)
            } finally {
                setLoading(false)
            }
        }

        fetchRankings()
    }, [tenantId, period, year, periodValue, searchTerm, sortBy])

    const getStatusBadge = (percentMeta: number) => {
        if (percentMeta >= 100) {
            return <Badge className="bg-primary/20 text-primary border-primary/50">🔥 Acima de 100%</Badge>
        } else if (percentMeta >= 50) {
            return <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/50">50-79%</Badge>
        } else {
            return <Badge className="bg-zinc-500/20 text-muted-foreground border-zinc-500/50">50-79%</Badge>
        }
    }

    const getPositionIcon = (position: number) => {
        if (position === 1) {
            return <Crown className="h-5 w-5 text-primary" />
        } else if (position === 2) {
            return <div className="w-5 h-5 rounded-full bg-zinc-400 flex items-center justify-center text-xs font-bold text-zinc-900">2</div>
        } else if (position === 3) {
            return <div className="w-5 h-5 rounded-full bg-amber-700 flex items-center justify-center text-xs font-bold text-foreground">3</div>
        }
        return null
    }

    if (loading) {
        return (
            <div className="bg-card border border-border rounded-lg p-12 text-center">
                <p className="text-muted-foreground">Carregando rankings...</p>
            </div>
        )
    }

    return (
        <div className="bg-card border border-border rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="border-b border-border">
                        <tr className="text-muted-foreground text-sm">
                            <th className="text-left p-4 font-medium">#</th>
                            <th className="text-left p-4 font-medium">Corretor</th>
                            <th className="text-left p-4 font-medium">Meta Anual</th>
                            <th className="text-left p-4 font-medium">Vendido</th>
                            <th className="text-left p-4 font-medium">Progresso</th>
                            <th className="text-left p-4 font-medium">% Meta</th>
                            <th className="text-left p-4 font-medium">Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {rankings.map((broker) => (
                            <tr
                                key={broker.id}
                                className="border-b border-border/50 hover:bg-zinc-800/30 transition-colors"
                            >
                                {/* Position */}
                                <td className="p-4">
                                    <div className="flex items-center gap-2">
                                        {getPositionIcon(broker.position)}
                                        <span className="text-muted-foreground text-sm">{broker.position}º</span>
                                    </div>
                                </td>

                                {/* Broker */}
                                <td className="p-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-zinc-700 to-zinc-800 flex items-center justify-center text-foreground font-semibold overflow-hidden">
                                            {broker.avatarUrl ? (
                                                <img src={broker.avatarUrl} alt={broker.name} className="w-full h-full object-cover" />
                                            ) : (
                                                broker.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
                                            )}
                                        </div>
                                        <div>
                                            <p className="text-foreground font-medium">{broker.name}</p>
                                            <p className="text-zinc-500 text-xs">{broker.email}</p>
                                        </div>
                                    </div>
                                </td>

                                {/* Meta Anual */}
                                <td className="p-4">
                                    <p className="text-zinc-300">
                                        R$ {broker.metaAnual.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                    </p>
                                </td>

                                {/* Vendido */}
                                <td className="p-4">
                                    <p className="text-primary font-semibold">
                                        R$ {broker.vendido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                    </p>
                                </td>

                                {/* Progress Bar */}
                                <td className="p-4">
                                    <div className="w-32">
                                        <Progress
                                            value={Math.min(broker.percentMeta, 100)}
                                            className="h-2 bg-zinc-700"
                                        />
                                    </div>
                                </td>

                                {/* % Meta */}
                                <td className="p-4">
                                    <p className={`font-semibold ${broker.percentMeta >= 100 ? 'text-primary' : 'text-zinc-300'}`}>
                                        {broker.percentMeta.toFixed(2)}%
                                    </p>
                                </td>

                                {/* Status */}
                                <td className="p-4">
                                    {getStatusBadge(broker.percentMeta)}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {rankings.length === 0 && (
                <div className="p-12 text-center">
                    <p className="text-muted-foreground">Nenhum corretor encontrado para este período.</p>
                </div>
            )}
        </div>
    )
}
