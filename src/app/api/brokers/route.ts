import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { brokers, brokerGoals } from "@/db/schema"
import { eq, and } from "drizzle-orm"
import { auth } from "@/auth"
import { validateTenantAccess } from "@/lib/auth-utils"
import { brokerSchema } from "@/lib/schemas"
import { logSecurityEvent } from "@/lib/logger"

// GET - List all brokers for a tenant with goals for a specific year
export async function GET(request: NextRequest) {
    try {
        const session = await auth()
        if (!session?.user) {
            return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
        }

        const tenantId = parseInt(request.nextUrl.searchParams.get("tenantId") || "0")
        const year = parseInt(request.nextUrl.searchParams.get("year") || new Date().getFullYear().toString())

        if (!tenantId) {
            return NextResponse.json({ error: "Tenant ID obrigatório" }, { status: 400 })
        }

        if (!validateTenantAccess(session, tenantId)) {
            await logSecurityEvent({
                event: 'ACCESS_DENIED',
                tenantId,
                userId: session.user.id,
                path: '/api/brokers',
                details: `User ${session.user.id} attempted to access tenant ${tenantId}`
            })
            return NextResponse.json({ error: "Acesso negado a este inquilino" }, { status: 403 })
        }

        const brokersList = await db
            .select({
                id: brokers.id,
                name: brokers.name,
                email: brokers.email,
                phone: brokers.phone,
                type: brokers.type,
                avatarUrl: brokers.avatarUrl,
                active: brokers.active,
                metaAnual: brokerGoals.metaAnual
            })
            .from(brokers)
            .leftJoin(brokerGoals, and(
                eq(brokerGoals.brokerId, brokers.id),
                eq(brokerGoals.year, year)
            ))
            .where(eq(brokers.tenantId, tenantId))
            .orderBy(brokers.name)

        return NextResponse.json(brokersList)
    } catch (error) {
        console.error("Erro ao listar colaboradores:", error)
        return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
    }
}

// POST - Create a new broker
export async function POST(request: NextRequest) {
    try {
        const session = await auth()
        if (!session?.user) {
            return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
        }

        const body = await request.json()
        const validation = brokerSchema.safeParse(body)

        if (!validation.success) {
            return NextResponse.json({ error: validation.error.issues[0].message }, { status: 400 })
        }

        const { tenantId, name, type, metaAnual, avatarUrl, year } = validation.data

        if (!validateTenantAccess(session, tenantId)) {
            await logSecurityEvent({
                event: 'ACCESS_DENIED',
                tenantId,
                userId: session.user.id,
                path: '/api/brokers',
                details: `User ${session.user.id} attempted to create broker for tenant ${tenantId}`
            })
            return NextResponse.json({ error: "Acesso negado a este inquilino" }, { status: 403 })
        }

        // Create broker
        const [newBroker] = await db
            .insert(brokers)
            .values({
                tenantId,
                name,
                type: type || 'corretor',
                avatarUrl: avatarUrl || null,
                active: true
            })
            .returning({ id: brokers.id })

        // Create goal for the year if provided
        if (year && metaAnual !== undefined) {
            await db
                .insert(brokerGoals)
                .values({
                    brokerId: newBroker.id,
                    year,
                    metaAnual: metaAnual.toString()
                })
        }

        return NextResponse.json({ id: newBroker.id, success: true })
    } catch (error) {
        console.error("Erro ao criar colaborador:", error)
        return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
    }
}
