import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { POST_LOGIN_COOKIE, postLoginCookieOptions, safeNextPath } from '@/lib/post-login'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const framesphereUrl = process.env.FRAMESPHERE_URL || 'https://frame-sphere.vercel.app'
  const appUrl = process.env.NEXT_PUBLIC_URL || 'http://localhost:5001'
  const clientId = process.env.FRAMESPHERE_CLIENT_ID || 'frametrain'

  const redirectUri = `${appUrl}/api/auth/framesphere/callback`

  // CSRF state – stored in a short-lived cookie, verified in callback
  const state = crypto.randomBytes(16).toString('hex')

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    state,
  })

  const response = NextResponse.redirect(
    `${framesphereUrl}/sso/authorize?${params.toString()}`
  )

  // Ruecksprung nach dem Login (z. B. OAuth-Zustimmung fuer KI-Verbindungen)
  const next = safeNextPath(req.nextUrl.searchParams.get('next'))
  if (next) response.cookies.set(POST_LOGIN_COOKIE, next, postLoginCookieOptions)
  else response.cookies.delete(POST_LOGIN_COOKIE)

  // Store state in cookie for CSRF verification
  response.cookies.set('fs_sso_state', state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 10, // 10 minutes
    path: '/',
  })

  return response
}
