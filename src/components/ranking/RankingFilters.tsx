"use client"

import { useState } from "react"
import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

interface RankingFiltersProps {
    period: "anual" | "semestral" | "trimestral" | "mensal"
    onYearChange: (year: string) => void
    onPeriodChange?: (period: string) => void
    onSearchChange: (search: string) => void
    onSortChange: (sort: string) => void
    selectedYear: string
    selectedPeriod?: string
}

export function RankingFilters({
    period,
    onYearChange,
    onPeriodChange,
    onSearchChange,
    onSortChange,
    selectedYear,
    selectedPeriod
}: RankingFiltersProps) {
    const [search, setSearch] = useState("")

    const handleSearchChange = (value: string) => {
        setSearch(value)
        onSearchChange(value)
    }

    return (
        <div className="bg-card border border-border rounded-lg p-6 mb-6">
            <h3 className="text-foreground font-semibold mb-4">Filtros</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {/* Year Filter - Always visible */}
                <Select value={selectedYear} onValueChange={onYearChange}>
                    <SelectTrigger className="bg-background border-input text-foreground">
                        <SelectValue placeholder="Ano" />
                    </SelectTrigger>
                    <SelectContent className="bg-card border-input">
                        <SelectItem value="2025" className="text-foreground">2025</SelectItem>
                        <SelectItem value="2024" className="text-foreground">2024</SelectItem>
                        <SelectItem value="2023" className="text-foreground">2023</SelectItem>
                    </SelectContent>
                </Select>

                {/* Semester Filter - Only for semestral */}
                {period === "semestral" && onPeriodChange && (
                    <Select value={selectedPeriod} onValueChange={onPeriodChange}>
                        <SelectTrigger className="bg-background border-input text-foreground">
                            <SelectValue placeholder="Semestre" />
                        </SelectTrigger>
                        <SelectContent className="bg-card border-input">
                            <SelectItem value="1" className="text-foreground">1º Semestre</SelectItem>
                            <SelectItem value="2" className="text-foreground">2º Semestre</SelectItem>
                        </SelectContent>
                    </Select>
                )}

                {/* Quarter Filter - Only for trimestral */}
                {period === "trimestral" && onPeriodChange && (
                    <Select value={selectedPeriod} onValueChange={onPeriodChange}>
                        <SelectTrigger className="bg-background border-input text-foreground">
                            <SelectValue placeholder="Trimestre" />
                        </SelectTrigger>
                        <SelectContent className="bg-card border-input">
                            <SelectItem value="1" className="text-foreground">Q1 (Jan-Mar)</SelectItem>
                            <SelectItem value="2" className="text-foreground">Q2 (Abr-Jun)</SelectItem>
                            <SelectItem value="3" className="text-foreground">Q3 (Jul-Set)</SelectItem>
                            <SelectItem value="4" className="text-foreground">Q4 (Out-Dez)</SelectItem>
                        </SelectContent>
                    </Select>
                )}

                {/* Month Filter - Only for mensal */}
                {period === "mensal" && onPeriodChange && (
                    <Select value={selectedPeriod} onValueChange={onPeriodChange}>
                        <SelectTrigger className="bg-background border-input text-foreground">
                            <SelectValue placeholder="Mês" />
                        </SelectTrigger>
                        <SelectContent className="bg-card border-input">
                            <SelectItem value="1" className="text-foreground">Janeiro</SelectItem>
                            <SelectItem value="2" className="text-foreground">Fevereiro</SelectItem>
                            <SelectItem value="3" className="text-foreground">Março</SelectItem>
                            <SelectItem value="4" className="text-foreground">Abril</SelectItem>
                            <SelectItem value="5" className="text-foreground">Maio</SelectItem>
                            <SelectItem value="6" className="text-foreground">Junho</SelectItem>
                            <SelectItem value="7" className="text-foreground">Julho</SelectItem>
                            <SelectItem value="8" className="text-foreground">Agosto</SelectItem>
                            <SelectItem value="9" className="text-foreground">Setembro</SelectItem>
                            <SelectItem value="10" className="text-foreground">Outubro</SelectItem>
                            <SelectItem value="11" className="text-foreground">Novembro</SelectItem>
                            <SelectItem value="12" className="text-foreground">Dezembro</SelectItem>
                        </SelectContent>
                    </Select>
                )}

                {/* Search */}
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                    <Input
                        placeholder="Buscar corretor..."
                        value={search}
                        onChange={(e) => handleSearchChange(e.target.value)}
                        className="pl-10 bg-background border-input text-foreground placeholder:text-zinc-500"
                    />
                </div>

                {/* Sort */}
                <Select defaultValue="value" onValueChange={onSortChange}>
                    <SelectTrigger className="bg-background border-input text-foreground">
                        <SelectValue placeholder="Ordenar por" />
                    </SelectTrigger>
                    <SelectContent className="bg-card border-input">
                        <SelectItem value="value" className="text-foreground">Maior Valor Vendido</SelectItem>
                        <SelectItem value="percent" className="text-foreground">Maior % Meta</SelectItem>
                        <SelectItem value="name" className="text-foreground">Nome A-Z</SelectItem>
                    </SelectContent>
                </Select>
            </div>
        </div>
    )
}
