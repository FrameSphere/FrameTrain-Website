import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { signToken } from '@/lib/auth'

export const dynamic = 'force-dynamic'

// State-Param parsen: { source: 'login' | 'register', nonce: string }
function parseState(state: string | null): { source: string; nonce: string | null } {
  try {
    if (!state) return { source: 'login', nonce: null }
    const decoded = JSON.parse(Buffer.from(state, 'base64url').toString('utf-8'))
    return {
      source: decoded.source === 'register' ? 'register' : 'login',
      nonce: typeof decoded.nonce === 'string' ? decoded.nonce : null,
    }
  } catch {
    return { source: 'login', nonce: null }
  }
}

export async function GET(req: NextRequest) {
  const baseUrl = process.env.NEXT_PUBLIC_URL || 'http://localhost:5001'
  const redirectUri = `${baseUrl}/api/auth/oauth/google/callback`

  try {
    const { searchParams } = new URL(req.url)
    const code = searchParams.get('code')
    const error = searchParams.get('error')
    const rawState = searchParams.get('state')
    const { source, nonce } = parseState(rawState)
    const errorBase = `${baseUrl}/${source}`

    if (error || !code) {
      return NextResponse.redirect(`${errorBase}?error=oauth_cancelled`)
    }

    // CSRF check: das im state mitgegebene Nonce muss mit dem Cookie
    // übereinstimmen, das beim Start des Flows gesetzt wurde. Ohne diese
    // Prüfung könnte ein Angreifer ein Opfer per CSRF in eine fremde
    // (vom Angreifer kontrollierte) OAuth-Session einloggen (Login-CSRF).
    const storedNonce = req.cookies.get('oauth_state')?.value
    if (!storedNonce || !nonce || storedNonce !== nonce) {
      return NextResponse.redirect(`${errorBase}?error=oauth_cancelled`)
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
      return NextResponse.redirect(`${errorBase}?error=oauth_failed`)
    }

    const tokens = await tokenRes.json()

    // Get user info from Google
    const userRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
    })

    if (!userRes.ok) {
      return NextResponse.redirect(`${errorBase}?error=oauth_failed`)
    }

    const googleUser = await userRes.json()
    // googleUser: { sub, email, name, picture, ... }

    if (!googleUser.email) {
      return NextResponse.redirect(`${errorBase}?error=no_email`)
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
      // Update provider info falls noch nicht gesetzt ODER die providerAccountId noch nicht stimmt
      // (verhindert Ghost-Sessions bei mehrfachem OAuth-Login)
      if (user.provider !== 'google' || user.providerAccountId !== googleUser.sub) {
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

    const response = NextResponse.redirect(`${baseUrl}${destination}`, {
      headers: { 'Set-Cookie': cookieValue },
    })
    response.cookies.delete('oauth_state')
    return response
  } catch (err) {
    console.error('Google OAuth callback error:', err)
    // source ist hier nicht verfügbar, fallback auf /login
    const baseUrl = process.env.NEXT_PUBLIC_URL || 'http://localhost:5001'
    return NextResponse.redirect(`${baseUrl}/login?error=server_error`)
  }
}
