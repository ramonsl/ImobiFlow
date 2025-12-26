"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Save, Building2 } from "lucide-react"
import { ImageUpload } from "@/components/ui/ImageUpload"

interface CompanyFormProps {
    tenantId: number
    initialName: string
    initialCnpj: string
    initialLogoUrl: string
}

export function CompanyForm({ tenantId, initialName, initialCnpj, initialLogoUrl }: CompanyFormProps) {
    const [name, setName] = useState(initialName)
    const [cnpj, setCnpj] = useState(initialCnpj)
    const [logoUrl, setLogoUrl] = useState(initialLogoUrl)
    const [saving, setSaving] = useState(false)

    const handleSave = async () => {
        if (!name.trim()) return

        setSaving(true)
        try {
            await fetch('/api/settings/company', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ tenantId, name, cnpj, logoUrl })
            })
        } catch (error) {
            console.error('Erro ao salvar dados da empresa:', error)
        } finally {
            setSaving(false)
        }
    }

    const formatCnpj = (value: string) => {
        // Remove non-digits
        const digits = value.replace(/\D/g, '')
        // Format as XX.XXX.XXX/XXXX-XX
        if (digits.length <= 2) return digits
        if (digits.length <= 5) return `${digits.slice(0, 2)}.${digits.slice(2)}`
        if (digits.length <= 8) return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5)}`
        if (digits.length <= 12) return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8)}`
        return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8, 12)}-${digits.slice(12, 14)}`
    }

    return (
        <div className="bg-card border border-border rounded-lg p-6 mb-8">
            <div className="flex items-center gap-3 mb-6">
                <Building2 className="h-5 w-5 text-primary" />
                <div>
                    <h2 className="text-lg font-semibold text-foreground">Dados da Imobiliária</h2>
                    <p className="text-muted-foreground text-sm">Informações da empresa</p>
                </div>
            </div>

            <div className="flex gap-6">
                {/* Logo */}
                <div className="flex-shrink-0">
                    <ImageUpload
                        value={logoUrl}
                        onChange={(url) => setLogoUrl(url)}
                        className="w-24 h-24"
                        rounded={false}
                        placeholderIcon={<Building2 className="h-10 w-10 text-zinc-600" />}
                    />
                </div>

                {/* Form fields */}
                <div className="flex-1 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm text-muted-foreground mb-2">Nome da Empresa *</label>
                            <Input
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="bg-background border-input text-foreground"
                                placeholder="Nome da imobiliária"
                            />
                        </div>
                        <div>
                            <label className="block text-sm text-muted-foreground mb-2">CNPJ</label>
                            <Input
                                value={cnpj}
                                onChange={(e) => setCnpj(formatCnpj(e.target.value))}
                                className="bg-background border-input text-foreground"
                                placeholder="XX.XXX.XXX/XXXX-XX"
                                maxLength={18}
                            />
                        </div>
                    </div>

                    <Button
                        onClick={handleSave}
                        disabled={saving || !name.trim()}
                        className="bg-primary hover:bg-primary/90 text-primary-foreground"
                    >
                        <Save className="h-4 w-4 mr-2" />
                        {saving ? 'Salvando...' : 'Salvar'}
                    </Button>
                </div>
            </div>
        </div>
    )
}
