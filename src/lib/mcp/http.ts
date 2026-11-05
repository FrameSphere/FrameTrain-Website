import { NextResponse } from 'next/server'
import { protectedResourceMetadataUrl, SCOPE } from './config'

// CORS fuer oeffentliche OAuth-/MCP-Endpunkte: Bearer-Token statt Cookies,
// daher Origin * ohne Credentials (MCP Inspector, Browser-Clients).
export const PUBLIC_CORS_HEADERS: Record<string, string> = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
  'Access-Control-Allow-Headers':
    'Authorization, Content-Type, Accept, Mcp-Protocol-Version, Mcp-Session-Id, Last-Event-ID',
  'Access-Control-Expose-Headers': 'WWW-Authenticate, Mcp-Protocol-Version, Mcp-Session-Id',
  'Access-Control-Max-Age': '86400',
}

export function withCors<T extends Response>(res: T): T {
  for (const [k, v] of Object.entries(PUBLIC_CORS_HEADERS)) res.headers.set(k, v)
  return res
}

export function corsJson(body: unknown, init: ResponseInit = {}) {
  const res = NextResponse.json(body, init)
  res.headers.set('Cache-Control', 'no-store')
  return withCors(res)
}

export function wwwAuthenticate(error?: 'invalid_token' | 'insufficient_scope', description?: string): string {
  const parts = [`Bearer resource_metadata="${protectedResourceMetadataUrl()}"`, `scope="${SCOPE}"`]
  if (error) parts.push(`error="${error}"`)
  if (description) parts.push(`error_description="${description.replace(/"/g, "'")}"`)
  return parts.join(', ')
}

export function unauthorized(error?: 'invalid_token', description?: string) {
  const res = corsJson(
    { jsonrpc: '2.0', id: null, error: { code: -32001, message: description || 'Authentication required' } },
    { status: 401 },
  )
  res.headers.set('WWW-Authenticate', wwwAuthenticate(error, description))
  return res
}

export function bearerToken(req: Request): string | null {
  const h = req.headers.get('authorization')
  if (!h) return null
  const m = /^Bearer\s+(.+)$/i.exec(h.trim())
  return m ? m[1].trim() : null
}
