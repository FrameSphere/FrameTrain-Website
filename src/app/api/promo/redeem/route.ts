import { NextRequest, NextResponse } from 'next/server'
import { Prisma } from '@prisma/client'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { generateApiKey } from '@/lib/api-key'
import { validatePromoCode, consumeRedemptionSlot } from '@/lib/promo'
import { rateLimit, getClientIp } from '@/lib/rate-limit'

export const dynamic = 'force-dynamic'

// Löst einen Code direkt ein (ohne Stripe-Checkout):
// - lifetime:     Zugang für immer
// - free_months:  Zugang für X Monate OHNE Abo/Karte — läuft danach automatisch
//                 ab (promo_access_until; täglicher Cron zieht Zugang + API-Key zurück).
//                 Alternativ kann der User free_months auch MIT Abo über
//                 /api/payment/create-checkout einlösen (Stripe-Trial).
// percent-Codes laufen ausschließlich über den Checkout.
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
    if (promo.type !== 'lifetime' && promo.type !== 'free_months') {
      // Rabatt-Codes müssen durch den Stripe-Checkout laufen
      return NextResponse.json({ valid: false, reason: 'invalid' }, { status: 400 })
    }

    // Atomar einlösen: Redemption-Datensatz (unique pro User+Code) +
    // race-sicherer Slot-Verbrauch + Freischaltung — alles oder nichts.
    let accessUntil: Date | null = null
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

        if (promo.type === 'lifetime') {
          await tx.user.update({
            where: { id: user.userId },
            data: { hasPaid: true, lifetimeAccess: true, promoAccessUntil: null, updatedAt: new Date() },
          })
        } else {
          // free_months ohne Abo: Zugang bis now + X Monate.
          // Läuft bereits eine Promo-Periode, wird ab deren Ende verlängert.
          const dbUser = await tx.user.findUnique({
            where: { id: user.userId },
            select: { promoAccessUntil: true, lifetimeAccess: true },
          })
          const base = dbUser?.promoAccessUntil && dbUser.promoAccessUntil > new Date()
            ? dbUser.promoAccessUntil
            : new Date()
          const until = new Date(base)
          until.setMonth(until.getMonth() + promo.freeMonths!)
          accessUntil = until

          await tx.user.update({
            where: { id: user.userId },
            data: {
              hasPaid: true,
              // Lifetime-User nicht versehentlich auf Zeitablauf zurückstufen
              promoAccessUntil: dbUser?.lifetimeAccess ? null : until,
              updatedAt: new Date(),
            },
          })
        }

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

    console.log(`✅ Promo code redeemed (${promo.type}):`, promo.code, 'by', user.email)
    return NextResponse.json({
      success: true,
      type: promo.type,
      // Cast nötig: TS verfolgt Zuweisungen innerhalb der Transaktions-Closure nicht
      accessUntil: accessUntil ? (accessUntil as Date).toISOString() : null,
    })
  } catch (error) {
    console.error('Promo redeem error:', error)
    return NextResponse.json({ error: 'Interner Fehler' }, { status: 500 })
  }
}
