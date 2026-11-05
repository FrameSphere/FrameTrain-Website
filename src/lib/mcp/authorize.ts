// Pruefung des Authorize-Requests und signiertes Zustimmungs-Ticket.

import jwt from 'jsonwebtoken'
import { issuer, resourceUrl, SCOPE } from './config'
import { isValidCodeChallenge } from './crypto'
import { redirectUriAllowed, type ResolvedClient } from './clients'
import { normalizeResource } from './tokens'

export interface AuthorizeParams {
  clientId: string
  redirectUri: string
  codeChallenge: string
  state: string | null
  scope: string
  resource: string
}

export type AuthorizeCheck =
  | { kind: 'fatal'; reason: 'unknown_client' | 'invalid_redirect_uri' }
  | { kind: 'redirect_error'; url: string }
  | { kind: 'ok'; params: AuthorizeParams }

type Query = Record<string, string | string[] | undefined>

function one(q: Query, key: string): string | null {
  const v = q[key]
  if (Array.isArray(v)) return v.length === 1 ? v[0] : null
  return typeof v === 'string' ? v : null
}

/** Redirect zum Client mit RFC 9207 `iss` (auch bei Fehlern). */
export function buildClientRedirect(redirectUri: string, params: Record<string, string | null | undefined>): string {
  const u = new URL(redirectUri)
  for (const [k, v] of Object.entries(params)) if (v != null) u.searchParams.set(k, v)
  u.searchParams.set('iss', issuer())
  return u.toString()
}

/** Gewaehrte Scopes: immer "frametrain", offline_access falls angefragt. Unbekanntes wird ignoriert. */
export function grantedScope(requested: string | null): string {
  const req = new Set((requested || '').split(/\s+/).filter(Boolean))
  return req.has('offline_access') ? `${SCOPE} offline_access` : SCOPE
}

export function checkAuthorizeRequest(q: Query, client: ResolvedClient | null): AuthorizeCheck {
  const redirectUri = one(q, 'redirect_uri')
  if (!client) return { kind: 'fatal', reason: 'unknown_client' }
  // Ohne gueltige redirect_uri darf NICHT umgeleitet werden (Open Redirect).
  if (!redirectUri || !redirectUriAllowed(client.redirectUris, redirectUri)) {
    return { kind: 'fatal', reason: 'invalid_redirect_uri' }
  }
  const state = one(q, 'state')
  const fail = (error: string, description: string): AuthorizeCheck => ({
    kind: 'redirect_error',
    url: buildClientRedirect(redirectUri, { error, error_description: description, state }),
  })

  if (one(q, 'response_type') !== 'code') return fail('unsupported_response_type', 'response_type must be "code"')
  const challenge = one(q, 'code_challenge')
  const method = one(q, 'code_challenge_method')
  if (!challenge) return fail('invalid_request', 'code_challenge is required (PKCE)')
  if (method !== 'S256') return fail('invalid_request', 'code_challenge_method must be S256')
  if (!isValidCodeChallenge(challenge)) return fail('invalid_request', 'Malformed code_challenge')

  const resource = one(q, 'resource')
  if (resource && normalizeResource(resource) !== normalizeResource(resourceUrl())) {
    return fail('invalid_target', `Unknown resource. Use ${resourceUrl()}`)
  }

  return {
    kind: 'ok',
    params: {
      clientId: client.clientId,
      redirectUri,
      codeChallenge: challenge,
      state,
      scope: grantedScope(one(q, 'scope')),
      resource: resourceUrl(),
    },
  }
}

// ── Zustimmungs-Ticket: bindet die geprueften Parameter an den Nutzer ───────

interface TicketPayload {
  typ: 'mcp_consent'
  uid: string
  p: AuthorizeParams
}

function secret(): string {
  const s = process.env.JWT_SECRET
  if (!s) throw new Error('JWT_SECRET ist nicht gesetzt')
  return s
}

export function signConsentTicket(userId: string, params: AuthorizeParams): string {
  const payload: TicketPayload = { typ: 'mcp_consent', uid: userId, p: params }
  return jwt.sign(payload, secret(), { expiresIn: '10m', audience: 'frametrain-oauth-consent' })
}

export function verifyConsentTicket(ticket: unknown): { userId: string; params: AuthorizeParams } | null {
  if (typeof ticket !== 'string') return null
  try {
    const p = jwt.verify(ticket, secret(), { audience: 'frametrain-oauth-consent' }) as TicketPayload
    if (p.typ !== 'mcp_consent' || !p.uid || !p.p) return null
    return { userId: p.uid, params: p.p }
  } catch {
    return null
  }
}
