import { z } from 'zod';

export const participantSchema = z.object({
    brokerId: z.number().int().optional().nullable(),
    participantName: z.string().optional().nullable(),
    participantType: z.enum(['internal', 'external']), // Adjust enum based on DB if needed, simplified for now
    role: z.string().optional().nullable(),
    commissionPercent: z.coerce.number().optional().nullable(),
    commissionValue: z.coerce.number().optional().nullable(),
    isResponsible: z.boolean().optional().default(false),
    contributesToMeta: z.boolean().optional().default(true),
});

export const expenseSchema = z.object({
    category: z.string(),
    description: z.string().optional(),
    value: z.coerce.number(),
});

export const dealSchema = z.object({
    tenantId: z.coerce.number().int(),
    propertyId: z.coerce.number().int().optional().nullable(),
    propertyTitle: z.string().min(1, "Título do imóvel é obrigatório"),
    propertyAddress: z.string().optional().nullable(),
    saleDate: z.string().or(z.date()).transform((val) => new Date(val)),
    saleValue: z.coerce.number().positive("Valor da venda deve ser positivo"),
    commissionType: z.string().optional().default('percent'),
    commissionPercent: z.coerce.number().optional().nullable(),
    commissionValue: z.coerce.number().optional().nullable(),
    grossCommission: z.coerce.number().optional().nullable(),
    totalExpenses: z.coerce.number().optional().default(0),
    netCommission: z.coerce.number().optional().nullable(),
    status: z.string().optional().default('completed'),
    notes: z.string().optional().nullable(),
    expenses: z.array(expenseSchema).optional().default([]),
    participants: z.array(participantSchema).optional().default([]),
});

export const brokerSchema = z.object({
    tenantId: z.coerce.number().int(),
    name: z.string().min(1, "Nome é obrigatório"),
    type: z.string().optional().default('corretor'),
    metaAnual: z.coerce.number().optional(),
    avatarUrl: z.string().optional().nullable(),
    year: z.coerce.number().int().optional(),
});

export const paymentSchema = z.object({
    tenantId: z.coerce.number().int(),
    brokerId: z.coerce.number().int(),
    dealId: z.coerce.number().int().optional().nullable(),
    dealParticipantId: z.coerce.number().int().optional().nullable(),
    type: z.string(),
    description: z.string().optional().nullable(),
    amount: z.coerce.number(),
    referenceMonth: z.coerce.number().int().min(1).max(12),
    referenceYear: z.coerce.number().int().min(2000),
    notes: z.string().optional().nullable(),
});
