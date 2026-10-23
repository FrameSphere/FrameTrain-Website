import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyUnsubscribeToken } from '@/lib/email-unsubscribe'
import { siteUrl } from '@/lib/seo'

export const dynamic = 'force-dynamic'

/**
 * POST: abmelden (oder mit action=resubscribe wieder anmelden).
 * Wird vom Mailprogramm per List-Unsubscribe-Post (RFC 8058) aufgerufen und
 * von der Abmelde-Seite. Signatur statt Login, siehe lib/email-unsubscribe.
 *
 * GET leitet nur auf die Seite weiter: Link-Scanner in Firmen-Postfächern
 * rufen Links ungefragt auf und dürfen dabei niemanden abmelden.
 */
export async function POST(req: NextRequest) {
  const params = req.nextUrl.searchParams
  let userId = params.get('u') || ''
  let token = params.get('t') || ''
  let action = params.get('action') || 'unsubscribe'

  if (req.headers.get('content-type')?.includes('application/json')) {
    const body = await req.json().catch(() => ({}))
    userId = body.u || userId
    token = body.t || token
    action = body.action || action
  }

  if (!verifyUnsubscribeToken(userId, token)) {
    return NextResponse.json({ error: 'invalid_link' }, { status: 400 })
  }

  try {
    await prisma.user.update({
      where: { id: userId },
      data: { onboardingEmails: action === 'resubscribe' },
    })
  } catch {
    // Konto gelöscht: für den Nutzer ist das Ergebnis dasselbe
  }
  return NextResponse.json({ ok: true, subscribed: action === 'resubscribe' })
}

export async function GET(req: NextRequest) {
  const u = req.nextUrl.searchParams.get('u') || ''
  const t = req.nextUrl.searchParams.get('t') || ''
  return NextResponse.redirect(`${siteUrl}/de/email/unsubscribe?u=${encodeURIComponent(u)}&t=${encodeURIComponent(t)}`)
}
