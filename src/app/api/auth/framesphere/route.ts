import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'

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
