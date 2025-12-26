"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Filter, X } from "lucide-react"
import { useState } from "react"

interface SalesFiltersProps {
    brokers: Array<{ id: number; name: string }>
}

export function SalesFilters({ brokers }: SalesFiltersProps) {
    const router = useRouter()
    const searchParams = useSearchParams()

    const [status, setStatus] = useState(searchParams.get("status") || "")
    const [brokerId, setBrokerId] = useState(searchParams.get("brokerId") || "")
    const [search, setSearch] = useState(searchParams.get("search") || "")
    const [dateFrom, setDateFrom] = useState(searchParams.get("dateFrom") || "")
    const [dateTo, setDateTo] = useState(searchParams.get("dateTo") || "")

    const applyFilters = () => {
        const params = new URLSearchParams()

        if (status) params.set("status", status)
        if (brokerId) params.set("brokerId", brokerId)
        if (search) params.set("search", search)
        if (dateFrom) params.set("dateFrom", dateFrom)
        if (dateTo) params.set("dateTo", dateTo)

        router.push(`?${params.toString()}`)
    }

    const clearFilters = () => {
        setStatus("")
        setBrokerId("")
        setSearch("")
        setDateFrom("")
        setDateTo("")
        router.push(window.location.pathname)
    }

    return (
        <div className="bg-card border border-border rounded-xl p-6 mb-6">
            <div className="flex items-center gap-2 mb-4">
                <Filter className="h-5 w-5 text-primary" />
                <h3 className="text-lg font-semibold text-foreground">Filtros</h3>
            </div>

            <div className="grid md:grid-cols-5 gap-4">
                {/* Date From */}
                <div>
                    <Label htmlFor="dateFrom" className="text-muted-foreground text-sm mb-2 block">
                        Data Início
                    </Label>
                    <Input
                        id="dateFrom"
                        type="date"
                        value={dateFrom}
                        onChange={(e) => setDateFrom(e.target.value)}
                        className="bg-background border-border text-foreground h-10"
                    />
                </div>

                {/* Date To */}
                <div>
                    <Label htmlFor="dateTo" className="text-muted-foreground text-sm mb-2 block">
                        Data Fim
                    </Label>
                    <Input
                        id="dateTo"
                        type="date"
                        value={dateTo}
                        onChange={(e) => setDateTo(e.target.value)}
                        className="bg-background border-border text-foreground h-10"
                    />
                </div>

                {/* Status */}
                <div>
                    <Label htmlFor="status" className="text-muted-foreground text-sm mb-2 block">
                        Status
                    </Label>
                    <Select value={status} onValueChange={setStatus}>
                        <SelectTrigger className="bg-background border-border text-foreground h-10">
                            <SelectValue placeholder="Todos" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="completed">Concluída</SelectItem>
                            <SelectItem value="pending">Pendente</SelectItem>
                            <SelectItem value="cancelled">Cancelada</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* Broker */}
                <div>
                    <Label htmlFor="broker" className="text-muted-foreground text-sm mb-2 block">
                        Corretor
                    </Label>
                    <Select value={brokerId} onValueChange={setBrokerId}>
                        <SelectTrigger className="bg-background border-border text-foreground h-10">
                            <SelectValue placeholder="Todos" />
                        </SelectTrigger>
                        <SelectContent>
                            {brokers.map((broker) => (
                                <SelectItem key={broker.id} value={broker.id.toString()}>
                                    {broker.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {/* Search */}
                <div>
                    <Label htmlFor="search" className="text-muted-foreground text-sm mb-2 block">
                        Buscar Imóvel
                    </Label>
                    <Input
                        id="search"
                        type="text"
                        placeholder="Nome ou código..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="bg-background border-border text-foreground placeholder:text-zinc-600 h-10"
                    />
                </div>
            </div>

            <div className="flex gap-3 mt-4">
                <Button
                    onClick={applyFilters}
                    className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20"
                >
                    Aplicar Filtros
                </Button>
                <Button
                    onClick={clearFilters}
                    variant="outline"
                    className="border-border text-muted-foreground hover:text-foreground hover:bg-accent"
                >
                    <X className="h-4 w-4 mr-2" />
                    Limpar
                </Button>
            </div>
        </div>
    )
}
