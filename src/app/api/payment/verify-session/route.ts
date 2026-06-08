import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

// @ts-ignore
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  // @ts-ignore
  apiVersion: '2024-06-20',
})

export async function GET(req: NextRequest) {
  try {
    // User muss eingeloggt sein
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Nicht authentifiziert' }, { status: 401 })
    }

    const sessionId = req.nextUrl.searchParams.get('session_id')
    if (!sessionId) {
      return NextResponse.json({ error: 'Keine session_id' }, { status: 400 })
    }

    // Session bei Stripe abrufen
    const session = await stripe.checkout.sessions.retrieve(sessionId)

    // Session muss zur E-Mail des eingeloggten Users gehören
    if (session.customer_email !== user.email) {
      return NextResponse.json(
        { error: 'Session gehört nicht zu diesem Account' },
        { status: 403 }
      )
    }

    // Stripe-seitig muss die Session bezahlt/abgeschlossen sein
    const stripePaid =
      session.payment_status === 'paid' ||
      session.status === 'complete'

    if (!stripePaid) {
      return NextResponse.json({ valid: false, hasPaid: false })
    }

    // DB-Stand prüfen — Webhook könnte noch nicht angekommen sein
    const dbUser = await prisma.user.findUnique({
      where: { email: user.email },
      select: { hasPaid: true },
    })

    return NextResponse.json({
      valid: true,
      hasPaid: dbUser?.hasPaid ?? false,
    })
  } catch (error: any) {
    console.error('verify-session error:', error)
    // Ungültige session_id wirft bei Stripe einen Fehler → 404
    return NextResponse.json({ error: 'Ungültige Session' }, { status: 404 })
  }
}
