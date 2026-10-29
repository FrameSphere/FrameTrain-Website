import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { rateLimit, getClientIp } from '@/lib/rate-limit'
import { sendDeclarationReceipt } from '@/lib/legal-emails'

export const dynamic = 'force-dynamic'

// @ts-ignore - Stripe API version compatibility
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  // @ts-ignore
  apiVersion: '2024-06-20',
})

// Nimmt Kündigungen (§ 312k BGB) und Widerrufe (§ 356a BGB) ohne Login an.
// Die Erklärung ist mit dem Absenden wirksam – egal ob sie sich einem Konto
// zuordnen lässt. Deshalb gilt in jedem Fall:
//   1. Eingangsbestätigung mit Inhalt + Zeitpunkt an den Kunden
//   2. Kopie an den Betreiber (LEGAL_INBOX)
// Automatisch umgesetzt wird nur die ordentliche Kündigung eines gefundenen
// Abos (cancel_at_period_end – im Kundenportal jederzeit umkehrbar, falls
// jemand fremd gekündigt hätte). Widerruf und außerordentliche Kündigung
// bearbeitet der Betreiber von Hand (Erstattung, Prüfung des Grundes).

const schema = z.object({
  kind: z.enum(['cancel', 'withdrawal']),
  locale: z.enum(['de', 'en']).default('de'),
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().email().max(200),
  contractRef: z.string().trim().max(200).optional().default(''),
  cancelType: z.enum(['ordinary', 'extraordinary']).optional(),
  reason: z.string().trim().max(2000).optional().default(''),
})

export async function POST(req: NextRequest) {
  const ip = getClientIp(req.headers)
  if (!rateLimit(`legal-decl:${ip}`, 5, 10 * 60 * 1000).ok) {
    return NextResponse.json({ error: 'rate_limited' }, { status: 429 })
  }

  const parsed = schema.safeParse(await req.json().catch(() => ({})))
  if (!parsed.success) return NextResponse.json({ error: 'invalid' }, { status: 400 })
  const d = parsed.data
  const en = d.locale === 'en'
  const receivedAt = new Date()

  const user = await prisma.user.findUnique({
    where: { email: d.email.toLowerCase() },
    select: { id: true, stripeSubscriptionId: true },
  })

  let outcome: string
  if (d.kind === 'cancel' && d.cancelType !== 'extraordinary' && user?.stripeSubscriptionId) {
    try {
      const sub = await stripe.subscriptions.update(user.stripeSubscriptionId, { cancel_at_period_end: true })
      const end = new Date(((sub as any).current_period_end ?? 0) * 1000)
      const endStr = end.toLocaleDateString(en ? 'en-GB' : 'de-DE', { dateStyle: 'long', timeZone: 'Europe/Berlin' })
      // Webhook customer.subscription.updated pflegt subscriptionCancelAt nach.
      outcome = en
        ? `Your subscription ends at the end of the current billing period on ${endStr}. You keep full access until then. If you did not send this cancellation, you can reactivate the subscription in your dashboard.`
        : `Dein Abo endet zum Ende der laufenden Abrechnungsperiode am ${endStr}. Bis dahin behältst du vollen Zugang. Falls du diese Kündigung nicht selbst abgeschickt hast, kannst du das Abo im Dashboard wieder aktivieren.`
    } catch (e) {
      console.error('legal/declaration: cancel failed:', e)
      outcome = en
        ? 'We will process your cancellation manually and confirm the end date separately.'
        : 'Wir setzen deine Kündigung von Hand um und bestätigen dir das Vertragsende gesondert.'
    }
  } else if (d.kind === 'cancel') {
    outcome = en
      ? 'We will process your cancellation and confirm the end date separately. If we cannot match it to a contract, we will contact you.'
      : 'Wir bearbeiten deine Kündigung und bestätigen dir das Vertragsende gesondert. Falls wir sie keinem Vertrag zuordnen können, melden wir uns bei dir.'
  } else {
    outcome = en
      ? 'We will process your withdrawal and refund any payments within 14 days using the original payment method.'
      : 'Wir bearbeiten deinen Widerruf und erstatten dir etwaige Zahlungen innerhalb von 14 Tagen über das ursprüngliche Zahlungsmittel.'
  }

  const fields: [string, string][] = [
    [en ? 'Declaration' : 'Erklärung', d.kind === 'cancel'
      ? (d.cancelType === 'extraordinary' ? (en ? 'Extraordinary cancellation' : 'Außerordentliche Kündigung') : (en ? 'Ordinary cancellation' : 'Ordentliche Kündigung'))
      : (en ? 'Withdrawal from the contract' : 'Widerruf des Vertrags')],
    [en ? 'Name' : 'Name', d.name],
    [en ? 'Email' : 'E-Mail', d.email],
    ...(d.contractRef ? [[en ? 'Contract' : 'Vertrag', d.contractRef] as [string, string]] : []),
    ...(d.kind === 'cancel' ? [[en ? 'Effective' : 'Zeitpunkt', d.cancelType === 'extraordinary' ? (en ? 'Immediately' : 'Sofort') : (en ? 'Earliest possible date' : 'Zum nächstmöglichen Zeitpunkt')] as [string, string]] : []),
    ...(d.reason ? [[en ? 'Reason' : 'Grund', d.reason] as [string, string]] : []),
    [en ? 'Matched account' : 'Konto zugeordnet', user ? (en ? 'yes' : 'ja') : (en ? 'no' : 'nein')],
  ]

  const mail = await sendDeclarationReceipt({ kind: d.kind, locale: d.locale, receivedAt, fields, to: d.email, outcome })

  return NextResponse.json({ ok: true, receivedAt: receivedAt.toISOString(), mailed: mail.sent, outcome })
}
