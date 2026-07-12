import { NextRequest, NextResponse } from 'next/server'
import { Prisma } from '@prisma/client'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { generateApiKey } from '@/lib/api-key'
import { validatePromoCode, consumeRedemptionSlot } from '@/lib/promo'
import { rateLimit, getClientIp } from '@/lib/rate-limit'

export const dynamic = 'force-dynamic'

// Löst einen LIFETIME-Code direkt ein (ohne Stripe-Checkout).
// percent- und free_months-Codes laufen NICHT hier, sondern über
// /api/payment/create-checkout, weil dort Stripe den Rabatt/Trial abbildet.
export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Nicht authentifiziert' }, { status: 401 })
    }

    // Gleiche Limits wie bei validate — redeem ist der sensiblere Endpunkt
    const ip = getClientIp(req.headers)
    const byUser = rateLimit(`promo:user:${user.userId}`, 10, 10 * 60 * 1000)
    const byIp = rateLimit(`promo:ip:${ip}`, 30, 10 * 60 * 1000)
    if (!byUser.ok || !byIp.ok) {
      const retryAfter = Math.max(byUser.retryAfterSeconds, byIp.retryAfterSeconds)
      return NextResponse.json(
        { error: 'rate_limited' },
        { status: 429, headers: { 'Retry-After': String(retryAfter) } }
      )
    }

    const body = await req.json().catch(() => ({}))
    const result = await validatePromoCode(body.code, user.userId)
    if (!result.ok) {
      return NextResponse.json({ valid: false, reason: result.reason }, { status: 400 })
    }

    const promo = result.promo
    if (promo.type !== 'lifetime') {
      // Rabatt-/Gratismonats-Codes müssen durch den Checkout laufen
      return NextResponse.json({ valid: false, reason: 'invalid' }, { status: 400 })
    }

    // Atomar einlösen: Redemption-Datensatz (unique pro User+Code) +
    // race-sicherer Slot-Verbrauch + Freischaltung — alles oder nichts.
    try {
      await prisma.$transaction(async (tx) => {
        // Upsert statt create: eine "pending"-Einlösung (abgebrochener Checkout
        // mit demselben Code) darf das Einlösen nicht blockieren — nur eine
        // bereits abgeschlossene.
        const existing = await tx.promoCodeRedemption.findUnique({
          where: { promoCodeId_userId: { promoCodeId: promo.id, userId: user.userId } },
        })
        if (existing?.status === 'completed') {
          throw new Prisma.PrismaClientKnownRequestError('Already redeemed', {
            code: 'P2002',
            clientVersion: Prisma.prismaVersion.client,
          })
        }
        await tx.promoCodeRedemption.upsert({
          where: { promoCodeId_userId: { promoCodeId: promo.id, userId: user.userId } },
          create: {
            promoCodeId: promo.id,
            userId: user.userId,
            status: 'completed',
            completedAt: new Date(),
          },
          update: {
            status: 'completed',
            completedAt: new Date(),
          },
        })

        const consumed = await consumeRedemptionSlot(tx, promo.id)
        if (!consumed) {
          // Code wurde zwischen Validierung und jetzt ausgeschöpft/deaktiviert
          throw new Error('PROMO_EXHAUSTED')
        }

        await tx.user.update({
          where: { id: user.userId },
          data: { hasPaid: true, lifetimeAccess: true, updatedAt: new Date() },
        })

        // API Key anlegen (idempotent, gleiche Logik wie im Stripe-Webhook)
        const existingKey = await tx.apiKey.findFirst({
          where: { userId: user.userId, isActive: true },
        })
        if (!existingKey) {
          await tx.apiKey.create({
            data: { userId: user.userId, key: generateApiKey(), isActive: true },
          })
        }
      })
    } catch (err: any) {
      if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
        return NextResponse.json({ valid: false, reason: 'already_redeemed' }, { status: 400 })
      }
      if (err?.message === 'PROMO_EXHAUSTED') {
        return NextResponse.json({ valid: false, reason: 'invalid' }, { status: 400 })
      }
      throw err
    }

    console.log('✅ Lifetime promo code redeemed:', promo.code, 'by', user.email)
    return NextResponse.json({ success: true, lifetime: true })
  } catch (error) {
    console.error('Promo redeem error:', error)
    return NextResponse.json({ error: 'Interner Fehler' }, { status: 500 })
  }
}
