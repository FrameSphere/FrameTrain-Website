import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const clientId = process.env.GOOGLE_CLIENT_ID
  if (!clientId) {
    return NextResponse.json({ error: 'Google OAuth nicht konfiguriert' }, { status: 500 })
  }

  const baseUrl = process.env.NEXT_PUBLIC_URL || 'http://localhost:5001'
  const redirectUri = `${baseUrl}/api/auth/oauth/google/callback`

  // Quelle (login | register) für Fehler-Redirect merken
  const source = req.nextUrl.searchParams.get('source') || 'login'

  // CSRF state: kryptographisch zufälliges Nonce, das in einem httpOnly-
  // Cookie gespeichert und im Callback gegen den state-Query-Param
  // verglichen wird (gleiches Muster wie /api/auth/framesphere).
  // Der 'source'-Teil wird zusätzlich im Klartext mitgegeben, damit der
  // Callback bei Fehlern zur richtigen Seite (login/register) zurück kann.
  const nonce = crypto.randomBytes(16).toString('hex')
  const state = Buffer.from(JSON.stringify({ source, nonce })).toString('base64url')

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: 'openid email profile',
    access_type: 'offline',
    prompt: 'select_account',
    state,
  })

  const response = NextResponse.redirect(
    `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`
  )

  response.cookies.set('oauth_state', nonce, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 10, // 10 Minuten
    path: '/',
  })

  return response
}
