import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { signToken } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const baseUrl = process.env.NEXT_PUBLIC_URL || 'http://localhost:5001'
  const redirectUri = `${baseUrl}/api/auth/oauth/google/callback`

  try {
    const { searchParams } = new URL(req.url)
    const code = searchParams.get('code')
    const error = searchParams.get('error')

    if (error || !code) {
      return NextResponse.redirect(`${baseUrl}/login?error=oauth_cancelled`)
    }

    // Exchange code for tokens
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: process.env.GOOGLE_CLIENT_ID!,
        client_secret: process.env.GOOGLE_CLIENT_SECRET!,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      }),
    })

    if (!tokenRes.ok) {
      console.error('Google token exchange failed:', await tokenRes.text())
      return NextResponse.redirect(`${baseUrl}/login?error=oauth_failed`)
    }

    const tokens = await tokenRes.json()

    // Get user info from Google
    const userRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
    })

    if (!userRes.ok) {
      return NextResponse.redirect(`${baseUrl}/login?error=oauth_failed`)
    }

    const googleUser = await userRes.json()
    // googleUser: { sub, email, name, picture, ... }

    if (!googleUser.email) {
      return NextResponse.redirect(`${baseUrl}/login?error=no_email`)
    }

    // Upsert user: find by provider+id or by email
    let user = await prisma.user.findFirst({
      where: {
        OR: [
          { provider: 'google', providerAccountId: googleUser.sub },
          { email: googleUser.email },
        ],
      },
    })

    if (user) {
      // Update provider info if not set yet (e.g. was email user before)
      if (!user.provider || user.provider === 'email') {
        user = await prisma.user.update({
          where: { id: user.id },
          data: {
            provider: 'google',
            providerAccountId: googleUser.sub,
            name: user.name || googleUser.name || null,
          },
        })
      }
    } else {
      // Create new user
      user = await prisma.user.create({
        data: {
          email: googleUser.email,
          name: googleUser.name || null,
          provider: 'google',
          providerAccountId: googleUser.sub,
        },
      })
    }

    // Sign JWT and set cookie
    const token = signToken({ userId: user.id, email: user.email })
    const cookieValue = `auth-token=${token}; HttpOnly; Path=/; Max-Age=${60 * 60 * 24 * 7}; SameSite=Lax${process.env.NODE_ENV === 'production' ? '; Secure' : ''}`

    // Redirect: new users go to /payment, existing paid users go to /dashboard
    const destination = user.hasPaid ? '/dashboard' : '/payment'

    return NextResponse.redirect(`${baseUrl}${destination}`, {
      headers: { 'Set-Cookie': cookieValue },
    })
  } catch (err) {
    console.error('Google OAuth callback error:', err)
    return NextResponse.redirect(`${baseUrl}/login?error=server_error`)
  }
}
