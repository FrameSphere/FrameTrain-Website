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

  // User denied or error from FrameSphere
  if (error || !code) {
    return NextResponse.redirect(`${appUrl}/login?error=framesphere_cancelled`)
  }

  // Verify CSRF state
  const storedState = req.cookies.get('fs_sso_state')?.value
  if (!storedState || storedState !== state) {
    return NextResponse.redirect(`${appUrl}/login?error=framesphere_state_mismatch`)
  }

  try {
    // Exchange code for user data at FrameSphere
    const framesphereApiUrl = process.env.FRAMESPHERE_API_URL || 'https://framesphere-backend.vercel.app/api'
    const clientId = process.env.FRAMESPHERE_CLIENT_ID || 'frametrain'
    const clientSecret = process.env.FRAMESPHERE_CLIENT_SECRET

    if (!clientSecret) {
      console.error('FRAMESPHERE_CLIENT_SECRET not set')
      return NextResponse.redirect(`${appUrl}/login?error=framesphere_misconfigured`)
    }

    // Step 1: Exchange code → get FrameSphere user info
    const tokenRes = await fetch(`${framesphereApiUrl}/sso/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code, client_id: clientId, client_secret: clientSecret }),
    })

    if (!tokenRes.ok) {
      const err = await tokenRes.json().catch(() => ({}))
      console.error('FrameSphere token exchange failed:', err)
      return NextResponse.redirect(`${appUrl}/login?error=framesphere_failed`)
    }

    const { user: fsUser } = await tokenRes.json()
    // fsUser = { id, name, email, role, avatarUrl }

    // Step 2: Find or create FrameTrain user linked to this FrameSphere account
    let user = await prisma.user.findFirst({
      where: { framesphereUserId: fsUser.id },
    })

    if (!user && fsUser.email) {
      // Check if a user with this email already exists → link them
      user = await prisma.user.findUnique({ where: { email: fsUser.email } })

      if (user) {
        // Link existing account to FrameSphere
        user = await prisma.user.update({
          where: { id: user.id },
          data: {
            framesphereUserId: fsUser.id,
            name: user.name || fsUser.name,
            provider: user.provider || 'framesphere',
          },
        })
      }
    }

    if (!user) {
      // Create brand new FrameTrain user from FrameSphere data
      user = await prisma.user.create({
        data: {
          email: fsUser.email,
          name: fsUser.name || fsUser.email,
          provider: 'framesphere',
          providerAccountId: fsUser.id,
          framesphereUserId: fsUser.id,
        },
      })
    }

    // Step 3: Now that we have the FrameTrain user ID, tell FrameSphere to record the link
    await fetch(`${framesphereApiUrl}/sso/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        code,               // code is already used – we pass product_user_id directly via a link endpoint
        client_id: clientId,
        client_secret: clientSecret,
        product_user_id: user.id,
      }),
    }).catch(() => {
      // Non-critical: connection recording failed, but login still works
    })

    // Step 4: Create JWT cookie for FrameTrain session
    const token = signToken({ userId: user.id, email: user.email! })

    const response = NextResponse.redirect(`${appUrl}/dashboard`)

    // Set auth cookie
    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    })

    // Clear CSRF state cookie
    response.cookies.delete('fs_sso_state')

    return response
  } catch (err) {
    console.error('FrameSphere SSO callback error:', err)
    return NextResponse.redirect(`${appUrl}/login?error=framesphere_server_error`)
  }
}
