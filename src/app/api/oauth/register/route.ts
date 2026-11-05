import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { rateLimit } from '@/lib/rate-limit'
import { newDcrClientId, validateRegistration } from '@/lib/mcp/clients'
import { corsJson, withCors } from '@/lib/mcp/http'

// RFC 7591 Dynamic Client Registration – nur oeffentliche Clients (PKCE).
export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  const ip = (req.headers.get('x-forwarded-for') || 'unknown').split(',')[0].trim()
  const rl = rateLimit(`oauth-register:${ip}`, 30, 60 * 60 * 1000)
  if (!rl.ok) {
    const res = corsJson({ error: 'too_many_requests', error_description: 'Too many registrations' }, { status: 429 })
    res.headers.set('Retry-After', String(rl.retryAfterSeconds))
    return res
  }

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return corsJson({ error: 'invalid_client_metadata', error_description: 'Body must be JSON' }, { status: 400 })
  }
  const v = validateRegistration(body)
  if (!v.ok) return corsJson({ error: v.error, error_description: v.error_description }, { status: 400 })

  const clientId = newDcrClientId()
  const row = await prisma.oAuthClient.create({
    data: { clientId, registrationType: 'dcr', ...v.data },
  })

  return corsJson(
    {
      client_id: row.clientId,
      client_id_issued_at: Math.floor(row.createdAt.getTime() / 1000),
      client_name: row.clientName,
      redirect_uris: row.redirectUris,
      ...(row.clientUri ? { client_uri: row.clientUri } : {}),
      ...(row.logoUri ? { logo_uri: row.logoUri } : {}),
      grant_types: ['authorization_code', 'refresh_token'],
      response_types: ['code'],
      token_endpoint_auth_method: 'none',
    },
    { status: 201 },
  )
}

export async function OPTIONS() {
  return withCors(new NextResponse(null, { status: 204 }))
}
