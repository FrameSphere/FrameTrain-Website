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
  const redirectUri = `${baseUrl}/api/auth/oauth/github/callback`

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

    // CSRF check: siehe google/callback für Begründung.
    const storedNonce = req.cookies.get('oauth_state')?.value
    if (!storedNonce || !nonce || storedNonce !== nonce) {
      return NextResponse.redirect(`${errorBase}?error=oauth_cancelled`)
    }

    // Exchange code for access token
    const tokenRes = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Accept: 'application/json',
      },
      body: new URLSearchParams({
        code,
        client_id: process.env.GITHUB_CLIENT_ID!,
        client_secret: process.env.GITHUB_CLIENT_SECRET!,
        redirect_uri: redirectUri,
      }),
    })

    if (!tokenRes.ok) {
      console.error('GitHub token exchange failed:', await tokenRes.text())
      return NextResponse.redirect(`${errorBase}?error=oauth_failed`)
    }

    const tokens = await tokenRes.json()

    if (tokens.error) {
      console.error('GitHub token error:', tokens.error)
      return NextResponse.redirect(`${errorBase}?error=oauth_failed`)
    }

    // Get user info
    const userRes = await fetch('https://api.github.com/user', {
      headers: {
        Authorization: `Bearer ${tokens.access_token}`,
        Accept: 'application/vnd.github+json',
      },
    })

    if (!userRes.ok) {
      return NextResponse.redirect(`${errorBase}?error=oauth_failed`)
    }

    const githubUser = await userRes.json()

    // GitHub may not return email in /user if it's set to private — fetch separately
    let email = githubUser.email as string | null

    if (!email) {
      const emailsRes = await fetch('https://api.github.com/user/emails', {
        headers: {
          Authorization: `Bearer ${tokens.access_token}`,
          Accept: 'application/vnd.github+json',
        },
      })

      if (emailsRes.ok) {
        const emails: { email: string; primary: boolean; verified: boolean }[] = await emailsRes.json()
        const primary = emails.find(e => e.primary && e.verified)
        email = primary?.email || emails[0]?.email || null
      }
    }

    if (!email) {
      return NextResponse.redirect(`${errorBase}?error=no_email`)
    }

    // Upsert user
    let user = await prisma.user.findFirst({
      where: {
        OR: [
          { provider: 'github', providerAccountId: String(githubUser.id) },
          { email },
        ],
      },
    })

    if (user) {
      // Update provider info falls noch nicht gesetzt ODER die providerAccountId noch nicht stimmt
      // (verhindert Ghost-Sessions bei mehrfachem OAuth-Login)
      if (user.provider !== 'github' || user.providerAccountId !== String(githubUser.id)) {
        user = await prisma.user.update({
          where: { id: user.id },
          data: {
            provider: 'github',
            providerAccountId: String(githubUser.id),
            name: user.name || githubUser.name || githubUser.login || null,
          },
        })
      }
    } else {
      user = await prisma.user.create({
        data: {
          email,
          name: githubUser.name || githubUser.login || null,
          provider: 'github',
          providerAccountId: String(githubUser.id),
        },
      })
    }

    // Sign JWT and set cookie
    const token = signToken({ userId: user.id, email: user.email })
    const cookieValue = `auth-token=${token}; HttpOnly; Path=/; Max-Age=${60 * 60 * 24 * 7}; SameSite=Lax${process.env.NODE_ENV === 'production' ? '; Secure' : ''}`

    const destination = user.hasPaid ? '/dashboard' : '/payment'

    const response = NextResponse.redirect(`${baseUrl}${destination}`, {
      headers: { 'Set-Cookie': cookieValue },
    })
    response.cookies.delete('oauth_state')
    return response
  } catch (err) {
    console.error('GitHub OAuth callback error:', err)
    // source ist hier nicht verfügbar, fallback auf /login
    const baseUrl = process.env.NEXT_PUBLIC_URL || 'http://localhost:5001'
    return NextResponse.redirect(`${baseUrl}/login?error=server_error`)
  }
}
