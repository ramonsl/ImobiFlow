"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { ChevronDown } from "lucide-react"

interface YearSelectorProps {
    currentYear: number
    slug: string
}

export function YearSelector({ currentYear, slug }: YearSelectorProps) {
    const router = useRouter()
    const searchParams = useSearchParams()

    const selectedYear = parseInt(searchParams.get("year") || currentYear.toString())
    const currentYearActual = new Date().getFullYear()
    const years = [currentYearActual - 1, currentYearActual, currentYearActual + 1]

    const handleYearChange = (year: number) => {
        router.push(`/${slug}/dashboard?year=${year}`)
    }

    return (
        <div className="relative">
            <select
                value={selectedYear}
                onChange={(e) => handleYearChange(parseInt(e.target.value))}
                className="appearance-none bg-card border border-input text-foreground px-4 py-2 pr-10 rounded-lg focus:border-primary focus:outline-none font-medium"
            >
                {years.map(y => (
                    <option key={y} value={y}>{y}</option>
                ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
        </div>
    )
}
