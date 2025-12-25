
import { signIn } from "@/auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Label } from "@/components/ui/label"

export default function LoginPage() {
    return (
        <div className="flex h-screen w-full items-center justify-center bg-zinc-950 text-white">
            <Card className="w-full max-w-sm border-zinc-800 bg-zinc-900 text-zinc-100">
                <CardHeader>
                    <CardTitle className="text-2xl font-bold bg-gradient-to-r from-teal-400 to-emerald-500 bg-clip-text text-transparent">ImobiGestor</CardTitle>
                    <CardDescription className="text-zinc-400">
                        Entre com seu e-mail para receber um link de acesso.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form
                        action={async (formData) => {
                            "use server"
                            await signIn("resend", formData)
                        }}
                        className="grid gap-4"
                    >
                        <div className="grid gap-2">
                            <Label htmlFor="email" className="text-zinc-300">Email Corporativo</Label>
                            <Input
                                id="email"
                                name="email"
                                type="email"
                                placeholder="seu.nome@imobiliaria.com"
                                required
                                className="bg-zinc-950 border-zinc-800 text-white placeholder:text-zinc-600 focus-visible:ring-emerald-500"
                            />
                        </div>
                        <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white border-0 font-medium">
                            Receber Magic Link
                        </Button>
                    </form>
                </CardContent>
                <CardFooter className="flex justify-center text-xs text-zinc-500">
                    ImobiGestor SaaS © 2025
                </CardFooter>
            </Card>
        </div>
    )
}
