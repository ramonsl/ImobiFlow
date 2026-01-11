import { db } from "@/lib/db"
import { securityLogs, users } from "@/db/schema"
import { desc, eq } from "drizzle-orm"
import { auth } from "@/auth"
import { redirect } from "next/navigation"

export default async function SecurityLogsPage() {
    const session = await auth()

    // Check if user is admin
    if (!session?.user || session.user.role !== 'admin') {
        redirect('/')
    }

    // Fetch logs with user details if available
    const logs = await db
        .select({
            id: securityLogs.id,
            event: securityLogs.event,
            details: securityLogs.details,
            ip: securityLogs.ip,
            userAgent: securityLogs.userAgent,
            path: securityLogs.path,
            createdAt: securityLogs.createdAt,
            userName: users.name,
            userEmail: users.email
        })
        .from(securityLogs)
        .leftJoin(users, eq(securityLogs.userId, users.id))
        .orderBy(desc(securityLogs.createdAt))
        .limit(100)

    return (
        <div className="container mx-auto py-10 p-6">
            <h1 className="text-3xl font-bold mb-6 text-foreground">Logs de Segurança</h1>

            <div className="rounded-md border bg-card text-card-foreground shadow-sm overflow-hidden">
                <div className="overflow-x-auto w-full">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-muted/50 text-muted-foreground font-medium">
                            <tr>
                                <th className="px-4 py-3">Data</th>
                                <th className="px-4 py-3">Evento</th>
                                <th className="px-4 py-3">Detalhes</th>
                                <th className="px-4 py-3">IP</th>
                                <th className="px-4 py-3">Usuário</th>
                                <th className="px-4 py-3">Path</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {logs.map((log) => (
                                <tr key={log.id} className="hover:bg-muted/50 transition-colors">
                                    <td className="px-4 py-3 whitespace-nowrap">
                                        {log.createdAt ? new Date(log.createdAt).toLocaleString('pt-BR') : '-'}
                                    </td>
                                    <td className="px-4 py-3 font-medium">
                                        <span className={`px-2 py-1 rounded-full text-xs border ${log.event === 'LOGIN_FAILED' ? 'bg-red-500/10 text-red-600 border-red-200' :
                                                log.event === 'ACCESS_DENIED' ? 'bg-orange-500/10 text-orange-600 border-orange-200' :
                                                    log.event === 'RATE_LIMIT' ? 'bg-yellow-500/10 text-yellow-600 border-yellow-200' :
                                                        'bg-blue-500/10 text-blue-600 border-blue-200'
                                            }`}>
                                            {log.event}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 max-w-xs truncate" title={log.details || ''}>
                                        {log.details || '-'}
                                    </td>
                                    <td className="px-4 py-3 font-mono text-xs">{log.ip || '-'}</td>
                                    <td className="px-4 py-3">
                                        {log.userEmail ? (
                                            <div className="flex flex-col">
                                                <span className="font-medium">{log.userName}</span>
                                                <span className="text-muted-foreground text-xs">{log.userEmail}</span>
                                            </div>
                                        ) : '-'}
                                    </td>
                                    <td className="px-4 py-3 font-mono text-xs">{log.path || '-'}</td>
                                </tr>
                            ))}
                            {logs.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                                        Nenhum registro encontrado.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
