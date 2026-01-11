import { NextRequest, NextResponse } from 'next/server'
import { stripe, STRIPE_WEBHOOK_SECRET } from '@/lib/stripe'
import { db } from '@/lib/db'
import { subscriptions, tenants, invoices } from '@/db/schema'
import { eq } from 'drizzle-orm'
import Stripe from 'stripe'

/**
 * Stripe Webhook Handler
 * Processes events from Stripe to keep subscription data in sync
 */

export async function POST(request: NextRequest) {
    const body = await request.text()
    const signature = request.headers.get('stripe-signature')

    if (!signature) {
        return NextResponse.json(
            { error: 'Missing stripe-signature header' },
            { status: 400 }
        )
    }

    let event: Stripe.Event

    try {
        // Verify webhook signature
        event = stripe.webhooks.constructEvent(
            body,
            signature,
            STRIPE_WEBHOOK_SECRET
        )
    } catch (err) {
        console.error('⚠️ Webhook signature verification failed:', err)
        return NextResponse.json(
            { error: 'Invalid signature' },
            { status: 400 }
        )
    }

    console.log(`🔔 Webhook received: ${event.type}`)

    try {
        switch (event.type) {
            case 'checkout.session.completed':
                await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session)
                break

            case 'customer.subscription.created':
            case 'customer.subscription.updated':
                await handleSubscriptionUpdate(event.data.object as Stripe.Subscription)
                break

            case 'customer.subscription.deleted':
                await handleSubscriptionDeleted(event.data.object as Stripe.Subscription)
                break

            case 'invoice.paid':
                await handleInvoicePaid(event.data.object as Stripe.Invoice)
                break

            case 'invoice.payment_failed':
                await handleInvoicePaymentFailed(event.data.object as Stripe.Invoice)
                break

            default:
                console.log(`Unhandled event type: ${event.type}`)
        }

        return NextResponse.json({ received: true })
    } catch (error) {
        console.error('Error processing webhook:', error)
        return NextResponse.json(
            { error: 'Webhook processing failed' },
            { status: 500 }
        )
    }
}

/**
 * Handle successful checkout session
 */
async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
    const tenantId = parseInt(session.metadata?.tenantId || '0')
    const planId = parseInt(session.metadata?.planId || '0')

    if (!tenantId || !planId) {
        console.error('Missing metadata in checkout session')
        return
    }

    const subscriptionId = session.subscription as string

    if (!subscriptionId) {
        console.error('No subscription ID in checkout session')
        return
    }

    // Get full subscription details from Stripe
    const stripeSubscription = await stripe.subscriptions.retrieve(subscriptionId)

    // Create or update subscription in database
    const existing = await db.query.subscriptions.findFirst({
        where: eq(subscriptions.tenantId, tenantId),
    })

    if (existing) {
        await db.update(subscriptions)
            .set({
                stripeSubscriptionId: subscriptionId,
                stripeCustomerId: session.customer as string,
                planId,
                status: stripeSubscription.status,
                currentPeriodStart: new Date(stripeSubscription.current_period_start * 1000),
                currentPeriodEnd: new Date(stripeSubscription.current_period_end * 1000),
                trialStart: stripeSubscription.trial_start
                    ? new Date(stripeSubscription.trial_start * 1000)
                    : null,
                trialEnd: stripeSubscription.trial_end
                    ? new Date(stripeSubscription.trial_end * 1000)
                    : null,
                updatedAt: new Date(),
            })
            .where(eq(subscriptions.id, existing.id))
    } else {
        await db.insert(subscriptions).values({
            tenantId,
            stripeSubscriptionId: subscriptionId,
            stripeCustomerId: session.customer as string,
            planId,
            status: stripeSubscription.status,
            currentPeriodStart: new Date(stripeSubscription.current_period_start * 1000),
            currentPeriodEnd: new Date(stripeSubscription.current_period_end * 1000),
            trialStart: stripeSubscription.trial_start
                ? new Date(stripeSubscription.trial_start * 1000)
                : null,
            trialEnd: stripeSubscription.trial_end
                ? new Date(stripeSubscription.trial_end * 1000)
                : null,
            cancelAtPeriodEnd: false,
        })
    }

    // Update tenant status
    await db.update(tenants)
        .set({
            subscriptionStatus: stripeSubscription.status,
            trialEndsAt: stripeSubscription.trial_end
                ? new Date(stripeSubscription.trial_end * 1000)
                : null,
        })
        .where(eq(tenants.id, tenantId))

    console.log(`✅ Subscription created for tenant ${tenantId}`)
}

