import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

// @ts-ignore - Stripe API version compatibility
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  // @ts-ignore
  apiVersion: '2024-06-20',
})

// Spiegelt die Entscheidung aus dem Cookie-Banner in die Subscription-
// Metadaten. Der Stripe-Webhook sendet Kauf-Events an Meta/GA4 nur bei
// adConsent=granted – ein Widerruf im Banner stoppt also auch das
// serverseitige Tracking künftiger Verlängerungen.
export async function POST(req: NextRequest) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ ok: false }, { status: 401 })

  const body = await req.json().catch(() => ({}))
  const adConsent = body.status === 'granted' ? 'granted' : 'denied'

  const dbUser = await prisma.user.findUnique({
    where: { id: user.userId },
    select: { stripeSubscriptionId: true },
  })
  if (!dbUser?.stripeSubscriptionId) return NextResponse.json({ ok: true, updated: false })

  try {
    await stripe.subscriptions.update(dbUser.stripeSubscriptionId, { metadata: { adConsent } })
  } catch (e) {
    console.error('ad-consent: subscription update failed:', e)
    return NextResponse.json({ ok: false }, { status: 502 })
  }
  return NextResponse.json({ ok: true, updated: true })
}
