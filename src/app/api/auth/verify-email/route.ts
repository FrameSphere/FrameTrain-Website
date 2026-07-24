import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { hashVerificationToken } from '@/lib/email-verification'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

// POST statt GET: der Klick auf den Mail-Link öffnet nur eine Seite, die den
// Token per fetch() postet. Würde die Verifikation direkt per GET laufen,
// würden Mail-Sicherheits-Scanner (die Links automatisch "vorabrufen") Tokens
// verbrennen, bevor der echte Nutzer klickt.
export async function POST(req: NextRequest) {
  try {
    const { token } = await req.json()

    if (!token || typeof token !== 'string') {
      return NextResponse.json({ error: 'Ungültiger Bestätigungslink' }, { status: 400 })
    }

    const tokenHash = hashVerificationToken(token)

    const user = await prisma.user.findUnique({
      where: { emailVerificationTokenHash: tokenHash },
      select: { id: true, emailVerified: true, emailVerificationExpires: true },
    })

    if (!user) {
      return NextResponse.json({ error: 'Ungültiger oder bereits verwendeter Bestätigungslink' }, { status: 400 })
    }

    if (user.emailVerified) {
      return NextResponse.json({ message: 'E-Mail-Adresse ist bereits bestätigt', alreadyVerified: true })
    }

    if (!user.emailVerificationExpires || user.emailVerificationExpires < new Date()) {
      return NextResponse.json({ error: 'Der Bestätigungslink ist abgelaufen. Bitte fordere eine neue Mail an.' }, { status: 400 })
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: true,
        emailVerifiedAt: new Date(),
        emailVerificationTokenHash: null,
        emailVerificationExpires: null,
      },
    })

    return NextResponse.json({ message: 'E-Mail-Adresse erfolgreich bestätigt' })
  } catch (error) {
    console.error('Verify-email error:', error)
    return NextResponse.json({ error: 'Ein Fehler ist aufgetreten' }, { status: 500 })
  }
}
