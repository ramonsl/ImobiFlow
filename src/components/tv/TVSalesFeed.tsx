"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Home, Calendar, Users, TrendingUp, Award } from "lucide-react"

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

interface TVSalesFeedProps {
    deals: DealData[]
}

export default function TVSalesFeed({ deals }: TVSalesFeedProps) {
    const [currentIndex, setCurrentIndex] = useState(0)

    // Rotate to next deal every 8 seconds
    useEffect(() => {
        if (deals.length === 0) return

        const interval = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % deals.length)
        }, 8000)

        return () => clearInterval(interval)
    }, [deals.length])

    if (deals.length === 0) {
        return (
            <div className="flex items-center justify-center h-full">
                <p className="text-zinc-500 text-center">Nenhuma venda recente</p>
            </div>
        )
    }

    const currentDeal = deals[currentIndex]
    const responsible = currentDeal.participants.find(p => p.isResponsible)
    const otherParticipants = currentDeal.participants.filter(p => !p.isResponsible)

    return (
        <div className="h-full flex flex-col">
            {/* Progress indicators */}
            <div className="flex gap-2 mb-6">
                {deals.map((_, index) => (
                    <div
                        key={index}
                        className={`h-1 flex-1 rounded-full transition-all ${index === currentIndex
                                ? 'bg-primary'
                                : 'bg-zinc-700'
                            }`}
                    />
                ))}
            </div>

            {/* Deal card with animation */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={currentDeal.id}
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -50 }}
                    transition={{ duration: 0.5 }}
                    className="flex-1 bg-gradient-to-br from-zinc-800/50 to-zinc-900/50 border-2 border-primary/30 rounded-2xl p-6 flex flex-col"
                >
                    {/* Property info */}
                    <div className="mb-6">
                        <div className="flex items-start gap-3 mb-3">
                            <div className="p-3 bg-primary/20 rounded-lg">
                                <Home className="h-6 w-6 text-primary" />
                            </div>
                            <div className="flex-1">
                                <h3 className="text-2xl font-bold text-foreground mb-1">
                                    {currentDeal.propertyName}
                                </h3>
                                {currentDeal.propertyAddress && (
                                    <p className="text-muted-foreground text-sm">
                                        {currentDeal.propertyAddress}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Sale value */}
                        <div className="bg-primary/10 border border-primary/30 rounded-xl p-4 mb-4">
                            <div className="flex items-center gap-2 mb-1">
                                <TrendingUp className="h-5 w-5 text-primary" />
                                <span className="text-sm text-muted-foreground">Valor da Venda</span>
                            </div>
                            <p className="text-3xl font-bold text-primary">
                                {new Intl.NumberFormat('pt-BR', {
                                    style: 'currency',
                                    currency: 'BRL',
                                    minimumFractionDigits: 0,
                                    maximumFractionDigits: 0
                                }).format(currentDeal.vgv)}
                            </p>
                        </div>

                        {/* Sale date */}
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <Calendar className="h-4 w-4" />
                            <span className="text-sm">
                                {new Date(currentDeal.saleDate).toLocaleDateString('pt-BR', {
                                    day: '2-digit',
                                    month: 'long',
                                    year: 'numeric'
                                })}
                            </span>
                        </div>
                    </div>

                    {/* Participants */}
                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-4">
                            <Users className="h-5 w-5 text-purple-400" />
                            <h4 className="text-lg font-semibold text-foreground">Equipe</h4>
                        </div>

                        {/* Responsible */}
                        {responsible && (
                            <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-4 mb-3">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-purple-500/20 rounded-full">
                                        <Award className="h-5 w-5 text-purple-400" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-purple-400 uppercase font-semibold">
                                            Responsável
                                        </p>
                                        <p className="text-lg font-bold text-foreground">
                                            {responsible.name}
                                        </p>
                                        {responsible.role && (
                                            <p className="text-xs text-muted-foreground">
                                                {responsible.role}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Other participants */}
                        {otherParticipants.length > 0 && (
                            <div className="space-y-2">
                                {otherParticipants.map((participant, idx) => (
                                    <div
                                        key={idx}
                                        className="bg-zinc-800/50 border border-input rounded-lg p-3"
                                    >
                                        <p className="text-foreground font-semibold">
                                            {participant.name}
                                        </p>
                                        {participant.role && (
                                            <p className="text-xs text-muted-foreground">
                                                {participant.role}
                                            </p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </motion.div>
            </AnimatePresence>
        </div>
    )
}
