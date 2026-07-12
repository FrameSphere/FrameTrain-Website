import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

// Täglicher Cron (siehe vercel.json): zieht Zugang + API-Keys von Usern zurück,
// deren Gratismonate (promo_access_until) abgelaufen sind.
//
// Sicherheit: Vercel Cron sendet automatisch "Authorization: Bearer <CRON_SECRET>",
// wenn die Env-Var CRON_SECRET gesetzt ist. Ohne gültigen Header → 401.
export async function GET(req: NextRequest) {
  const cronSecret = process.env.CRON_SECRET
  if (!cronSecret) {
    // Ohne konfiguriertes Secret niemals offen laufen lassen
    return NextResponse.json({ error: 'CRON_SECRET nicht konfiguriert' }, { status: 503 })
  }
  if (req.headers.get('authorization') !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const now = new Date()

  try {
    // Abgelaufene Promo-User OHNE anderes aktives Zugangsrecht
    // (kein Lifetime, kein laufendes Stripe-Abo)
    const expired = await prisma.user.findMany({
      where: {
        promoAccessUntil: { lt: now },
        lifetimeAccess: false,
        stripeSubscriptionId: null,
      },
      select: { id: true, email: true },
    })

    for (const user of expired) {
      await prisma.$transaction([
        prisma.user.update({
          where: { id: user.id },
          data: { hasPaid: false, promoAccessUntil: null, updatedAt: now },
        }),
        prisma.apiKey.updateMany({
          where: { userId: user.id, isActive: true },
          data: { isActive: false },
        }),
      ])
      console.log('⏳ Promo access expired, access revoked for:', user.email)
    }

    // Aufräumen: abgelaufener Promo-Zeitstempel bei Usern, die inzwischen
    // ein Abo oder Lifetime haben — Zugang bleibt, Feld wird nur geleert
    const cleaned = await prisma.user.updateMany({
      where: {
        promoAccessUntil: { lt: now },
        OR: [{ lifetimeAccess: true }, { stripeSubscriptionId: { not: null } }],
      },
      data: { promoAccessUntil: null },
    })

    return NextResponse.json({
      revoked: expired.length,
      cleaned: cleaned.count,
      ranAt: now.toISOString(),
    })
  } catch (error) {
    console.error('❌ expire-promo-access cron error:', error)
    return NextResponse.json({ error: 'Interner Fehler' }, { status: 500 })
  }
}
