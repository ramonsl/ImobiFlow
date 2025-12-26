import { auth, signOut } from "@/auth"
import { redirect } from "next/navigation"

export default async function DashboardPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params
    const session = await auth()

    if (!session?.user?.tenantSlug) {
        // If user has no tenant, redirect to onboarding or error
        return <div>Você não tem acesso a nenhuma imobiliária. Contate o suporte.</div>
    }

    if (session.user.tenantSlug !== slug) {
        // User is logged in but trying to access another tenant's dashboard
        return <div>Acesso negado. Você pertence à organização: <strong>{session.user.tenantSlug}</strong></div>
    }

    return (
        <div className="p-10">
            <h1 className="text-3xl font-bold">Dashboard da {slug}</h1>
            <p className="mt-4">Bem vindo, {session.user.email}</p>
            <p>Seu cargo: {session.user.role}</p>

            <form
                action={async () => {
                    "use server"
                    await signOut()
                }}
                className="mt-10"
            >
                <button type="submit" className="bg-red-500 text-foreground px-4 py-2 rounded">
                    Sair
                </button>
            </form>
        </div>
    )
}
