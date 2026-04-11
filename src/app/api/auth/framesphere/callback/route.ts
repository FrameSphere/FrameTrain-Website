import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { signToken } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const code = searchParams.get('code')
  const state = searchParams.get('state')
  const error = searchParams.get('error')

  const appUrl = process.env.NEXT_PUBLIC_URL || 'http://localhost:5001'

  if (error || !code) {
    return NextResponse.redirect(`${appUrl}/login?error=framesphere_cancelled`)
  }

  // CSRF check
  const storedState = req.cookies.get('fs_sso_state')?.value
  if (!storedState || storedState !== state) {
    return NextResponse.redirect(`${appUrl}/login?error=framesphere_state_mismatch`)
  }

  try {
    const framesphereApiUrl = process.env.FRAMESPHERE_API_URL || 'https://framesphere-backend.vercel.app/api'
    const clientId = process.env.FRAMESPHERE_CLIENT_ID || 'frametrain'
    const clientSecret = process.env.FRAMESPHERE_CLIENT_SECRET

    if (!clientSecret) {
      console.error('FRAMESPHERE_CLIENT_SECRET not set')
      return NextResponse.redirect(`${appUrl}/login?error=framesphere_misconfigured`)
    }

    // Exchange code for FrameSphere user
    const tokenRes = await fetch(`${framesphereApiUrl}/sso/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code, client_id: clientId, client_secret: clientSecret }),
    })

    if (!tokenRes.ok) {
      console.error('FrameSphere token exchange failed:', await tokenRes.text())
      return NextResponse.redirect(`${appUrl}/login?error=framesphere_failed`)
    }

    const { user: fsUser } = await tokenRes.json()

    if (!fsUser?.email) {
      console.error('FrameSphere returned user without email')
      return NextResponse.redirect(`${appUrl}/login?error=framesphere_failed`)
    }

    // Find or create local FrameTrain user
    let user = await prisma.user.findFirst({ where: { framesphereUserId: fsUser.id } })

    if (!user) {
      user = await prisma.user.findUnique({ where: { email: fsUser.email } })
      if (user) {
        // Link existing FrameTrain account to FrameSphere
        user = await prisma.user.update({
          where: { id: user.id },
          data: {
            framesphereUserId: fsUser.id,
            name: user.name || fsUser.name || null,
            provider: user.provider || 'framesphere',
          },
        })
      } else {
        // Brand new user via FrameSphere SSO
        user = await prisma.user.create({
          data: {
            email: fsUser.email,
            name: fsUser.name || null,
            provider: 'framesphere',
            providerAccountId: fsUser.id,
            framesphereUserId: fsUser.id,
          },
        })
      }
    }

    // Sign JWT
    const token = signToken({ userId: user.id, email: user.email })

    // Always go to /sso-welcome — the page decides based on hasPaid
    const response = NextResponse.redirect(`${appUrl}/sso-welcome`)

    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    })

    response.cookies.delete('fs_sso_state')

    return response
  } catch (err) {
    console.error('FrameSphere SSO callback error:', err)
    return NextResponse.redirect(`${appUrl}/login?error=framesphere_server_error`)
  }
}
