import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { AdminSidebar } from "@/components/admin/AdminSidebar"

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const session = await auth()

    // Protect admin routes
    if (!session?.user || session.user.role !== 'admin') {
        redirect('/login')
    }

    return (
        <div className="min-h-screen bg-zinc-950">
            <AdminSidebar />
            <main className="ml-64 p-8">
                {children}
            </main>
        </div>
    )
}
