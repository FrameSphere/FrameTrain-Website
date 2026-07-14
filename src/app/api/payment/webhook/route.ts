import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { prisma } from '@/lib/prisma'
import { generateApiKey } from '@/lib/api-key'
import { consumeRedemptionSlot } from '@/lib/promo'

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

// Helper: Promo-Einlösung nach erfolgreichem Checkout finalisieren.
// Erst hier wird der Code wirklich "verbraucht" — abgebrochene Checkouts
// verbrennen so keine Einlösungen.
async function finalizePromoRedemption(session: Stripe.Checkout.Session, userId: string) {
  const promoCodeId = session.metadata?.promoCodeId
  if (!promoCodeId) return

  try {
    const redemption = await prisma.promoCodeRedemption.findUnique({
      where: { promoCodeId_userId: { promoCodeId, userId } },
    })
    if (redemption?.status === 'completed') return // Webhook-Retry → idempotent

    const consumed = await consumeRedemptionSlot(prisma, promoCodeId)
    if (!consumed) {
      // Race: Code wurde zwischen Checkout-Start und -Abschluss ausgeschöpft.
      // Stripe hat den Rabatt bereits gewährt — nur loggen für Admin-Sichtbarkeit.
      console.warn('⚠️ Promo code exhausted between checkout start and completion:', promoCodeId)
    }

    await prisma.promoCodeRedemption.upsert({
      where: { promoCodeId_userId: { promoCodeId, userId } },
      create: {
        promoCodeId,
        userId,
        status: 'completed',
        stripeSessionId: session.id,
        completedAt: new Date(),
      },
      update: {
        status: 'completed',
        stripeSessionId: session.id,
        completedAt: new Date(),
      },
    })

    console.log('✅ Promo redemption completed:', session.metadata?.promoCode, 'for user', userId)
  } catch (err) {
    console.error('❌ Error finalizing promo redemption:', err)
  }
}

