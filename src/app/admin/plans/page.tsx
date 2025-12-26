import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { Package, Check } from "lucide-react"
import { Button } from "@/components/ui/button"

export default async function PlansPage() {
    const session = await auth()

    if (!session?.user || session.user.role !== 'admin') {
        redirect("/login")
    }

    // Placeholder plans - will be from database later
    const plans = [
        {
            id: 1,
            name: "Básico",
            price: 99,
            maxBrokers: 5,
            maxDealsPerMonth: 20,
            features: [
                "Até 5 corretores",
                "20 vendas/mês",
                "Rankings básicos",
                "Suporte por email"
            ],
            isActive: true
        },
        {
            id: 2,
            name: "Pro",
            price: 299,
            maxBrokers: 20,
            maxDealsPerMonth: 100,
            features: [
                "Até 20 corretores",
                "100 vendas/mês",
                "Rankings avançados",
                "TV Mode",
                "Suporte prioritário"
            ],
            isActive: true
        },
        {
            id: 3,
            name: "Enterprise",
            price: 599,
            maxBrokers: -1,
            maxDealsPerMonth: -1,
            features: [
                "Corretores ilimitados",
                "Vendas ilimitadas",
                "Todos os recursos",
                "TV Mode",
                "Suporte 24/7",
                "Customizações"
            ],
            isActive: true
        }
    ]

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">
                        Planos de Assinatura
                    </h1>
                    <p className="text-muted-foreground">Gerencie os planos disponíveis para as imobiliárias</p>
                </div>
                <Button>
                    + Novo Plano
                </Button>
            </div>

            {/* Plans Grid */}
            <div className="grid md:grid-cols-3 gap-6">
                {plans.map((plan) => (
                    <div
                        key={plan.id}
                        className="bg-zinc-900 border border-border rounded-xl p-6 hover:border-primary/50 transition-all"
                    >
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-3 bg-primary/10 rounded-lg">
                                <Package className="h-6 w-6 text-primary" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-foreground">{plan.name}</h3>
                                {plan.isActive && (
                                    <span className="text-xs text-primary">Ativo</span>
                                )}
                            </div>
                        </div>

                        <div className="mb-6">
                            <p className="text-4xl font-bold text-foreground">
                                R$ {plan.price}
                                <span className="text-lg text-muted-foreground font-normal">/mês</span>
                            </p>
                        </div>

                        <div className="space-y-3 mb-6">
                            {plan.features.map((feature, index) => (
                                <div key={index} className="flex items-start gap-2">
                                    <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                                    <span className="text-sm text-zinc-300">{feature}</span>
                                </div>
                            ))}
                        </div>

                        <div className="pt-4 border-t border-border">
                            <Button variant="secondary" className="w-full">
                                Editar Plano
                            </Button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Info Box */}
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-blue-400 mb-2">💡 Em Desenvolvimento</h3>
                <p className="text-zinc-300">
                    O sistema de planos está em desenvolvimento. Em breve você poderá criar, editar e gerenciar planos personalizados,
                    além de vincular imobiliárias a planos específicos e gerenciar assinaturas via Stripe/Asaas.
                </p>
            </div>
        </div>
    )
}
