import { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface MetricCardProps {
    title: string
    value: string
    icon: LucideIcon
    trend?: string
    iconBgColor?: string
}

export function MetricCard({ title, value, icon: Icon, trend, iconBgColor = "bg-primary/10" }: MetricCardProps) {
    return (
        <div className="bg-card border border-border rounded-lg p-4 hover:border-input transition-colors">
            <div className="flex items-start justify-between mb-3">
                <div className={cn("p-2 rounded-lg", iconBgColor)}>
                    <Icon className="h-4 w-4 text-primary" />
                </div>
                {trend && (
                    <span className="text-xs text-primary">{trend}</span>
                )}
            </div>
            <h3 className="text-xs text-muted-foreground mb-2 leading-tight">{title}</h3>
            <p className="text-lg font-bold text-foreground">{value}</p>
        </div>
    )
}
