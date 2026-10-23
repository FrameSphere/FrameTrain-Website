import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { rateLimit, getClientIp } from '@/lib/rate-limit'
import { sendDownloadLinkEmail } from '@/lib/resend'

export const dynamic = 'force-dynamic'

/**
 * POST /api/download-link – schickt dem angemeldeten Nutzer den Link zur
 * Download-Seite per Mail (für Besucher, die gerade am Handy sind).
 *
 * Bewusst nur an die eigene, im Konto hinterlegte Adresse: Ein Formular, das
 * an beliebige Adressen verschickt, ließe sich zum Spammen missbrauchen.
 */
export async function POST(req: NextRequest) {
  const session = await getCurrentUser()
  if (!session) return NextResponse.json({ error: 'not_authenticated' }, { status: 401 })

  const byUser = rateLimit(`download-link:user:${session.userId}`, 3, 60 * 60 * 1000)
  const byIp = rateLimit(`download-link:ip:${getClientIp(req.headers)}`, 10, 60 * 60 * 1000)
  if (!byUser.ok || !byIp.ok) {
    return NextResponse.json({ error: 'rate_limited' }, { status: 429 })
  }

  const user = await prisma.user.findUnique({ where: { id: session.userId }, select: { email: true } })
  if (!user) return NextResponse.json({ error: 'not_found' }, { status: 404 })

  const body = await req.json().catch(() => ({}))
  const locale = body?.locale === 'en' ? 'en' : 'de'
  const result = await sendDownloadLinkEmail(user.email, locale)
  if (!result.sent) return NextResponse.json({ error: 'send_failed' }, { status: 502 })

  return NextResponse.json({ sent: true })
}
