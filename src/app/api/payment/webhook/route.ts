import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { prisma } from '@/lib/prisma'
import { generateApiKey } from '@/lib/api-key'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

// @ts-ignore - Stripe API version compatibility
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  // @ts-ignore
  apiVersion: '2024-06-20',
})

// Helper: API Key generieren und für User anlegen (idempotent)
// WICHTIG: generateApiKey() nutzt crypto.randomBytes (kryptographisch
// sicher). Math.random() darf hier NIE verwendet werden, da der Key
// als Authentifizierungs-Credential für die Desktop-App dient und mit
// Math.random() theoretisch vorhersagbar/erratbar wäre.
async function ensureApiKey(userId: string, email: string) {
  const existing = await prisma.apiKey.findFirst({
    where: { userId, isActive: true },
  })
  if (existing) return existing

  return prisma.apiKey.create({
    data: {
      userId,
      key: generateApiKey(),
      isActive: true,
      createdAt: new Date(),
    },
  })
}

export async function POST(req: NextRequest) {
  const body = await req.text()
  const sig = req.headers.get('stripe-signature')!

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message)
    return NextResponse.json(
      { error: `Webhook Error: ${err.message}` },
      { status: 400 }
    )
  }

  switch (event.type) {

    // ── Abo wurde gestartet (Checkout erfolgreich) ──────────────────────────
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session

      // Bei subscriptions gibt es keine payment_intent, dafür eine subscription ID
      const subscriptionId = session.subscription as string | null

      try {
        const user = await prisma.user.findUnique({
          where: { email: session.customer_email! },
        })

        if (!user) {
          console.error('❌ User not found for email:', session.customer_email)
          break
        }

        // User aktivieren + Stripe IDs speichern
        await prisma.user.update({
          where: { id: user.id },
          data: {
            hasPaid: true,
            stripeCustomerId: session.customer as string,
            stripeSubscriptionId: subscriptionId ?? undefined,
            updatedAt: new Date(),
          },
        })

        // Payment-Datensatz anlegen
        await prisma.payment.create({
          data: {
            userId: user.id,
            email: session.customer_email!,
            amount: session.amount_total ?? 499,
            currency: session.currency ?? 'eur',
            stripePaymentId: null,          // bei subscription kein payment_intent
            stripeSessionId: session.id,
            stripeSubscriptionId: subscriptionId,
            status: 'completed',
            completedAt: new Date(),
          },
        })

        // API Key erstellen (idempotent)
        await ensureApiKey(user.id, session.customer_email!)

        console.log('✅ Subscription started & API Key created for:', session.customer_email)
      } catch (dbError) {
        console.error('❌ Database error in checkout.session.completed:', dbError)
      }
      break
    }

    // ── Abo wurde geändert (z.B. Kündigung zum Periodenende) ────────────────
    case 'customer.subscription.updated': {
      const sub = event.data.object as Stripe.Subscription

      try {
        const user = await prisma.user.findFirst({
          where: { stripeSubscriptionId: sub.id },
        })
        if (!user) break

        if (sub.cancel_at_period_end && sub.cancel_at) {
          // User hat gekündigt — Abo läuft bis Periodenende
          await prisma.user.update({
            where: { id: user.id },
            data: {
              subscriptionCancelAt: new Date(sub.cancel_at * 1000),
              updatedAt: new Date(),
            },
          })
          console.log('⚠️ Subscription will cancel at:', new Date(sub.cancel_at * 1000), 'for:', user.email)
        } else if (!sub.cancel_at_period_end) {
          // Kündigung wurde rückgängig gemacht (Reaktivierung)
          await prisma.user.update({
            where: { id: user.id },
            data: {
              subscriptionCancelAt: null,
              updatedAt: new Date(),
            },
          })
          console.log('✅ Subscription cancellation reversed for:', user.email)
        }
      } catch (dbError) {
        console.error('❌ Database error in customer.subscription.updated:', dbError)
      }
      break
    }

    // ── Abo wurde gekündigt oder ist abgelaufen ─────────────────────────────
    case 'customer.subscription.deleted': {
      const sub = event.data.object as Stripe.Subscription

      try {
        // User über stripeSubscriptionId finden (zuverlässiger als E-Mail)
        const user = await prisma.user.findFirst({
          where: { stripeSubscriptionId: sub.id },
        })

        if (!user) {
          // Fallback: über stripeCustomerId suchen
          const userByCustomer = await prisma.user.findFirst({
            where: { stripeCustomerId: sub.customer as string },
          })
          if (userByCustomer) {
            await prisma.user.update({
              where: { id: userByCustomer.id },
              data: {
                hasPaid: false,
                stripeSubscriptionId: null,
                subscriptionCancelAt: null,
                updatedAt: new Date(),
              },
            })
            // API Key deaktivieren
            await prisma.apiKey.updateMany({
              where: { userId: userByCustomer.id, isActive: true },
              data: { isActive: false },
            })
            console.log('⛔ Subscription cancelled for customer:', sub.customer)
          } else {
            console.error('❌ No user found for subscription:', sub.id)
          }
          break
        }

        await prisma.user.update({
          where: { id: user.id },
          data: {
            hasPaid: false,
            stripeSubscriptionId: null,
            subscriptionCancelAt: null,
            updatedAt: new Date(),
          },
        })

        // Alle aktiven API Keys deaktivieren
        await prisma.apiKey.updateMany({
          where: { userId: user.id, isActive: true },
          data: { isActive: false },
        })

        console.log('⛔ Subscription cancelled for:', user.email)
      } catch (dbError) {
        console.error('❌ Database error in customer.subscription.deleted:', dbError)
      }
      break
    }

    // ── Zahlung fehlgeschlagen (z.B. Karte abgelaufen) ─────────────────────
    case 'invoice.payment_failed': {
      const invoice = event.data.object as Stripe.Invoice
      console.warn('⚠️ Payment failed for customer:', invoice.customer, '| attempt:', (invoice as any).attempt_count)
      // hasPaid bleibt true bis customer.subscription.deleted feuert
      // Stripe schickt automatisch Retry-E-Mails
      break
    }

    // ── Zahlung erfolgreich erneuert ────────────────────────────────────────
    case 'invoice.payment_succeeded': {
      const invoice = event.data.object as Stripe.Invoice
      const subscriptionId = (invoice as any).subscription as string | null
      if (!subscriptionId) break

      try {
        const user = await prisma.user.findFirst({
          where: { stripeSubscriptionId: subscriptionId },
        })
        if (user && !user.hasPaid) {
          // Reaktivieren falls es zwischenzeitlich deaktiviert wurde
          await prisma.user.update({
            where: { id: user.id },
            data: { hasPaid: true, updatedAt: new Date() },
          })
          await ensureApiKey(user.id, user.email)
          console.log('✅ Subscription reactivated for:', user.email)
        }
      } catch (dbError) {
        console.error('❌ Database error in invoice.payment_succeeded:', dbError)
      }
      break
    }

    case 'checkout.session.expired':
      console.log('⚠️ Checkout session expired:', event.data.object.id)
      break

    default:
      console.log(`ℹ️ Unhandled event type ${event.type}`)
  }

  return NextResponse.json({ received: true })
}
