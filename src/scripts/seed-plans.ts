import { db } from '../lib/db';
import { subscriptionPlans } from '../db/schema';
import { eq } from 'drizzle-orm';

async function seed() {
    console.log('🌱 Seeding subscription plans...');

    const plans = [
        {
            name: 'Starter',
            slug: 'starter',
            amount: 0,
            interval: 'month',
            trialDays: 30,
            maxUsers: 5,
            maxProperties: 100,
            maxDealsPerMonth: 10,
            features: [
                'Até 5 colaboradores',
                'Cadastro de 100 imóveis',
                'Ranking básico',
                'Dashboard em tempo real',
                'Suporte via email'
            ],
            isActive: true,
        },
        {
            name: 'Professional',
            slug: 'professional',
            amount: 19700, // R$ 197,00 (in cents)
            interval: 'month',
            trialDays: 7,
            maxUsers: 20,
            maxProperties: 1000,
            maxDealsPerMonth: 50,
            features: [
                'Até 20 colaboradores',
                'Imóveis ilimitados',
                'Ranking avançado com TV Mode',
                'Gestão financeira completa',
                'Integração com JetImóveis',
                'Suporte prioritário'
            ],
            isActive: true,
        },
        {
            name: 'Enterprise',
            slug: 'enterprise',
            amount: 49700, // R$ 497,00 (in cents)
            interval: 'month',
            trialDays: 0,
            maxUsers: 999,
            maxProperties: 9999,
            maxDealsPerMonth: 9999,
            features: [
                'Colaboradores ilimitados',
                'Múltiplas filiais',
                'Customização de marca (White-label)',
                'API de integração personalizada',
                'Gerente de conta exclusivo',
                'Treinamento presencial/online'
            ],
            isActive: true,
        }
    ];

    for (const plan of plans) {
        const existing = await db.query.subscriptionPlans.findFirst({
            where: eq(subscriptionPlans.slug, plan.slug)
        });

        if (existing) {
            console.log(`ℹ️ Plan ${plan.name} already exists, skipping.`);
            continue;
        }

        await db.insert(subscriptionPlans).values(plan);
        console.log(`✅ Plan ${plan.name} created.`);
    }

    console.log('✔️ Seed complete!');
    process.exit(0);
}

seed().catch((err) => {
    console.error('❌ Seed failed:', err);
    process.exit(1);
});
