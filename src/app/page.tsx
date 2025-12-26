import { signIn, auth } from "@/auth"
import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Building2, TrendingUp, Users, Trophy, BarChart3, Zap, Star, Quote, Tv } from "lucide-react"

export default async function LandingPage() {
  // Check if user is already logged in
  const session = await auth()

  if (session?.user) {
    // Admin users go to admin dashboard
    if (session.user.role === 'admin') {
      redirect('/admin')
    }

    // Tenant users go to their dashboard
    if (session.user.tenantSlug) {
      redirect(`/${session.user.tenantSlug}/dashboard`)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <nav className="flex items-center justify-between mb-20">
          <div className="flex items-center gap-2">
            <Building2 className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold bg-gradient-to-r from-blue-500 to-cyan-400 bg-clip-text text-transparent">
              ImobiFlow
            </span>
          </div>
        </nav>

        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Side - Hero Content */}
          <div className="space-y-8">
            <div className="inline-block">
              <span className="px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium">
                🚀 Plataforma SaaS para Imobiliárias
              </span>
            </div>

            <h1 className="text-5xl lg:text-7xl font-bold text-foreground leading-tight tracking-tight">
              Gerencie sua <br />
              <span className="bg-gradient-to-r from-blue-500 via-blue-400 to-cyan-400 bg-clip-text text-transparent drop-shadow-[0_0_15px_rgba(59,130,246,0.5)]">
                imobiliária
              </span>{" "}
              <br />
              com inteligência
            </h1>

            <p className="text-xl text-muted-foreground leading-relaxed">
              Controle vendas, comissões e motive sua equipe com rankings em tempo real.
              Tudo em uma plataforma moderna e intuitiva.
            </p>

            {/* Features Grid */}
            <div className="grid grid-cols-2 gap-6 pt-4">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20">
                  <TrendingUp className="h-6 w-6 text-blue-400" />
                </div>
                <div>
                  <h3 className="font-bold text-foreground">Gestão Financeira</h3>
                  <p className="text-sm text-zinc-400">Automatização completa do VGV, divisões de comissões, reembolsos e controle rigoroso de pagamentos mensais.</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
                  <Trophy className="h-6 w-6 text-amber-500" />
                </div>
                <div>
                  <h3 className="font-bold text-foreground">Rankings & Metas</h3>
                  <p className="text-sm text-zinc-400">Gamificação que impulsiona a produtividade dos corretores.</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-3 rounded-xl bg-green-500/10 border border-green-500/20">
                  <Zap className="h-6 w-6 text-green-400" />
                </div>
                <div>
                  <h3 className="font-bold text-foreground">WhatsApp CRM</h3>
                  <p className="text-sm text-zinc-400">Sincronização de contatos e alertas automáticos via WhatsApp.</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20">
                  <Tv className="h-6 w-6 text-purple-400" />
                </div>
                <div>
                  <h3 className="font-bold text-foreground">Modo TV</h3>
                  <p className="text-sm text-zinc-400">Exibição em tempo real para salas de vendas de alta performance.</p>
                </div>
              </div>
            </div>

            <div className="pt-8">
              <div className="p-4 rounded-xl bg-card border border-border flex items-center gap-4">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Zap className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h4 className="font-bold text-primary mb-1">JetImóveis Sync</h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Importação automática de imóveis e clientes via API para eliminar o retrabalho.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Login Card */}
          <div className="flex justify-center lg:justify-end">
            <Card className="w-full max-w-md border-border bg-card shadow-2xl">
              <CardHeader>
                <CardTitle className="text-2xl font-bold bg-gradient-to-r from-blue-500 to-cyan-400 bg-clip-text text-transparent">
                  Acesse sua conta
                </CardTitle>
                <CardDescription className="text-muted-foreground">
                  Entre com seu e-mail e senha para acessar o sistema.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form
                  action={async (formData) => {
                    "use server"
                    const email = formData.get("email") as string
                    const password = formData.get("password") as string

                    // Authenticate first
                    const result = await signIn("credentials", {
                      email,
                      password,
                      redirect: false
                    })

                    if (result?.error) {
                      throw new Error("Invalid credentials")
                    }

                    // Get session to determine redirect
                    const session = await auth()

                    // Redirect based on user type
                    if (!session?.user?.tenantSlug) {
                      // Super Admin - redirect to SaaS admin panel
                      await signIn("credentials", {
                        email,
                        password,
                        redirectTo: "/admin"
                      })
                    } else {
                      // Tenant user - redirect to their dashboard
                      await signIn("credentials", {
                        email,
                        password,
                        redirectTo: `/${session.user.tenantSlug}/dashboard`
                      })
                    }
                  }}
                  className="grid gap-4"
                >
                  <div className="grid gap-2">
                    <Label htmlFor="email" className="text-foreground">
                      Email Corporativo
                    </Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="seu.nome@imobiliaria.com"
                      required
                      className="bg-background border-border text-foreground placeholder:text-muted-foreground focus-visible:ring-primary h-12"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="password" className="text-foreground">
                      Senha
                    </Label>
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      required
                      className="bg-background border-border text-foreground placeholder:text-muted-foreground focus-visible:ring-primary h-12"
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium h-12 text-base shadow-lg shadow-primary/20"
                  >
                    <Zap className="mr-2 h-5 w-5" />
                    Entrar no Sistema
                  </Button>
                </form>

                <div className="mt-6 text-center">
                  <p className="text-xs text-zinc-500">
                    Ao continuar, você concorda com nossos{" "}
                    <a href="#" className="text-primary hover:underline">
                      Termos de Serviço
                    </a>
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Core Benefits */}
        <div className="mt-32 grid md:grid-cols-3 gap-12 text-center">
          <div className="space-y-4">
            <div className="mx-auto w-16 h-16 bg-blue-500/10 rounded-2xl flex items-center justify-center border border-blue-500/20">
              <BarChart3 className="h-8 w-8 text-blue-400" />
            </div>
            <h3 className="text-xl font-bold text-foreground">Decisões Baseadas em Dados</h3>
            <p className="text-muted-foreground leading-relaxed">
              Acompanhe o desempenho da sua imobiliária com dashboards detalhados e métricas precisas de conversão.
            </p>
          </div>
          <div className="space-y-4">
            <div className="mx-auto w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center border border-primary/20">
              <Users className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-xl font-bold text-foreground">Foco no Corretor</h3>
            <p className="text-muted-foreground leading-relaxed">
              Ferramentas desenhadas para facilitar o dia a dia de quem vende, desde a captura do lead até o fechamento.
            </p>
          </div>
          <div className="space-y-4">
            <div className="mx-auto w-16 h-16 bg-cyan-500/10 rounded-2xl flex items-center justify-center border border-cyan-500/20">
              <Zap className="h-8 w-8 text-cyan-400" />
            </div>
            <h3 className="text-xl font-bold text-foreground">Automação de Processos</h3>
            <p className="text-muted-foreground leading-relaxed">
              Reduza erros manuais com sincronização automática de dados e notificações em tempo real via WhatsApp.
            </p>
          </div>
        </div>

        {/* Testimonials Section */}
        <div className="mt-32">
          <h2 className="text-3xl font-bold text-foreground text-center mb-16 uppercase tracking-widest">
            Expertise que <span className="text-primary italic">gera resultados</span>
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                name: "Ricardo Silva",
                role: "Diretor Comercial, ImobiNet",
                content: "O ImobiFlow transformou a forma como acompanhamos nossas metas. O TV Mode na sala de vendas criou uma competição saudável incrível.",
                avatar: "RS"
              },
              {
                name: "Ana Oliveira",
                role: "Dona de Imobiliária, Prime Imóveis",
                content: "Finalmente uma plataforma que entende a nossa dor com comissões. O dashboard é limpo e a integração com WhatsApp agilizou tudo.",
                avatar: "AO"
              },
              {
                name: "Marcos Santos",
                role: "Gerente de Equipe, Elite Houses",
                content: "A gamificação através dos rankings motivou meus corretores de uma forma que eu nunca tinha visto antes. Resultados subiram 30%.",
                avatar: "MS"
              }
            ].map((testimonial, i) => (
              <Card key={i} className="border-border bg-card/50 backdrop-blur-sm border-t-2 border-t-primary/50 shadow-xl hover:translate-y-[-4px] transition-all duration-300">
                <CardContent className="pt-8">
                  <Quote className="h-8 w-8 text-primary/20 mb-4" />
                  <p className="text-foreground italic mb-6">"{testimonial.content}"</p>
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold border border-primary/20">
                      {testimonial.avatar}
                    </div>
                    <div>
                      <h4 className="font-bold text-foreground text-sm">{testimonial.name}</h4>
                      <p className="text-xs text-muted-foreground">{testimonial.role}</p>
                    </div>
                  </div>
                  <div className="flex gap-1 mt-4">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star key={s} className="h-3 w-3 fill-primary text-primary" />
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Stats Section */}
        <div className="mt-24 grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="text-center">
            <div className="text-4xl font-bold text-foreground mb-2">100+</div>
            <div className="text-zinc-500">Imobiliárias</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-foreground mb-2">5k+</div>
            <div className="text-zinc-500">Corretores</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-foreground mb-2">R$ 2B+</div>
            <div className="text-zinc-500">Em Vendas</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-foreground mb-2">99.9%</div>
            <div className="text-zinc-500">Uptime</div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-border mt-24">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-primary" />
              <span className="text-muted-foreground">© 2025 ImobiFlow SaaS</span>
            </div>
            <div className="flex gap-6 text-sm text-zinc-500">
              <a href="#" className="hover:text-primary transition-colors">Privacidade</a>
              <a href="#" className="hover:text-primary transition-colors">Termos</a>
              <a href="#" className="hover:text-primary transition-colors">Suporte</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
