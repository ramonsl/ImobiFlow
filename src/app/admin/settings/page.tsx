import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { CreditCard, Check, X } from "lucide-react"
import { Button } from "@/components/ui/button"

export default async function SettingsPage() {
    const session = await auth()

    if (!session?.user || session.user.role !== 'admin') {
        redirect("/login")
    }

    // Placeholder payment settings
    const paymentProviders = [
        {
            name: "Stripe",
            logo: "💳",
            isConnected: false,
            description: "Processamento de pagamentos internacional"
        },
        {
            name: "Asaas",
            logo: "🇧🇷",
            isConnected: false,
            description: "Pagamentos e cobranças no Brasil"
        }
    ]

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">
                    Configurações de Pagamento
                </h1>
                <p className="text-muted-foreground">Configure os meios de pagamento da plataforma</p>
            </div>

            {/* Payment Providers */}
            <div className="grid md:grid-cols-2 gap-6">
                {paymentProviders.map((provider) => (
                    <div
                        key={provider.name}
                        className="bg-zinc-900 border border-border rounded-xl p-6"
                    >
                        <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <div className="text-4xl">{provider.logo}</div>
                                <div>
                                    <h3 className="text-xl font-bold text-foreground">{provider.name}</h3>
                                    <p className="text-sm text-muted-foreground">{provider.description}</p>
                                </div>
                            </div>
                            {provider.isConnected ? (
                                <div className="flex items-center gap-2 px-3 py-1 bg-primary/10 border border-primary/20 rounded-full">
                                    <Check className="h-4 w-4 text-primary" />
                                    <span className="text-xs text-primary font-medium">Conectado</span>
                                </div>
                            ) : (
                                <div className="flex items-center gap-2 px-3 py-1 bg-zinc-800 border border-input rounded-full">
                                    <X className="h-4 w-4 text-zinc-500" />
                                    <span className="text-xs text-zinc-500 font-medium">Desconectado</span>
                                </div>
                            )}
                        </div>

                        <div className="space-y-3 mb-6">
                            <div>
                                <label className="block text-sm font-medium text-muted-foreground mb-2">
                                    API Key
                                </label>
                                <input
                                    type="password"
                                    placeholder="sk_test_..."
                                    className="w-full px-4 py-2 bg-zinc-950 border border-border rounded-lg text-foreground placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-primary"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-muted-foreground mb-2">
                                    Webhook Secret
                                </label>
                                <input
                                    type="password"
                                    placeholder="whsec_..."
                                    className="w-full px-4 py-2 bg-zinc-950 border border-border rounded-lg text-foreground placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-primary"
                                />
                            </div>
                        </div>

                        <Button className="w-full h-10">
                            Salvar Configurações
                        </Button>
                    </div>
                ))}
            </div>

            {/* Info Box */}
            <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-yellow-400 mb-2">⚠️ Atenção</h3>
                <p className="text-zinc-300">
                    As configurações de pagamento são sensíveis. Certifique-se de usar as chaves corretas do ambiente de produção.
                    Nunca compartilhe suas chaves de API publicamente.
                </p>
            </div>

            {/* Webhook URLs */}
            <div className="bg-zinc-900 border border-border rounded-xl p-6">
                <h2 className="text-xl font-semibold text-foreground mb-4">URLs de Webhook</h2>
                <div className="space-y-3">
                    <div>
                        <label className="block text-sm font-medium text-muted-foreground mb-2">Stripe Webhook</label>
                        <code className="block w-full px-4 py-2 bg-zinc-950 border border-border rounded-lg text-primary text-sm">
                            https://seu-dominio.com/api/webhooks/stripe
                        </code>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-muted-foreground mb-2">Asaas Webhook</label>
                        <code className="block w-full px-4 py-2 bg-zinc-950 border border-border rounded-lg text-primary text-sm">
                            https://seu-dominio.com/api/webhooks/asaas
                        </code>
                    </div>
                </div>
            </div>
        </div>
    )
}
