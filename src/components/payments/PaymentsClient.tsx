"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import {
    DollarSign, Receipt, ChevronDown, Check, X,
    FileText, Upload, Plus, Calendar, Loader2, Eye
} from "lucide-react"
import { PaymentModal } from "./PaymentModal"
import { ConfirmPaymentModal } from "./ConfirmPaymentModal"
import { FeedbackModal } from "@/components/ui/FeedbackModal"

interface Payment {
    id: number
    brokerId: number
    brokerName: string
    brokerAvatarUrl: string | null
    dealId: number | null
    dealParticipantId: number | null
    type: string
    description: string | null
    amount: string
    referenceMonth: number
    referenceYear: number
    status: string
    paidAt: string | null
    receiptUrl: string | null
    notes: string | null
    createdAt: string
}

interface PendingCommission {
    dealId: number
    dealParticipantId: number
    brokerId: number
    brokerName: string
    brokerAvatarUrl: string | null
    propertyTitle: string
    saleDate: string
    commissionValue: string
}

interface PaymentsClientProps {
    tenantId: number
    slug: string
}

const months = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
]

export function PaymentsClient({ tenantId, slug }: PaymentsClientProps) {
    const [loading, setLoading] = useState(true)
    const [payments, setPayments] = useState<Payment[]>([])
    const [pendingCommissions, setPendingCommissions] = useState<PendingCommission[]>([])
    const [summary, setSummary] = useState({ totalPending: 0, totalPaid: 0, totalUnregistered: 0, total: 0 })

    const currentDate = new Date()
    const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth() + 1)
    const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear())

    const [showPaymentModal, setShowPaymentModal] = useState(false)
    const [showConfirmModal, setShowConfirmModal] = useState(false)
    const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null)
    const [selectedCommission, setSelectedCommission] = useState<PendingCommission | null>(null)

    const [feedback, setFeedback] = useState<{
        isOpen: boolean
        type: 'success' | 'error' | 'warning' | 'info'
        title: string
        message: string
    }>({ isOpen: false, type: 'info', title: '', message: '' })

    const years = Array.from({ length: 5 }, (_, i) => currentDate.getFullYear() - 2 + i)

    const loadPayments = useCallback(async () => {
        setLoading(true)
        try {
            const response = await fetch(
                `/api/payments?tenantId=${tenantId}&month=${selectedMonth}&year=${selectedYear}`
            )
            const data = await response.json()
            setPayments(data.payments || [])
            setPendingCommissions(data.pendingCommissions || [])
            setSummary(data.summary || { totalPending: 0, totalPaid: 0, totalUnregistered: 0, total: 0 })
        } catch (error) {
            console.error("Erro ao carregar pagamentos:", error)
        } finally {
            setLoading(false)
        }
    }, [tenantId, selectedMonth, selectedYear])

    useEffect(() => {
        loadPayments()
    }, [loadPayments])

    const formatCurrency = (value: number | string) => {
        const num = typeof value === 'string' ? parseFloat(value) : value
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(num)
    }

    const handleRegisterCommission = async (commission: PendingCommission) => {
        try {
            const response = await fetch('/api/payments', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    tenantId,
                    brokerId: commission.brokerId,
                    dealId: commission.dealId,
                    dealParticipantId: commission.dealParticipantId,
                    type: 'commission',
                    description: `Comissão - ${commission.propertyTitle}`,
                    amount: parseFloat(commission.commissionValue),
                    referenceMonth: selectedMonth,
                    referenceYear: selectedYear
                })
            })

            if (response.ok) {
                setFeedback({
                    isOpen: true,
                    type: 'success',
                    title: 'Comissão Registrada',
                    message: 'Comissão adicionada à lista de pagamentos pendentes.'
                })
                loadPayments()
            }
        } catch (error) {
            console.error("Erro ao registrar comissão:", error)
        }
    }

    const handleConfirmPayment = (payment: Payment) => {
        setSelectedPayment(payment)
        setShowConfirmModal(true)
    }

    const handlePaymentConfirmed = () => {
        setShowConfirmModal(false)
        setSelectedPayment(null)
        loadPayments()
        setFeedback({
            isOpen: true,
            type: 'success',
            title: 'Pagamento Confirmado',
            message: 'O pagamento foi marcado como pago.'
        })
    }

    const handleAddReimbursement = () => {
        setSelectedCommission(null)
        setShowPaymentModal(true)
    }

    const handlePaymentCreated = () => {
        setShowPaymentModal(false)
        loadPayments()
        setFeedback({
            isOpen: true,
            type: 'success',
            title: 'Reembolso Registrado',
            message: 'Reembolso adicionado à lista de pagamentos.'
        })
    }

    return (
        <>
            <FeedbackModal
                isOpen={feedback.isOpen}
                onClose={() => setFeedback(prev => ({ ...prev, isOpen: false }))}
                type={feedback.type}
                title={feedback.title}
                message={feedback.message}
            />

            <PaymentModal
                isOpen={showPaymentModal}
                onClose={() => setShowPaymentModal(false)}
                onSave={handlePaymentCreated}
                tenantId={tenantId}
                month={selectedMonth}
                year={selectedYear}
            />

            <ConfirmPaymentModal
                isOpen={showConfirmModal}
                onClose={() => setShowConfirmModal(false)}
                onConfirm={handlePaymentConfirmed}
                payment={selectedPayment}
            />

            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-foreground mb-2">Pagamentos</h1>
                    <p className="text-muted-foreground">Gerencie comissões e reembolsos</p>
                </div>
                <div className="flex items-center gap-4">
                    {/* Month Selector */}
                    <div className="relative">
                        <select
                            value={selectedMonth}
                            onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                            className="appearance-none bg-card border border-input text-foreground px-4 py-2 pr-10 rounded-lg focus:border-primary focus:outline-none"
                        >
                            {months.map((month, idx) => (
                                <option key={idx} value={idx + 1}>{month}</option>
                            ))}
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                    </div>
                    {/* Year Selector */}
                    <div className="relative">
                        <select
                            value={selectedYear}
                            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                            className="appearance-none bg-card border border-input text-foreground px-4 py-2 pr-10 rounded-lg focus:border-primary focus:outline-none"
                        >
                            {years.map(year => (
                                <option key={year} value={year}>{year}</option>
                            ))}
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                    </div>
                    <Button
                        onClick={handleAddReimbursement}
                        className="bg-primary hover:bg-primary/90 text-primary-foreground"
                    >
                        <Plus className="h-4 w-4 mr-2" />
                        Novo Reembolso
                    </Button>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                <div className="bg-card border border-border rounded-lg p-6">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-amber-500/20 rounded-lg">
                            <DollarSign className="h-5 w-5 text-amber-500" />
                        </div>
                        <span className="text-muted-foreground text-sm">Pendente</span>
                    </div>
                    <p className="text-2xl font-bold text-amber-500">{formatCurrency(summary.totalPending)}</p>
                </div>
                <div className="bg-card border border-border rounded-lg p-6">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-primary/20 rounded-lg">
                            <Check className="h-5 w-5 text-primary" />
                        </div>
                        <span className="text-muted-foreground text-sm">Pago</span>
                    </div>
                    <p className="text-2xl font-bold text-primary">{formatCurrency(summary.totalPaid)}</p>
                </div>
                <div className="bg-card border border-border rounded-lg p-6">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-blue-500/20 rounded-lg">
                            <Receipt className="h-5 w-5 text-blue-500" />
                        </div>
                        <span className="text-muted-foreground text-sm">Não Registrado</span>
                    </div>
                    <p className="text-2xl font-bold text-blue-500">{formatCurrency(summary.totalUnregistered)}</p>
                </div>
                <div className="bg-card border border-border rounded-lg p-6">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-zinc-500/20 rounded-lg">
                            <Calendar className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <span className="text-muted-foreground text-sm">Total do Mês</span>
                    </div>
                    <p className="text-2xl font-bold text-foreground">{formatCurrency(summary.total)}</p>
                </div>
            </div>

            {loading ? (
                <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 text-primary animate-spin" />
                </div>
            ) : (
                <div className="space-y-6">
                    {/* Pending Commissions (not yet registered) */}
                    {pendingCommissions.length > 0 && (
                        <div className="bg-card border border-border rounded-lg overflow-hidden">
                            <div className="px-6 py-4 border-b border-border">
                                <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                                    <Receipt className="h-5 w-5 text-blue-500" />
                                    Comissões Não Registradas
                                </h2>
                                <p className="text-muted-foreground text-sm">Comissões de vendas que ainda não foram adicionadas para pagamento</p>
                            </div>
                            <div className="divide-y divide-zinc-800">
                                {pendingCommissions.map((commission) => (
                                    <div key={commission.dealParticipantId} className="px-6 py-4 flex items-center justify-between hover:bg-zinc-800/50">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-full bg-zinc-700 flex items-center justify-center overflow-hidden">
                                                {commission.brokerAvatarUrl ? (
                                                    <img src={commission.brokerAvatarUrl} alt="" className="w-full h-full object-cover" />
                                                ) : (
                                                    <span className="text-lg font-bold text-muted-foreground">
                                                        {commission.brokerName?.charAt(0)}
                                                    </span>
                                                )}
                                            </div>
                                            <div>
                                                <p className="text-foreground font-medium">{commission.brokerName}</p>
                                                <p className="text-muted-foreground text-sm">{commission.propertyTitle}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <span className="text-primary font-semibold">
                                                {formatCurrency(commission.commissionValue)}
                                            </span>
                                            <Button
                                                size="sm"
                                                onClick={() => handleRegisterCommission(commission)}
                                                className="bg-blue-500 hover:bg-blue-600 text-white shadow-md shadow-blue-500/20"
                                            >
                                                <Plus className="h-4 w-4 mr-1" />
                                                Registrar
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Payments Table */}
                    <div className="bg-card border border-border rounded-lg overflow-hidden">
                        <div className="px-6 py-4 border-b border-border">
                            <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                                <DollarSign className="h-5 w-5 text-primary" />
                                Pagamentos do Mês
                            </h2>
                        </div>
                        {payments.length === 0 ? (
                            <div className="px-6 py-12 text-center">
                                <DollarSign className="h-12 w-12 text-zinc-600 mx-auto mb-4" />
                                <p className="text-muted-foreground">Nenhum pagamento registrado para este mês</p>
                            </div>
                        ) : (
                            <table className="w-full">
                                <thead className="bg-zinc-800/50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Colaborador</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Tipo</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Descrição</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase">Valor</th>
                                        <th className="px-6 py-3 text-center text-xs font-medium text-muted-foreground uppercase">Status</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase">Ações</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-zinc-800">
                                    {payments.map((payment) => (
                                        <tr key={payment.id} className="hover:bg-zinc-800/50">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-zinc-700 flex items-center justify-center overflow-hidden">
                                                        {payment.brokerAvatarUrl ? (
                                                            <img src={payment.brokerAvatarUrl} alt="" className="w-full h-full object-cover" />
                                                        ) : (
                                                            <span className="text-sm font-bold text-muted-foreground">
                                                                {payment.brokerName?.charAt(0)}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <span className="text-foreground">{payment.brokerName}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2 py-1 rounded text-xs font-medium ${payment.type === 'commission'
                                                    ? 'bg-primary/20 text-primary'
                                                    : 'bg-amber-500/20 text-amber-400'
                                                    }`}>
                                                    {payment.type === 'commission' ? 'Comissão' : 'Reembolso'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-muted-foreground text-sm">
                                                {payment.description || '-'}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <span className="text-primary font-semibold">
                                                    {formatCurrency(payment.amount)}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <span className={`px-3 py-1 rounded-full text-xs font-medium ${payment.status === 'paid'
                                                    ? 'bg-primary/20 text-primary'
                                                    : payment.status === 'cancelled'
                                                        ? 'bg-red-500/20 text-red-400'
                                                        : 'bg-amber-500/20 text-amber-400'
                                                    }`}>
                                                    {payment.status === 'paid' ? 'Pago' : payment.status === 'cancelled' ? 'Cancelado' : 'Pendente'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    {payment.status === 'pending' && (
                                                        <Button
                                                            size="sm"
                                                            onClick={() => handleConfirmPayment(payment)}
                                                            className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-md shadow-primary/20"
                                                        >
                                                            <Check className="h-4 w-4 mr-1" />
                                                            Pagar
                                                        </Button>
                                                    )}
                                                    {payment.receiptUrl && (
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            onClick={() => window.open(payment.receiptUrl!, '_blank')}
                                                        >
                                                            <Eye className="h-4 w-4" />
                                                        </Button>
                                                    )}
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => window.open(`/api/payments/receipt/${payment.id}`, '_blank')}
                                                    >
                                                        <FileText className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
            )}
        </>
    )
}
