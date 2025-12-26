"use client"

import { useState, useRef } from "react"
import { Camera, Loader2, User } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ImageUploadProps {
    value?: string
    onChange: (url: string) => void
    className?: string
    rounded?: boolean
    placeholderIcon?: React.ReactNode
}

export function ImageUpload({
    value,
    onChange,
    className,
    rounded = true,
    placeholderIcon
}: ImageUploadProps) {
    const [uploading, setUploading] = useState(false)
    const inputRef = useRef<HTMLInputElement>(null)

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            alert('Arquivo muito grande. Máximo 5MB.')
            return
        }

        // Validate file type
        if (!file.type.startsWith('image/')) {
            alert('Por favor, selecione uma imagem.')
            return
        }

        setUploading(true)
        try {
            const formData = new FormData()
            formData.append('file', file)

            const response = await fetch('/api/upload', {
                method: 'POST',
                body: formData
            })

            const data = await response.json()
            if (data.url) {
                onChange(data.url)
            } else {
                console.error('Erro no upload:', data)
                alert(data.error || 'Erro ao fazer upload da imagem')
            }
        } catch (error) {
            console.error('Erro no upload:', error)
            alert('Erro ao fazer upload da imagem')
        } finally {
            setUploading(false)
        }
    }

    return (
        <div className={`relative ${className || ''}`}>
            <div className={`w-full h-full ${rounded ? 'rounded-full' : 'rounded-lg'} bg-zinc-700 flex items-center justify-center overflow-hidden border border-input`}>
                {value ? (
                    <img
                        src={value}
                        alt="Upload"
                        className="w-full h-full object-cover"
                    />
                ) : (
                    placeholderIcon || <User className="h-10 w-10 text-zinc-500" />
                )}
            </div>
            <Button
                type="button"
                size="icon"
                disabled={uploading}
                onClick={() => inputRef.current?.click()}
                className="absolute bottom-0 right-0 w-7 h-7 rounded-full shadow-lg"
            >
                {uploading ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                    <Camera className="h-3.5 w-3.5" />
                )}
            </Button>
            <input
                ref={inputRef}
                type="file"
                accept="image/*"
                onChange={handleUpload}
                className="hidden"
            />
        </div>
    )
}