// Helper: eine Stripe-Rechnung in die Zahlungshistorie schreiben (idempotent
// über stripe_invoice_id). Erfasst Verlängerungen UND Fehlversuche, damit der
// Support ohne Stripe-Dashboard eine lückenlose Historie sieht.
async function logInvoice(invoice: Stripe.Invoice, ok: boolean) {
  const invoiceId = invoice.id
  if (!invoiceId) return

  const subscriptionId = (invoice as any).subscription as string | null
  const billingReason = (invoice as any).billing_reason as string | null

  // Die allererste Rechnung (subscription_create) ist bereits über
  // checkout.session.completed erfasst → keine Dublette anlegen.
  if (ok && billingReason === 'subscription_create') return

  // User zuordnen (über Subscription, sonst über Customer)
  let user = subscriptionId
    ? await prisma.user.findFirst({ where: { stripeSubscriptionId: subscriptionId } })
    : null
  if (!user && invoice.customer) {
    user = await prisma.user.findFirst({ where: { stripeCustomerId: invoice.customer as string } })
  }

  const amount = ok ? (invoice.amount_paid ?? 0) : (invoice.amount_due ?? 0)
  const data = {
    userId: user?.id ?? null,
    email: invoice.customer_email ?? user?.email ?? 'unknown',
    amount,
    currency: invoice.currency ?? 'eur',
    stripeSubscriptionId: subscriptionId,
    billingReason: billingReason ?? undefined,
    status: ok ? 'renewed' : 'failed',
    completedAt: ok ? new Date() : null,
  }

  await prisma.payment.upsert({
    where: { stripeInvoiceId: invoiceId },
    create: { ...data, stripeInvoiceId: invoiceId },
    update: data,
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
        let user = session.customer_email
          ? await prisma.user.findUnique({ where: { email: session.customer_email } })
          : null

        // Fallback: über die userId aus den Session-Metadaten (robuster,
        // falls der User seine E-Mail zwischenzeitlich geändert hat)
        if (!user && session.metadata?.userId) {
          user = await prisma.user.findUnique({ where: { id: session.metadata.userId } })
        }

        if (!user) {
          console.error('❌ User not found for email:', session.customer_email)
          break
        }

        // Trial-Ende aus der Subscription lesen (für Dashboard-Anzeige
        // "erste Abbuchung am …"). Nur bei Abos mit Gratiszeit gesetzt.
        let trialEnd: Date | null = null
        if (subscriptionId) {
          try {
            const sub = await stripe.subscriptions.retrieve(subscriptionId)
            if (sub.trial_end) trialEnd = new Date(sub.trial_end * 1000)
          } catch (e) {
            console.error('Could not retrieve subscription for trial_end:', e)
          }
        }

        // User aktivieren + Stripe IDs speichern.
        // promoAccessUntil zurücksetzen, sobald ein echtes Abo besteht — die
        // Restzeit wurde beim Checkout als Stripe-Trial übernommen und wird
        // nun vom Abo abgelöst (verhindert Doppel-Anzeige & Fehlablauf).
        await prisma.user.update({
          where: { id: user.id },
          data: {
            hasPaid: true,
            stripeCustomerId: session.customer as string,
            stripeSubscriptionId: subscriptionId ?? undefined,
            subscriptionTrialEnd: trialEnd,
            ...(subscriptionId ? { promoAccessUntil: null } : {}),
            updatedAt: new Date(),
          },
        })

        // Payment-Datensatz anlegen
        await prisma.payment.create({
          data: {
            userId: user.id,
            email: session.customer_email ?? user.email,
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
        await ensureApiKey(user.id, user.email)

        // Falls ein Promo-Code im Spiel war: Einlösung jetzt final verbuchen
        await finalizePromoRedemption(session, user.id)

        console.log('✅ Subscription started & API Key created for:', user.email)
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
            // Lifetime-User & laufende Gratismonate behalten Zugang & API Keys —
            // nur Abo-Felder aufräumen
            const keepAccess = userByCustomer.lifetimeAccess ||
              (userByCustomer.promoAccessUntil !== null && userByCustomer.promoAccessUntil > new Date())
            await prisma.user.update({
              where: { id: userByCustomer.id },
              data: {
                hasPaid: keepAccess,
                stripeSubscriptionId: null,
                subscriptionCancelAt: null,
                updatedAt: new Date(),
              },
            })
            if (!keepAccess) {
              // API Key deaktivieren
              await prisma.apiKey.updateMany({
                where: { userId: userByCustomer.id, isActive: true },
                data: { isActive: false },
              })
            }
            console.log('⛔ Subscription cancelled for customer:', sub.customer)
          } else {
            console.error('❌ No user found for subscription:', sub.id)
          }
          break
        }

        // Lifetime-User & laufende Gratismonate behalten Zugang & API Keys —
        // nur Abo-Felder aufräumen
        const keepAccess = user.lifetimeAccess ||
          (user.promoAccessUntil !== null && user.promoAccessUntil > new Date())
        await prisma.user.update({
          where: { id: user.id },
          data: {
            hasPaid: keepAccess,
            stripeSubscriptionId: null,
            subscriptionCancelAt: null,
            updatedAt: new Date(),
          },
        })

        if (!keepAccess) {
          // Alle aktiven API Keys deaktivieren
          await prisma.apiKey.updateMany({
            where: { userId: user.id, isActive: true },
            data: { isActive: false },
          })
        }

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
      try {
        await logInvoice(invoice, false)
      } catch (dbError) {
        console.error('❌ Database error logging failed invoice:', dbError)
      }
      break
    }

    // ── Zahlung erfolgreich erneuert ────────────────────────────────────────
    case 'invoice.payment_succeeded': {
      const invoice = event.data.object as Stripe.Invoice
      const subscriptionId = (invoice as any).subscription as string | null
      if (!subscriptionId) break

      try {
        // Verlängerung in die Zahlungshistorie schreiben (dedupliziert)
        await logInvoice(invoice, true)

        const user = await prisma.user.findFirst({
          where: { stripeSubscriptionId: subscriptionId },
        })
        if (user) {
          const updates: Record<string, unknown> = {}
          if (!user.hasPaid) {
            // Reaktivieren falls es zwischenzeitlich deaktiviert wurde
            updates.hasPaid = true
            await ensureApiKey(user.id, user.email)
          }
          // Trial ist vorbei, sobald die erste echte Abrechnung durchläuft
          if (user.subscriptionTrialEnd && (invoice as any).billing_reason !== 'subscription_create') {
            updates.subscriptionTrialEnd = null
          }
          if (Object.keys(updates).length > 0) {
            updates.updatedAt = new Date()
            await prisma.user.update({ where: { id: user.id }, data: updates })
          }
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
