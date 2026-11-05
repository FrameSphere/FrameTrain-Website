// OAuth-Clients: Dynamic Client Registration (RFC 7591) und Client ID
// Metadata Documents (CIMD, MCP 2025-11-25). Alle Clients sind oeffentlich
// (token_endpoint_auth_method "none"), PKCE S256 ist Pflicht.

import crypto from 'crypto'
import { prisma } from '@/lib/prisma'

const LOOPBACK_HOSTS = new Set(['localhost', '127.0.0.1', '[::1]'])
const MAX_REDIRECT_URIS = 10
const CIMD_REFRESH_MS = 24 * 60 * 60 * 1000
const CIMD_MAX_BYTES = 64 * 1024

export interface ResolvedClient {
  clientId: string
  clientName: string
  redirectUris: string[]
  clientUri: string | null
  logoUri: string | null
  registrationType: 'dcr' | 'cimd'
}

export function isLoopbackUri(u: URL): boolean {
  return u.protocol === 'http:' && LOOPBACK_HOSTS.has(u.hostname.toLowerCase())
}

/** Vertrag: https erzwingen, ausser localhost/127.0.0.1 (http erlaubt). Keine Fragmente. */
export function validateRedirectUri(raw: unknown): string | null {
  if (typeof raw !== 'string' || raw.length > 2000) return null
  let u: URL
  try {
    u = new URL(raw)
  } catch {
    return null
  }
  if (u.hash) return null
  if (u.username || u.password) return null
  if (u.protocol === 'https:') return raw
  if (isLoopbackUri(u)) return raw
  return null
}

/**
 * Exakter Vergleich; bei Loopback-URIs wird der Port ignoriert (RFC 8252 7.3,
 * Claude Code nutzt wechselnde Ports auf localhost und 127.0.0.1).
 */
export function redirectUriAllowed(registered: string[], requested: unknown): boolean {
  if (typeof requested !== 'string') return false
  if (registered.includes(requested)) return true
  let req: URL
  try {
    req = new URL(requested)
  } catch {
    return false
  }
  if (!isLoopbackUri(req)) return false
  return registered.some((r) => {
    try {
      const reg = new URL(r)
      return (
        isLoopbackUri(reg) &&
        reg.hostname.toLowerCase() === req.hostname.toLowerCase() &&
        reg.pathname === req.pathname &&
        reg.search === req.search
      )
    } catch {
      return false
    }
  })
}

export function onlyLoopbackRedirects(uris: string[]): boolean {
  return uris.length > 0 && uris.every((r) => {
    try {
      return isLoopbackUri(new URL(r))
    } catch {
      return false
    }
  })
}

function clipName(v: unknown, fallback: string): string {
  if (typeof v !== 'string') return fallback
  const s = v.replace(/[\u0000-\u001f\u007f]/g, '').trim()
  return s ? s.slice(0, 100) : fallback
}

function optionalHttpsUrl(v: unknown): string | null {
  if (typeof v !== 'string') return null
  try {
    return new URL(v).protocol === 'https:' ? v.slice(0, 500) : null
  } catch {
    return null
  }
}

export type RegistrationResult =
  | { ok: true; data: { clientName: string; redirectUris: string[]; clientUri: string | null; logoUri: string | null } }
  | { ok: false; error: 'invalid_redirect_uri' | 'invalid_client_metadata'; error_description: string }

/** Prueft einen DCR-Request (RFC 7591). */
export function validateRegistration(body: unknown): RegistrationResult {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return { ok: false, error: 'invalid_client_metadata', error_description: 'Body must be a JSON object' }
  }
  const b = body as Record<string, unknown>
  if (!Array.isArray(b.redirect_uris) || b.redirect_uris.length === 0) {
    return { ok: false, error: 'invalid_redirect_uri', error_description: 'redirect_uris is required' }
  }
  if (b.redirect_uris.length > MAX_REDIRECT_URIS) {
    return { ok: false, error: 'invalid_redirect_uri', error_description: 'Too many redirect_uris' }
  }
  const redirectUris: string[] = []
  for (const r of b.redirect_uris) {
    const ok = validateRedirectUri(r)
    if (!ok) {
      return {
        ok: false,
        error: 'invalid_redirect_uri',
        error_description: `Redirect URI not allowed (https required, http only for localhost): ${String(r).slice(0, 200)}`,
      }
    }
    redirectUris.push(ok)
  }
  // Weitere Grant-Typen (z. B. jwt-bearer in Claudes CIMD-Dokument) ignorieren wir; wir geben
  // ohnehin nur authorization_code und refresh_token aus. Ohne authorization_code geht es nicht.
  if (Array.isArray(b.grant_types) && !b.grant_types.includes('authorization_code')) {
    return { ok: false, error: 'invalid_client_metadata', error_description: 'grant_types must include "authorization_code"' }
  }
  if (Array.isArray(b.response_types) && b.response_types.some((r) => r !== 'code')) {
    return { ok: false, error: 'invalid_client_metadata', error_description: 'Only response_type "code" is supported' }
  }
  return {
    ok: true,
    data: {
      clientName: clipName(b.client_name, 'MCP client'),
      redirectUris,
      clientUri: optionalHttpsUrl(b.client_uri),
      logoUri: optionalHttpsUrl(b.logo_uri),
    },
  }
}

