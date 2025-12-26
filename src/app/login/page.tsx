import { auth, signIn } from "@/auth"
import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Building2 } from "lucide-react"

export default async function LoginPage() {
    // Check if already logged in
    const session = await auth()

    if (session?.user) {
        // Admin redirect
        if (session.user.role === 'admin') {
            redirect('/admin')
        }

        // Tenant user redirect
        if (session.user.tenantSlug) {
            redirect(`/${session.user.tenantSlug}/dashboard`)
        }
    }

    async function handleLogin(formData: FormData) {
        "use server"

        const email = formData.get("email") as string
        const password = formData.get("password") as string

        try {
            // Attempt sign in
            const result = await signIn("credentials", {
                email,
                password,
                redirect: false
            })

            if (result?.error) {
                redirect('/login?error=invalid_credentials')
            }

            // Get fresh session
            const session = await auth()

            if (!session?.user) {
                redirect('/login?error=no_session')
            }

            // Admin redirect
            if (session.user.role === 'admin') {
                redirect('/admin')
            }

            // Tenant user redirect
            if (session.user.tenantSlug) {
                redirect(`/${session.user.tenantSlug}/dashboard`)
            }

            // Fallback
            redirect('/login?error=no_tenant')
        } catch (error) {
            console.error('Login error:', error)
            redirect('/login?error=server_error')
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-blue-950 flex items-center justify-center p-4">
            <Card className="w-full max-w-md border-border bg-zinc-900/50 backdrop-blur-xl text-zinc-100 shadow-2xl">
                <CardHeader className="text-center">
                    <div className="flex justify-center mb-4">
                        <div className="p-3 bg-primary/10 rounded-xl">
                            <Building2 className="h-12 w-12 text-primary" />
                        </div>
                    </div>
                    <CardTitle className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">
                        ImobiFlow
                    </CardTitle>
                    <CardDescription className="text-muted-foreground mt-2">
                        Entre com suas credenciais para acessar o sistema
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form action={handleLogin} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="email" className="text-zinc-300">
                                Email
                            </Label>
                            <Input
                                id="email"
                                name="email"
                                type="email"
                                placeholder="seu@email.com"
                                required
                                className="bg-zinc-950 border-border text-foreground placeholder:text-zinc-600 focus-visible:ring-primary h-12"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password" className="text-zinc-300">
                                Senha
                            </Label>
                            <Input
                                id="password"
                                name="password"
                                type="password"
                                required
                                className="bg-zinc-950 border-border text-foreground placeholder:text-zinc-600 focus-visible:ring-primary h-12"
                            />
                        </div>
                        <Button
                            type="submit"
                            className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-foreground border-0 font-medium h-12 text-base shadow-lg shadow-primary/20"
                        >
                            Entrar
                        </Button>
                    </form>

                    <div className="mt-6 text-center">
                        <p className="text-xs text-zinc-500">
                            © 2025 ImobiFlow SaaS - Todos os direitos reservados
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
