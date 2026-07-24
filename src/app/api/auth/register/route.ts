import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { signToken, setAuthCookie } from '@/lib/auth'
import { generateVerificationToken } from '@/lib/email-verification'
import { sendVerificationEmail } from '@/lib/resend'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { email, password, acceptedTerms, diagnosticsConsent, locale } = body
    const emailLocale = locale === 'en' ? 'en' : 'de'

    // Validation
    if (!email || !password) {
      return NextResponse.json(
        { error: 'E-Mail und Passwort sind erforderlich' },
        { status: 400 }
      )
    }

    if (!acceptedTerms) {
      return NextResponse.json(
        { error: 'Du musst den AGB und der Datenschutzerklärung zustimmen' },
        { status: 400 }
      )
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Passwort muss mindestens 8 Zeichen lang sein' },
        { status: 400 }
      )
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'Ein Benutzer mit dieser E-Mail existiert bereits' },
        { status: 409 }
      )
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10)

    // Create user
    const now = new Date()
    const { token: verificationToken, tokenHash, expiresAt } = generateVerificationToken()
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        termsAcceptedAt: now,
        diagnosticsConsent: !!diagnosticsConsent,
        diagnosticsConsentAt: diagnosticsConsent ? now : null,
        emailVerificationTokenHash: tokenHash,
        emailVerificationExpires: expiresAt,
      },
    })

    // Verifikations-Mail best-effort versenden: ein Resend-Fehler darf die
    // Registrierung nicht blockieren, der User kann sich die Mail später
    // erneut zuschicken lassen ("Erneut senden" im Dashboard-Banner).
    sendVerificationEmail(user.email, verificationToken, emailLocale).catch((err) =>
      console.error('Verifikations-Mail konnte nicht gesendet werden:', err)
    )

    // Generate JWT token
    const token = signToken({
      userId: user.id,
      email: user.email,
    })

    // Set cookie
    await setAuthCookie(token)

    return NextResponse.json(
      {
        message: 'Registrierung erfolgreich',
        user: {
          id: user.id,
          email: user.email,
        },
      },
      { 
        status: 201,
        headers: {
          'Set-Cookie': `auth-token=${token}; HttpOnly; Path=/; Max-Age=${60 * 60 * 24 * 7}; SameSite=Lax${process.env.NODE_ENV === 'production' ? '; Secure' : ''}`
        }
      }
    )
  } catch (error) {
    console.error('Registration error:', error)
    
    // Detaillierte Fehlermeldungen für Debugging
    if (error instanceof Error) {
      console.error('Error message:', error.message)
      console.error('Error stack:', error.stack)
      
      // Prisma-spezifische Fehler
      if ('code' in error) {
        console.error('Error code:', (error as any).code)
      }
    }
    
    return NextResponse.json(
      { 
        error: 'Ein Fehler ist aufgetreten',
        details: process.env.NODE_ENV === 'development' ? String(error) : undefined
      },
      { status: 500 }
    )
  }
}
