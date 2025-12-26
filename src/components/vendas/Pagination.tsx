"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react"

interface PaginationProps {
    currentPage: number
    totalPages: number
    totalItems: number
    itemsPerPage: number
}

export function Pagination({ currentPage, totalPages, totalItems, itemsPerPage }: PaginationProps) {
    const router = useRouter()
    const searchParams = useSearchParams()

    const updatePage = (page: number) => {
        const params = new URLSearchParams(searchParams.toString())
        params.set("page", page.toString())
        router.push(`?${params.toString()}`)
    }

    const updateLimit = (limit: string) => {
        const params = new URLSearchParams(searchParams.toString())
        params.set("limit", limit)
        params.set("page", "1") // Reset to first page
        router.push(`?${params.toString()}`)
    }

    const startItem = (currentPage - 1) * itemsPerPage + 1
    const endItem = Math.min(currentPage * itemsPerPage, totalItems)

    // Generate page numbers to show
    const getPageNumbers = () => {
        const pages: (number | string)[] = []
        const maxVisible = 5

        if (totalPages <= maxVisible) {
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i)
            }
        } else {
            if (currentPage <= 3) {
                for (let i = 1; i <= 4; i++) pages.push(i)
                pages.push("...")
                pages.push(totalPages)
            } else if (currentPage >= totalPages - 2) {
                pages.push(1)
                pages.push("...")
                for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i)
            } else {
                pages.push(1)
                pages.push("...")
                for (let i = currentPage - 1; i <= currentPage + 1; i++) pages.push(i)
                pages.push("...")
                pages.push(totalPages)
            }
        }

        return pages
    }

    if (totalPages <= 1) return null

    return (
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mt-6 pt-6 border-t border-border">
            {/* Info */}
            <div className="text-sm text-muted-foreground">
                Mostrando <span className="text-foreground font-medium">{startItem}</span> a{" "}
                <span className="text-foreground font-medium">{endItem}</span> de{" "}
                <span className="text-foreground font-medium">{totalItems}</span> resultados
            </div>

            {/* Page Navigation */}
            <div className="flex items-center gap-2">
                {/* First Page */}
                <Button
                    variant="outline"
                    size="icon"
                    onClick={() => updatePage(1)}
                    disabled={currentPage === 1}
                    className="h-9 w-9 border-input bg-transparent text-muted-foreground hover:text-foreground hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <ChevronsLeft className="h-4 w-4" />
                </Button>

                {/* Previous Page */}
                <Button
                    variant="outline"
                    size="icon"
                    onClick={() => updatePage(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="h-9 w-9 border-input bg-transparent text-muted-foreground hover:text-foreground hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <ChevronLeft className="h-4 w-4" />
                </Button>

                {/* Page Numbers */}
                {getPageNumbers().map((page, index) => (
                    page === "..." ? (
                        <span key={`ellipsis-${index}`} className="px-2 text-zinc-500">
                            ...
                        </span>
                    ) : (
                        <Button
                            key={page}
                            variant={currentPage === page ? "default" : "outline"}
                            size="icon"
                            onClick={() => updatePage(page as number)}
                            className={
                                currentPage === page
                                    ? "h-9 w-9 bg-primary hover:bg-primary/90 text-primary-foreground border-0 shadow-md shadow-primary/20"
                                    : "h-9 w-9 border-border bg-transparent text-muted-foreground hover:text-foreground hover:bg-accent"
                            }
                        >
                            {page}
                        </Button>
                    )
                ))}

                {/* Next Page */}
                <Button
                    variant="outline"
                    size="icon"
                    onClick={() => updatePage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="h-9 w-9 border-input bg-transparent text-muted-foreground hover:text-foreground hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <ChevronRight className="h-4 w-4" />
                </Button>

                {/* Last Page */}
                <Button
                    variant="outline"
                    size="icon"
                    onClick={() => updatePage(totalPages)}
                    disabled={currentPage === totalPages}
                    className="h-9 w-9 border-input bg-transparent text-muted-foreground hover:text-foreground hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <ChevronsRight className="h-4 w-4" />
                </Button>
            </div>

            {/* Items per page */}
            <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Itens por página:</span>
                <Select value={itemsPerPage.toString()} onValueChange={updateLimit}>
                    <SelectTrigger className="w-20 h-9 bg-background border-border text-foreground">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="10">10</SelectItem>
                        <SelectItem value="25">25</SelectItem>
                        <SelectItem value="50">50</SelectItem>
                        <SelectItem value="100">100</SelectItem>
                    </SelectContent>
                </Select>
            </div>
        </div>
    )
}
