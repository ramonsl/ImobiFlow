"use client"

import { useState, useEffect } from "react"
import { RefreshCw, Check, AlertCircle, X } from "lucide-react"
import { Button } from "@/components/ui/button"

interface SyncStatusBannerProps {
    tenantId: number
    onComplete: () => void
}

export function SyncStatusBanner({ tenantId, onComplete }: SyncStatusBannerProps) {
    const [status, setStatus] = useState<{
        jobId?: number
        status: string
        progress?: number
        total?: number
        message?: string
        error?: string
    } | null>(null)
    const [dismissed, setDismissed] = useState(false)

    useEffect(() => {
        let interval: NodeJS.Timeout

        const checkStatus = async () => {
            try {
                const response = await fetch(`/api/properties/sync?tenantId=${tenantId}`)
                const data = await response.json()

                if (data.status === 'running' || data.status === 'pending') {
                    setStatus(data)
                    setDismissed(false)
                } else if (data.status === 'completed' && !dismissed) {
                    setStatus(data)
                    // Auto-reload after completion
                    setTimeout(() => {
                        onComplete()
                    }, 2000)
                } else if (data.status === 'failed') {
                    setStatus(data)
                } else {
                    setStatus(null)
                }
            } catch (error) {
                console.error('Error checking sync status:', error)
            }
        }

        // Check immediately
        checkStatus()

        // Poll every 2 seconds
        interval = setInterval(checkStatus, 2000)

        return () => clearInterval(interval)
    }, [tenantId, dismissed, onComplete])

    if (!status || dismissed || status.status === 'none') {
        return null
    }

    const isRunning = status.status === 'running' || status.status === 'pending'
    const isCompleted = status.status === 'completed'
    const isFailed = status.status === 'failed'

    const progressPercent = status.total && status.total > 0
        ? Math.round((status.progress || 0) / status.total * 100)
        : 0

    return (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-2xl max-w-md animate-in slide-in-from-top-4 duration-300 ${isRunning ? 'bg-blue-900/90 border border-blue-500' :
            isCompleted ? 'bg-primary/20 border border-primary backdrop-blur-md' :
                'bg-red-900/90 border border-red-500'
            }`}>
            <div className="flex items-start gap-3">
                {isRunning && (
                    <RefreshCw className="h-5 w-5 text-blue-400 animate-spin flex-shrink-0 mt-0.5" />
                )}
                {isCompleted && (
                    <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                )}
                {isFailed && (
                    <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
                )}

                <div className="flex-1">
                    <p className={`font-medium ${isRunning ? 'text-blue-200' :
                        isCompleted ? 'text-primary' :
                            'text-red-200'
                        }`}>
                        {isRunning ? 'Sincronizando JetImóveis...' :
                            isCompleted ? 'Sincronização Concluída!' :
                                'Erro na Sincronização'}
                    </p>
                    <p className={`text-sm mt-1 ${isRunning ? 'text-blue-300' :
                        isCompleted ? 'text-foreground' :
                            'text-red-300'
                        }`}>
                        {status.message || status.error}
                    </p>

                    {isRunning && status.total && status.total > 0 && (
                        <div className="mt-2">
                            <div className="flex justify-between text-xs text-blue-300 mb-1">
                                <span>{status.progress} de {status.total}</span>
                                <span>{progressPercent}%</span>
                            </div>
                            <div className="w-full bg-blue-950 rounded-full h-2">
                                <div
                                    className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                                    style={{ width: `${progressPercent}%` }}
                                />
                            </div>
                        </div>
                    )}

                    {isCompleted && (
                        <p className="text-xs text-primary mt-2">
                            Recarregando página...
                        </p>
                    )}
                </div>

                {(isCompleted || isFailed) && (
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setDismissed(true)}
                        className="h-8 w-8 text-muted-foreground hover:text-foreground"
                    >
                        <X className="h-4 w-4" />
                    </Button>
                )}
            </div>
        </div>
    )
}
