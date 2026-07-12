import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import type { PromoCode } from '@prisma/client'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { validatePromoCode } from '@/lib/promo'
import { rateLimit, getClientIp } from '@/lib/rate-limit'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

// @ts-ignore - Stripe API version compatibility
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  // @ts-ignore
  apiVersion: '2024-06-20',
})

// Stellt sicher, dass für einen percent-Code ein Stripe-Coupon existiert.
// Wird lazy beim ersten Checkout angelegt und in der DB gespeichert.
async function ensureStripeCoupon(promo: {
  id: string
  code: string
  percentOff: number | null
  percentDuration: string | null
  percentDurationMonths: number | null
  stripeCouponId: string | null
}): Promise<string> {
  if (promo.stripeCouponId) {
    // Existiert der Coupon bei Stripe noch? (könnte im Dashboard gelöscht worden sein)
    try {
      const existing = await stripe.coupons.retrieve(promo.stripeCouponId)
      if (existing && !(existing as any).deleted) return promo.stripeCouponId
    } catch {
      // gelöscht oder nicht auffindbar → neu anlegen
    }
  }

  const duration = (promo.percentDuration ?? 'once') as 'once' | 'forever' | 'repeating'
  const coupon = await stripe.coupons.create({
    percent_off: promo.percentOff!,
    duration,
    ...(duration === 'repeating' ? { duration_in_months: promo.percentDurationMonths! } : {}),
    name: `Promo ${promo.code}`,
    metadata: { promoCodeId: promo.id, promoCode: promo.code },
  })

  await prisma.promoCode.update({
    where: { id: promo.id },
    data: { stripeCouponId: coupon.id },
  })

  return coupon.id
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Nicht authentifiziert' },
        { status: 401 }
      )
    }

    const body = await req.json().catch(() => ({}))
    const plan: 'monthly' | 'yearly' = body.plan === 'yearly' ? 'yearly' : 'monthly'

    const priceId = plan === 'yearly'
      ? process.env.STRIPE_PRICE_ID_YEARLY!
      : process.env.STRIPE_PRICE_ID_MONTHLY!

    // ── Optionaler Promo-Code: NUR serverseitig prüfen & anwenden ────────────
    // Der Client übermittelt nur den Code-String; welcher Rabatt/Trial daraus
    // wird, entscheidet ausschließlich die DB + dieser Server.
    let promo: PromoCode | null = null
    if (body.promoCode !== undefined && body.promoCode !== null && body.promoCode !== '') {
      const ip = getClientIp(req.headers)
      const byUser = rateLimit(`promo:user:${user.userId}`, 10, 10 * 60 * 1000)
      const byIp = rateLimit(`promo:ip:${ip}`, 30, 10 * 60 * 1000)
      if (!byUser.ok || !byIp.ok) {
        return NextResponse.json({ error: 'rate_limited' }, { status: 429 })
      }

      const result = await validatePromoCode(body.promoCode, user.userId)
      if (!result.ok) {
        // Checkout NICHT ohne den erwarteten Rabatt starten — User soll es sehen
        return NextResponse.json({ error: 'promo_invalid', reason: result.reason }, { status: 400 })
      }
      if (result.promo.type === 'lifetime') {
        // Lifetime läuft über /api/promo/redeem, nicht über Stripe
        return NextResponse.json({ error: 'promo_invalid', reason: 'invalid' }, { status: 400 })
      }
      promo = result.promo
    }

    // Get the base URL from the request or environment variable
    const baseUrl = process.env.NEXT_PUBLIC_API_URL ||
                    `${req.nextUrl.protocol}//${req.nextUrl.host}`

    // Ensure the URL has a proper schema
    const fullBaseUrl = baseUrl.startsWith('http') ? baseUrl : `https://${baseUrl}`

    const metadata: Record<string, string> = {
      userId: user.userId,
      email: user.email,
      ...(promo ? { promoCodeId: promo.id, promoCode: promo.code } : {}),
    }

    // Promo → Stripe-Parameter übersetzen
    let discounts: Stripe.Checkout.SessionCreateParams.Discount[] | undefined
    let trialPeriodDays: number | undefined

    if (promo?.type === 'percent') {
      const couponId = await ensureStripeCoupon(promo)
      discounts = [{ coupon: couponId }]
    } else if (promo?.type === 'free_months') {
      // Gratismonate als Trial: Karte wird erfasst, erste Abbuchung erst nach
      // Ablauf. Funktioniert für monthly UND yearly gleichermaßen.
      trialPeriodDays = promo.freeMonths! * 30
    }

    // Erstelle Stripe Checkout Session (Subscription)
    const session = await stripe.checkout.sessions.create({
      customer_email: user.email,
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      ...(discounts ? { discounts } : {}),
      subscription_data: {
        ...(trialPeriodDays ? { trial_period_days: trialPeriodDays } : {}),
        metadata,
      },
      success_url: `${fullBaseUrl}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${fullBaseUrl}/payment/cancel`,
      metadata,
    })

    // Pending-Redemption vormerken (zählt noch nicht gegen max_redemptions —
    // das passiert erst im Webhook bei checkout.session.completed).
    // Upsert: bricht der User ab und startet neu, wird der Eintrag recycelt.
    if (promo) {
      await prisma.promoCodeRedemption.upsert({
        where: { promoCodeId_userId: { promoCodeId: promo.id, userId: user.userId } },
        create: {
          promoCodeId: promo.id,
          userId: user.userId,
          status: 'pending',
          plan,
          stripeSessionId: session.id,
        },
        update: {
          plan,
          stripeSessionId: session.id,
        },
      })
    }

    return NextResponse.json({
      sessionId: session.id,
      url: session.url,
    })
  } catch (error: any) {
    console.error('Stripe checkout error:', error)
    return NextResponse.json(
      { error: error.message || 'Fehler beim Erstellen der Checkout-Session' },
      { status: 500 }
    )
  }
}
