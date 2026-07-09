import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const clientId = process.env.GITHUB_CLIENT_ID
  if (!clientId) {
    return NextResponse.json({ error: 'GitHub OAuth nicht konfiguriert' }, { status: 500 })
  }

  const baseUrl = process.env.NEXT_PUBLIC_URL || 'http://localhost:5001'
  const redirectUri = `${baseUrl}/api/auth/oauth/github/callback`

  // Quelle (login | register) für Fehler-Redirect merken
  const source = req.nextUrl.searchParams.get('source') || 'login'

  // CSRF state: kryptographisch zufälliges Nonce, gespeichert in httpOnly-
  // Cookie und im Callback verifiziert (gleiches Muster wie framesphere).
  const nonce = crypto.randomBytes(16).toString('hex')
  const state = Buffer.from(JSON.stringify({ source, nonce })).toString('base64url')

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    scope: 'read:user user:email',
    state,
  })

  const response = NextResponse.redirect(
    `https://github.com/login/oauth/authorize?${params.toString()}`
  )

  response.cookies.set('oauth_state', nonce, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 10,
    path: '/',
  })

  return response
}
