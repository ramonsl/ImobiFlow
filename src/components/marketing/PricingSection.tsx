import { Check, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface Plan {
    id: number
    name: string
    slug: string
    amount: number
    features: string[] | null
    isActive: boolean
}

export function PricingSection({ plans }: { plans: Plan[] }) {
    return (
        <div className="py-24" id="pricing">
            <div className="text-center mb-16 space-y-4">
                <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-cyan-400 bg-clip-text text-transparent uppercase tracking-wider">
                    Planos e Preços
                </h2>
                <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                    Escolha o plano ideal para a escala da sua imobiliária e comece a transformar seus resultados hoje.
                </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
                {plans.map((plan) => (
                    <Card
                        key={plan.id}
                        className={cn(
                            "relative border-border bg-card/50 backdrop-blur-sm transition-all duration-300 hover:shadow-2xl hover:translate-y-[-8px]",
                            plan.slug === 'professional' && "border-primary shadow-primary/20 bg-primary/5"
                        )}
                    >
                        {plan.slug === 'professional' && (
                            <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest shadow-lg">
                                Mais Popular
                            </div>
                        )}

                        <CardHeader>
                            <CardTitle className="text-2xl font-bold">{plan.name}</CardTitle>
                            <CardDescription>
                                {plan.slug === 'starter' && 'Para quem está começando.'}
                                {plan.slug === 'professional' && 'Ideal para imobiliárias em crescimento.'}
                                {plan.slug === 'enterprise' && 'Escala máxima e suporte exclusivo.'}
                            </CardDescription>
                        </CardHeader>

                        <CardContent className="space-y-6">
                            <div className="flex items-baseline gap-1">
                                <span className="text-4xl font-bold">R$ {(plan.amount / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                                <span className="text-muted-foreground">/mês</span>
                            </div>

                            <ul className="space-y-3">
                                {plan.features?.map((feature, i) => (
                                    <li key={i} className="flex items-center gap-3 text-sm text-zinc-300">
                                        <div className="flex-shrink-0 w-5 h-5 rounded-full bg-green-500/10 flex items-center justify-center border border-green-500/20">
                                            <Check className="h-3 w-3 text-green-400" />
                                        </div>
                                        {feature}
                                    </li>
                                ))}
                            </ul>
                        </CardContent>

                        <CardFooter>
                            <Button
                                className={cn(
                                    "w-full h-11 transition-all",
                                    plan.slug === 'professional' ? "bg-primary hover:bg-primary/90" : "bg-card border-border hover:bg-zinc-800"
                                )}
                                variant={plan.slug === 'professional' ? "default" : "outline"}
                                onClick={() => {
                                    // Smooth scroll to top register tab logic could go here
                                    window.scrollTo({ top: 0, behavior: 'smooth' });
                                }}
                            >
                                {plan.slug === 'starter' ? 'Começar Teste Grátis' : 'Assinar Agora'}
                            </Button>
                        </CardFooter>
                    </Card>
                ))}
            </div>
        </div>
    )
}