export function newDcrClientId(): string {
  return `ftc_${crypto.randomBytes(16).toString('hex')}`
}

// ── CIMD ────────────────────────────────────────────────────────────────────

/** client_id ist eine HTTPS-URL mit Pfad und ohne IP-Literal → CIMD. */
export function isCimdClientId(clientId: string): boolean {
  try {
    const u = new URL(clientId)
    if (u.protocol !== 'https:' || u.pathname === '/' || u.hash || u.username || u.password) return false
    const host = u.hostname
    if (host === 'localhost' || /^[\d.]+$/.test(host) || host.includes(':') || host.startsWith('[')) return false
    return host.includes('.')
  } catch {
    return false
  }
}

type CimdData = { clientName: string; redirectUris: string[]; clientUri: string | null; logoUri: string | null }

/**
 * Bekannte CIMD-Dokumente als Rueckfall, falls der Abruf vom Server aus scheitert
 * (claude.ai liegt hinter Cloudflare; Anfragen aus Rechenzentren bekommen dort u. U.
 * eine Challenge statt JSON). Inhalt = das von Anthropic veroeffentlichte Dokument.
 */
const KNOWN_CIMD: Record<string, CimdData> = {
  'https://claude.ai/oauth/mcp-oauth-client-metadata': {
    clientName: 'Claude',
    redirectUris: ['https://claude.ai/api/mcp/auth_callback'],
    clientUri: 'https://claude.ai',
    logoUri: null,
  },
}

/** Laedt und prueft ein Client-ID-Metadata-Document. */
export async function fetchCimd(clientId: string, fetchImpl: typeof fetch = fetch): Promise<CimdData | null> {
  if (!isCimdClientId(clientId)) return null
  const fallback = KNOWN_CIMD[clientId] ?? null
  try {
    const res = await fetchImpl(clientId, {
      headers: { Accept: 'application/json', 'User-Agent': 'FrameTrain-OAuth/1.0 (+https://frame-train.com/docs/mcp)' },
      redirect: 'error',
      signal: AbortSignal.timeout(5000),
      cache: 'no-store',
    })
    if (!res.ok) {
      console.warn(`[oauth] CIMD ${clientId}: HTTP ${res.status}`)
      return fallback
    }
    const text = await res.text()
    if (text.length > CIMD_MAX_BYTES) return fallback
    let doc: Record<string, unknown>
    try {
      doc = JSON.parse(text) as Record<string, unknown>
    } catch {
      console.warn(`[oauth] CIMD ${clientId}: kein JSON (${text.slice(0, 60).replace(/\s+/g, ' ')})`)
      return fallback
    }
    if (doc.client_id !== clientId) return null
    if (doc.token_endpoint_auth_method && doc.token_endpoint_auth_method !== 'none') {
      // Vertrauliche CIMD-Clients (private_key_jwt) bieten wir nicht an.
      return null
    }
    const reg = validateRegistration(doc)
    if (!reg.ok) {
      console.warn(`[oauth] CIMD ${clientId}: ${reg.error_description}`)
      return null
    }
    return reg.data
  } catch (e) {
    console.warn(`[oauth] CIMD ${clientId}: ${e instanceof Error ? e.message : String(e)}`)
    return fallback
  }
}

/**
 * Client aufloesen: DCR aus der DB, CIMD aus der DB (Cache) oder frisch laden.
 * refresh=true laedt CIMD neu, wenn der Cache aelter als 24 h ist (Authorize-Schritt).
 */
export async function resolveClient(clientId: unknown, opts: { refresh?: boolean } = {}): Promise<ResolvedClient | null> {
  if (typeof clientId !== 'string' || !clientId || clientId.length > 500) return null
  const row = await prisma.oAuthClient.findUnique({ where: { clientId } })
  const cimd = isCimdClientId(clientId)

  const stale = !row?.metadataFetchedAt || Date.now() - row.metadataFetchedAt.getTime() > CIMD_REFRESH_MS
  if (cimd && (!row || (opts.refresh && stale))) {
    const doc = await fetchCimd(clientId)
    if (!doc) return row && !opts.refresh ? toResolved(row) : null
    const saved = await prisma.oAuthClient.upsert({
      where: { clientId },
      create: { clientId, registrationType: 'cimd', metadataFetchedAt: new Date(), ...doc },
      update: { metadataFetchedAt: new Date(), ...doc },
    })
    return toResolved(saved)
  }
  return row ? toResolved(row) : null
}

function toResolved(row: {
  clientId: string; clientName: string; redirectUris: string[]; clientUri: string | null; logoUri: string | null; registrationType: string
}): ResolvedClient {
  return {
    clientId: row.clientId,
    clientName: row.clientName,
    redirectUris: row.redirectUris,
    clientUri: row.clientUri,
    logoUri: row.logoUri,
    registrationType: row.registrationType === 'cimd' ? 'cimd' : 'dcr',
  }
}
