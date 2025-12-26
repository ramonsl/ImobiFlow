"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
    LayoutDashboard,
    Trophy,
    DollarSign,
    Wallet,
    Settings,
    Tv,
    LogOut
} from "lucide-react"
import { handleLogout } from "@/actions/auth"
import { ThemeToggle } from "@/components/theme-toggle"
import { Button } from "@/components/ui/button"

interface SidebarProps {
    tenantSlug: string
    tenantName: string
    logoUrl?: string | null
}

const menuItems = [
    { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
    { icon: Trophy, label: "Ranking", href: "/ranking" },
    { icon: DollarSign, label: "Vendas", href: "/vendas" },
    { icon: Wallet, label: "Pagamentos", href: "/pagamentos" },
    { icon: Settings, label: "Configurações", href: "/configuracoes" },
    { icon: Tv, label: "Modo TV", href: "/tv" },
]

export function Sidebar({ tenantSlug, tenantName, logoUrl }: SidebarProps) {
    const pathname = usePathname()

    // Split tenant name to display first word in gold
    const nameParts = tenantName.split(' ')
    const firstWord = nameParts[0]
    const restOfName = nameParts.slice(1).join(' ')

    return (
        <aside className="fixed left-0 top-0 h-screen w-64 bg-background border-r border-border flex flex-col">
            {/* Logo/Brand */}
            <div className="p-6 border-b border-border min-h-[100px] flex items-center justify-center">
                {logoUrl ? (
                    <img
                        src={logoUrl}
                        alt={tenantName}
                        className="max-h-16 w-auto object-contain"
                    />
                ) : (
                    <h1 className="text-xl font-bold text-foreground leading-tight w-full">
                        <span className="text-primary uppercase">{firstWord}</span>
                        <br />
                        {restOfName && <span className="text-xs text-muted-foreground">{restOfName}</span>}
                        {restOfName && <br />}
                        <span className="text-xs text-primary">Ranking 2025</span>
                    </h1>
                )}
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4 space-y-1">
                {menuItems.map((item) => {
                    const Icon = item.icon
                    const href = `/${tenantSlug}${item.href}`
                    const isActive = pathname === href

                    return (
                        <Link
                            key={item.href}
                            href={href}
                            target={item.href === '/tv' ? '_blank' : undefined}
                            className={cn(
                                "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors",
                                isActive
                                    ? "bg-primary text-primary-foreground shadow-md"
                                    : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                            )}
                        >
                            <Icon className="h-5 w-5" />
                            {item.label}
                        </Link>
                    )
                })}
            </nav>

            {/* Theme Toggle */}
            <div className="p-4 border-t border-border">
                <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Tema</span>
                    <ThemeToggle />
                </div>
            </div>

            {/* Logout Button */}
            <div className="p-4 border-t border-border">
                <form action={handleLogout}>
                    <Button
                        type="submit"
                        variant="ghost"
                        className="w-full justify-start text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all"
                    >
                        <LogOut className="h-5 w-5 mr-3" />
                        Sair
                    </Button>
                </form>
            </div>
        </aside>
    )
}
