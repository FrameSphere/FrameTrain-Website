import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import createIntlMiddleware from 'next-intl/middleware'
import { routing } from '@/i18n/routing'

const intlMiddleware = createIntlMiddleware(routing)

// Alte Vercel-Produktions-URL vor dem Domain-Umzug auf frame-train.com.
// Nur dieser exakte Host wird umgeleitet, NICHT *.vercel.app – sonst würden
// auch Preview-Deployments (frame-train-git-*.vercel.app) mit umgeleitet.
const LEGACY_HOST = 'frame-train.vercel.app'

export function middleware(request: NextRequest) {
  // Permanenter Redirect der alten Domain auf frame-train.com – konsolidiert
  // SEO-Signale und verhindert getrennte Cookies/Sessions durch Parallelbetrieb.
  // /api ausgenommen: Webhooks/OAuth-Callbacks werden direkt in den jeweiligen
  // Dashboards (Stripe, Google, GitHub) auf die neue Domain umgestellt.
  const hostname = request.headers.get('host') || ''
  if (hostname === LEGACY_HOST && !request.nextUrl.pathname.startsWith('/api')) {
    const url = new URL(request.url)
    url.protocol = 'https'
    url.hostname = 'frame-train.com'
    url.port = ''
    return NextResponse.redirect(url, 308)
  }

  // API-Routes: nur CORS, kein Locale-Routing (Backend-Endpunkte bleiben
  // unter /api/* ohne /de bzw. /en Präfix)
  if (request.nextUrl.pathname.startsWith('/api')) {
    const origin = request.headers.get('origin')

    if (request.method === 'OPTIONS') {
      return new NextResponse(null, {
        status: 200,
        headers: {
          'Access-Control-Allow-Origin': origin || '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Admin-Token',
          'Access-Control-Allow-Credentials': 'true',
          'Access-Control-Max-Age': '86400',
        },
      })
    }

    const response = NextResponse.next()
    if (origin) {
      response.headers.set('Access-Control-Allow-Origin', origin)
      response.headers.set('Access-Control-Allow-Credentials', 'true')
    }
    return response
  }

  // Alle anderen Routen: next-intl übernimmt Locale-Detection & Redirects
  // (z.B. /faq -> /de/faq, /en/faq bleibt /en/faq)
  return intlMiddleware(request)
}

export const config = {
  matcher: [
    '/api/:path*',
    // next-intl-Standard-Matcher: alles außer _next, statische Dateien etc.
    '/((?!_next|_vercel|.*\\..*).*)',
  ],
}