/**
 * Handle subscription updates
 */
async function handleSubscriptionUpdate(stripeSubscription: Stripe.Subscription) {
    const tenantId = parseInt(stripeSubscription.metadata?.tenantId || '0')

    if (!tenantId) {
        console.error('Missing tenantId in subscription metadata')
        return
    }

    await db.update(subscriptions)
        .set({
            status: stripeSubscription.status,
            currentPeriodStart: new Date(stripeSubscription.current_period_start * 1000),
            currentPeriodEnd: new Date(stripeSubscription.current_period_end * 1000),
            cancelAtPeriodEnd: stripeSubscription.cancel_at_period_end,
            canceledAt: stripeSubscription.canceled_at
                ? new Date(stripeSubscription.canceled_at * 1000)
                : null,
            updatedAt: new Date(),
        })
        .where(eq(subscriptions.stripeSubscriptionId, stripeSubscription.id))

    // Update tenant status
    await db.update(tenants)
        .set({ subscriptionStatus: stripeSubscription.status })
        .where(eq(tenants.id, tenantId))

    console.log(`✅ Subscription updated for tenant ${tenantId}`)
}

/**
 * Handle subscription deletion
 */
async function handleSubscriptionDeleted(stripeSubscription: Stripe.Subscription) {
    const tenantId = parseInt(stripeSubscription.metadata?.tenantId || '0')

    if (!tenantId) {
        console.error('Missing tenantId in subscription metadata')
        return
    }

    await db.update(subscriptions)
        .set({
            status: 'canceled',
            canceledAt: new Date(),
            updatedAt: new Date(),
        })
        .where(eq(subscriptions.stripeSubscriptionId, stripeSubscription.id))

    // Update tenant status
    await db.update(tenants)
        .set({ subscriptionStatus: 'canceled' })
        .where(eq(tenants.id, tenantId))

    console.log(`✅ Subscription canceled for tenant ${tenantId}`)
}

/**
 * Handle successful invoice payment
 */
async function handleInvoicePaid(invoice: Stripe.Invoice) {
    const tenantId = parseInt(invoice.metadata?.tenantId || '0')

    if (!tenantId) {
        // Try to get tenantId from subscription
        if (invoice.subscription) {
            const subscription = await stripe.subscriptions.retrieve(invoice.subscription as string)
            const subTenantId = parseInt(subscription.metadata?.tenantId || '0')
            if (subTenantId) {
                await createInvoiceRecord(invoice, subTenantId)
            }
        }
        return
    }

    await createInvoiceRecord(invoice, tenantId)
    console.log(`✅ Invoice paid for tenant ${tenantId}`)
}

/**
 * Handle failed invoice payment
 */
async function handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
    const tenantId = parseInt(invoice.metadata?.tenantId || '0')

    if (!tenantId) {
        console.error('Missing tenantId in invoice metadata')
        return
    }

    // Update tenant status to past_due
    await db.update(tenants)
        .set({ subscriptionStatus: 'past_due' })
        .where(eq(tenants.id, tenantId))

    console.log(`⚠️ Invoice payment failed for tenant ${tenantId}`)
}

/**
 * Create invoice record in database
 */
async function createInvoiceRecord(invoice: Stripe.Invoice, tenantId: number) {
    const subscription = await db.query.subscriptions.findFirst({
        where: eq(subscriptions.tenantId, tenantId),
    })

    await db.insert(invoices).values({
        tenantId,
        subscriptionId: subscription?.id || null,
        stripeInvoiceId: invoice.id,
        stripePaymentIntentId: invoice.payment_intent as string || null,
        amount: invoice.amount_paid,
        currency: invoice.currency,
        status: invoice.status || 'paid',
        invoiceUrl: invoice.hosted_invoice_url || null,
        invoicePdf: invoice.invoice_pdf || null,
        paidAt: invoice.status_transitions?.paid_at
            ? new Date(invoice.status_transitions.paid_at * 1000)
            : null,
        dueDate: invoice.due_date
            ? new Date(invoice.due_date * 1000)
            : null,
    })
}
