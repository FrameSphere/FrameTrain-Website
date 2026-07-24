import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'
import { generateVerificationToken } from '@/lib/email-verification'
import { sendVerificationEmail } from '@/lib/resend'
import { rateLimit, getClientIp } from '@/lib/rate-limit'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

const LIMIT = 3
const WINDOW_MS = 15 * 60 * 1000 // 15 Minuten

export async function POST(req: NextRequest) {
  try {
    const currentUser = await getCurrentUser()
    if (!currentUser) {
      return NextResponse.json({ error: 'Nicht authentifiziert' }, { status: 401 })
    }

    // Zwei Limits: pro Account (verhindert Mail-Flooding eines einzelnen
    // Postfachs) und pro IP (verhindert Missbrauch über viele Accounts).
    const userLimit = rateLimit(`resend-verification:user:${currentUser.userId}`, LIMIT, WINDOW_MS)
    const ipLimit = rateLimit(`resend-verification:ip:${getClientIp(req.headers)}`, LIMIT * 3, WINDOW_MS)

    if (!userLimit.ok || !ipLimit.ok) {
      const retryAfterSeconds = Math.max(userLimit.retryAfterSeconds, ipLimit.retryAfterSeconds)
      return NextResponse.json(
        { error: 'Zu viele Anfragen. Bitte versuche es später erneut.', retryAfterSeconds },
        { status: 429 }
      )
    }

    const body = await req.json().catch(() => ({}))
    const emailLocale = body?.locale === 'en' ? 'en' : 'de'

    const user = await prisma.user.findUnique({
      where: { id: currentUser.userId },
      select: { id: true, email: true, emailVerified: true },
    })

    if (!user) {
      return NextResponse.json({ error: 'Benutzer nicht gefunden' }, { status: 404 })
    }

    if (user.emailVerified) {
      return NextResponse.json({ message: 'E-Mail-Adresse ist bereits bestätigt', alreadyVerified: true })
    }

    const { token, tokenHash, expiresAt } = generateVerificationToken()
    await prisma.user.update({
      where: { id: user.id },
      data: { emailVerificationTokenHash: tokenHash, emailVerificationExpires: expiresAt },
    })

    const result = await sendVerificationEmail(user.email, token, emailLocale)
    if (!result.sent) {
      return NextResponse.json({ error: 'Mail konnte nicht versendet werden. Bitte versuche es später erneut.' }, { status: 502 })
    }

    return NextResponse.json({ message: 'Bestätigungsmail wurde erneut versendet' })
  } catch (error) {
    console.error('Resend-verification error:', error)
    return NextResponse.json({ error: 'Ein Fehler ist aufgetreten' }, { status: 500 })
  }
}
