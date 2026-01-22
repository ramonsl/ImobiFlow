'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { onboardTenant } from '@/actions/onboarding'
import { toast } from 'sonner'
import { Zap, Loader2 } from 'lucide-react'

export function OnboardingForm() {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)
    const [formData, setFormData] = useState({
        name: '',
        slug: '',
        adminName: '',
        adminEmail: '',
        password: '',
        planSlug: 'starter'
    })

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)

        try {
            const result = await onboardTenant(formData)

            if (result.success && 'data' in result) {
                toast.success('Cadastro realizado com sucesso!')
                router.push('/login?registered=true')
            } else if ('error' in result) {
                toast.error(result.error || 'Erro ao realizar cadastro')
            }
        } catch (error) {
            toast.error('Erro de conexão ao servidor')
        } finally {
            setIsLoading(false)
        }
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target
        if (name === 'slug') {
            // Auto-format slug: lowercase and hyphens
            const formattedSlug = value.toLowerCase().replace(/[^a-z0-9-]/g, '-')
            setFormData(prev => ({ ...prev, [name]: formattedSlug }))
        } else {
            setFormData(prev => ({ ...prev, [name]: value }))
        }
    }

    return (
        <Card className="w-full max-w-xl border-border bg-card shadow-2xl">
            <CardHeader>
                <CardTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-blue-400 bg-clip-text text-transparent">
                    Comece agora mesmo
                </CardTitle>
                <CardDescription>
                    Crie sua conta em menos de 2 minutos e transforme sua gestão.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Nome da Imobiliária</Label>
                            <Input
                                id="name"
                                name="name"
                                placeholder="Ex: Prime Imóveis"
                                required
                                value={formData.name}
                                onChange={handleChange}
                                className="h-11"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="slug">Endereço (Slug)</Label>
                            <div className="flex items-center gap-1">
                                <Input
                                    id="slug"
                                    name="slug"
                                    placeholder="prime-imoveis"
                                    required
                                    value={formData.slug}
                                    onChange={handleChange}
                                    className="h-11"
                                />
                                <span className="text-sm text-muted-foreground">.flow</span>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="planSlug">Plano Desejado</Label>
                        <Select
                            value={formData.planSlug}
                            onValueChange={(val) => setFormData(prev => ({ ...prev, planSlug: val }))}
                        >
                            <SelectTrigger className="h-11">
                                <SelectValue placeholder="Selecione um plano" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="starter">Plano Starter (Teste Grátis)</SelectItem>
                                <SelectItem value="professional">Plano Profissional</SelectItem>
                                <SelectItem value="enterprise">Plano Enterprise</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="h-px bg-border my-2" />

                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="adminName">Nome do Administrador</Label>
                            <Input
                                id="adminName"
                                name="adminName"
                                placeholder="Seu nome completo"
                                required
                                value={formData.adminName}
                                onChange={handleChange}
                                className="h-11"
                            />
                        </div>
                        <div className="grid md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="adminEmail">E-mail Corporativo</Label>
                                <Input
                                    id="adminEmail"
                                    name="adminEmail"
                                    type="email"
                                    placeholder="exemplo@imobiliaria.com"
                                    required
                                    value={formData.adminEmail}
                                    onChange={handleChange}
                                    className="h-11"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="password">Senha de Acesso</Label>
                                <Input
                                    id="password"
                                    name="password"
                                    type="password"
                                    placeholder="Mínimo 8 caracteres"
                                    required
                                    value={formData.password}
                                    onChange={handleChange}
                                    className="h-11"
                                />
                            </div>
                        </div>
                    </div>

                    <Button
                        type="submit"
                        disabled={isLoading}
                        className="w-full h-12 text-base font-semibold shadow-lg shadow-primary/20"
                    >
                        {isLoading ? (
                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        ) : (
                            <Zap className="mr-2 h-5 w-5 fill-current" />
                        )}
                        Criar Minha Imobiliária
                    </Button>
                </form>
            </CardContent>
        </Card>
    )
}
