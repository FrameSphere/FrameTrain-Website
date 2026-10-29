import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { getCurrentUser, clearAuthCookie } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

// @ts-ignore - Stripe API version compatibility
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  // @ts-ignore
  apiVersion: '2024-06-20',
})

// Konto löschen (Art. 17 DSGVO).
// - Laufendes Abo wird sofort beendet (sonst würde weiter abgebucht).
// - Eigene Library-Scripts werden gelöscht (enthalten den Community-Namen).
// - User-Zeile weg → API-Keys, Modelle, Promo-Einlösungen per Cascade.
// - Zahlungsdatensätze bleiben wegen der steuerlichen Aufbewahrungspflicht
//   (§ 147 AO, § 257 HGB) erhalten; userId wird per SetNull entkoppelt.
//   Genau so steht es in der Datenschutzerklärung.
export async function POST(req: NextRequest) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const body = await req.json().catch(() => ({}))
  if (typeof body.confirmEmail !== 'string' || body.confirmEmail.trim().toLowerCase() !== user.email.toLowerCase()) {
    return NextResponse.json({ error: 'confirm_mismatch' }, { status: 400 })
  }

  const dbUser = await prisma.user.findUnique({
    where: { id: user.userId },
    select: { stripeSubscriptionId: true },
  })
  if (!dbUser) return NextResponse.json({ error: 'not_found' }, { status: 404 })

  if (dbUser.stripeSubscriptionId) {
    try {
      await stripe.subscriptions.cancel(dbUser.stripeSubscriptionId)
    } catch (e: any) {
      // Bereits beendet ist ok – alles andere: nicht löschen, sonst läuft ein
      // Abo ohne Konto weiter.
      if (e?.code !== 'resource_missing') {
        console.error('delete account: subscription cancel failed:', e)
        return NextResponse.json({ error: 'subscription_cancel_failed' }, { status: 502 })
      }
    }
  }

  await prisma.$transaction([
    prisma.libraryScript.deleteMany({ where: { userId: user.userId } }),
    prisma.user.delete({ where: { id: user.userId } }),
  ])
  await clearAuthCookie()

  return NextResponse.json({ ok: true })
}
