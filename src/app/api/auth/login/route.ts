import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { signToken, setAuthCookie } from '@/lib/auth'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { email, password } = body

    if (!email || !password) {
      return NextResponse.json(
        { error: 'E-Mail und Passwort sind erforderlich' },
        { status: 400 }
      )
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Ungültige Anmeldedaten' },
        { status: 401 }
      )
    }

    // OAuth-only user has no password
    if (!user.passwordHash) {
      const providerName = user.provider === 'google' ? 'Google' : user.provider === 'github' ? 'GitHub' : 'OAuth'
      return NextResponse.json(
        { error: `Dieser Account wurde über ${providerName} erstellt. Bitte melde dich mit ${providerName} an.` },
        { status: 401 }
      )
    }

    // Check password
    const validPassword = await bcrypt.compare(password, user.passwordHash)

    if (!validPassword) {
      return NextResponse.json(
        { error: 'Ungültige Anmeldedaten' },
        { status: 401 }
      )
    }

    // Generate JWT token
    const token = signToken({
      userId: user.id,
      email: user.email,
    })

    // Set cookie
    await setAuthCookie(token)

    return NextResponse.json({
      message: 'Login erfolgreich',
      user: {
        id: user.id,
        email: user.email,
      },
    }, {
      headers: {
        'Set-Cookie': `auth-token=${token}; HttpOnly; Path=/; Max-Age=${60 * 60 * 24 * 7}; SameSite=Lax${process.env.NODE_ENV === 'production' ? '; Secure' : ''}`
      }
    })
  } catch (error) {
    console.error('Login error:', error)

    if (error instanceof Error) {
      console.error('Error message:', error.message)
      console.error('Error stack:', error.stack)
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
