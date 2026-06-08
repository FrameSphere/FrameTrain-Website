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

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Nicht authentifiziert' }, { status: 401 })
    }

    const dbUser = await prisma.user.findUnique({
      where: { id: user.userId },
      select: { stripeCustomerId: true, hasPaid: true },
    })

    if (!dbUser?.stripeCustomerId) {
      return NextResponse.json(
        { error: 'Kein Stripe-Kunde gefunden. Bitte kontaktiere den Support.' },
        { status: 404 }
      )
    }

    const baseUrl = process.env.NEXT_PUBLIC_API_URL ||
      `${req.nextUrl.protocol}//${req.nextUrl.host}`
    const fullBaseUrl = baseUrl.startsWith('http') ? baseUrl : `https://${baseUrl}`

    const session = await stripe.billingPortal.sessions.create({
      customer: dbUser.stripeCustomerId,
      return_url: `${fullBaseUrl}/dashboard`,
    })

    return NextResponse.json({ url: session.url })
  } catch (error: any) {
    console.error('Portal session error:', error)
    return NextResponse.json(
      { error: error.message || 'Fehler beim Öffnen des Portals' },
      { status: 500 }
    )
  }
}
