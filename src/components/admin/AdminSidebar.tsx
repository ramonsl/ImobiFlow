"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
    LayoutDashboard,
    Building2,
    CreditCard,
    Settings,
    LogOut,
    Package
} from "lucide-react"
import { signOut } from "next-auth/react"
import { Button } from "@/components/ui/button"

const menuItems = [
    { icon: LayoutDashboard, label: "Dashboard", href: "/admin" },
    { icon: Package, label: "Planos", href: "/admin/plans" },
    { icon: Building2, label: "Imobiliárias", href: "/admin/tenants" },
    { icon: Settings, label: "Pagamentos", href: "/admin/settings" },
]

export function AdminSidebar() {
    const pathname = usePathname()

    const handleLogout = async () => {
        await signOut({ callbackUrl: "/" })
    }

    return (
        <aside className="fixed left-0 top-0 h-screen w-64 bg-background border-r border-border flex flex-col">
            {/* Logo/Brand */}
            <div className="p-6 border-b border-border">
                <h1 className="text-xl font-bold text-foreground leading-tight">
                    <span className="text-primary uppercase">ImobiFlow</span>
                    <br />
                    <span className="text-xs text-muted-foreground">Admin SaaS</span>
                </h1>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4 space-y-1">
                {menuItems.map((item) => {
                    const Icon = item.icon
                    const isActive = pathname === item.href

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
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

            {/* Logout Button */}
            <div className="p-4 border-t border-border">
                <Button
                    onClick={handleLogout}
                    variant="ghost"
                    className="w-full justify-start text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all"
                >
                    <LogOut className="h-5 w-5 mr-3" />
                    Sair
                </Button>
            </div>
        </aside>
    )
}
