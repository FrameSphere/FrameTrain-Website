// OAuth-Tokens: opake Zufallswerte, gespeichert als SHA-256-Hash.
// Access 1 h, Refresh 30 Tage, Refresh rotiert bei jeder Nutzung.
// Wird ein bereits eingeloestes Refresh-Token erneut vorgelegt (Diebstahl/
// Replay), wird die ganze Token-Familie widerrufen (OAuth 2.1 / BCP).

import crypto from 'crypto'
import { ACCESS_TOKEN_TTL_MS, REFRESH_TOKEN_TTL_MS } from './config'
import { randomSecret, sha256Hex, verifyPkceS256 } from './crypto'

export interface TokenRow {
  id: string
  familyId: string
  userId: string
  clientId: string
  connectionId: string
  scope: string
  resource: string
  accessExpiresAt: Date
  refreshExpiresAt: Date
  rotatedAt: Date | null
  revokedAt: Date | null
}

export interface NewTokenRow extends Omit<TokenRow, 'id' | 'rotatedAt' | 'revokedAt'> {
  accessTokenHash: string
  refreshTokenHash: string
}

export interface TokenStore {
  insert(row: NewTokenRow): Promise<void>
  findByAccessHash(hash: string): Promise<TokenRow | null>
  findByRefreshHash(hash: string): Promise<TokenRow | null>
  /** Atomar: nur wenn rotatedAt und revokedAt noch null sind. */
  markRotated(id: string, now: Date): Promise<boolean>
  revokeFamily(familyId: string, now: Date): Promise<void>
}

export interface TokenResponse {
  access_token: string
  token_type: 'Bearer'
  expires_in: number
  refresh_token: string
  scope: string
}

export interface Grant {
  userId: string
  clientId: string
  connectionId: string
  scope: string
  resource: string
}

export async function issueTokens(
  store: TokenStore,
  grant: Grant,
  now: Date = new Date(),
  familyId: string = crypto.randomUUID(),
): Promise<TokenResponse> {
  const accessToken = randomSecret('ftat_')
  const refreshToken = randomSecret('ftrt_')
  await store.insert({
    ...grant,
    familyId,
    accessTokenHash: sha256Hex(accessToken),
    refreshTokenHash: sha256Hex(refreshToken),
    accessExpiresAt: new Date(now.getTime() + ACCESS_TOKEN_TTL_MS),
    refreshExpiresAt: new Date(now.getTime() + REFRESH_TOKEN_TTL_MS),
  })
  return {
    access_token: accessToken,
    token_type: 'Bearer',
    expires_in: Math.floor(ACCESS_TOKEN_TTL_MS / 1000),
    refresh_token: refreshToken,
    scope: grant.scope,
  }
}

export type OAuthError = { error: 'invalid_grant' | 'invalid_request' | 'invalid_client' | 'invalid_target'; error_description: string }

export async function rotateRefreshToken(
  store: TokenStore,
  refreshToken: unknown,
  clientId: unknown,
  now: Date = new Date(),
  opts: { isConnectionActive?: (connectionId: string) => Promise<boolean> } = {},
): Promise<{ ok: true; tokens: TokenResponse; row: TokenRow } | { ok: false; err: OAuthError }> {
  if (typeof refreshToken !== 'string' || !refreshToken) {
    return { ok: false, err: { error: 'invalid_request', error_description: 'refresh_token missing' } }
  }
  const row = await store.findByRefreshHash(sha256Hex(refreshToken))
  if (!row) return { ok: false, err: { error: 'invalid_grant', error_description: 'Unknown refresh token' } }
  if (typeof clientId === 'string' && clientId && clientId !== row.clientId) {
    return { ok: false, err: { error: 'invalid_grant', error_description: 'Token was issued to another client' } }
  }
  if (row.revokedAt) return { ok: false, err: { error: 'invalid_grant', error_description: 'Refresh token revoked' } }
  if (row.rotatedAt) {
    // Replay eines alten Refresh-Tokens: ganze Familie sperren.
    await store.revokeFamily(row.familyId, now)
    return { ok: false, err: { error: 'invalid_grant', error_description: 'Refresh token already used' } }
  }
  if (row.refreshExpiresAt <= now) return { ok: false, err: { error: 'invalid_grant', error_description: 'Refresh token expired' } }
  if (opts.isConnectionActive && !(await opts.isConnectionActive(row.connectionId))) {
    return { ok: false, err: { error: 'invalid_grant', error_description: 'Connection was disconnected' } }
  }
  // Gleichzeitige Refreshes: nur einer gewinnt.
  if (!(await store.markRotated(row.id, now))) {
    await store.revokeFamily(row.familyId, now)
    return { ok: false, err: { error: 'invalid_grant', error_description: 'Refresh token already used' } }
  }
  const tokens = await issueTokens(
    store,
    { userId: row.userId, clientId: row.clientId, connectionId: row.connectionId, scope: row.scope, resource: row.resource },
    now,
    row.familyId,
  )
  return { ok: true, tokens, row }
}

/** Prueft ein Access-Token aus dem Authorization-Header. */
export async function verifyAccessToken(
  store: TokenStore,
  token: string | null | undefined,
  now: Date = new Date(),
): Promise<TokenRow | null> {
  if (!token || !token.startsWith('ftat_')) return null
  const row = await store.findByAccessHash(sha256Hex(token))
  if (!row || row.revokedAt || row.accessExpiresAt <= now) return null
  return row
}

// ── Authorization Codes ────────────────────────────────────────────────────

export interface AuthCodeRow {
  id: string
  clientId: string
  userId: string
  redirectUri: string
  codeChallenge: string
  scope: string
  resource: string
  expiresAt: Date
  usedAt: Date | null
}

export interface AuthCodeStore {
  findByHash(hash: string): Promise<AuthCodeRow | null>
  /** Atomar: nur wenn usedAt noch null ist. */
  consume(id: string, now: Date): Promise<boolean>
}

export async function redeemAuthCode(
  codes: AuthCodeStore,
  input: { code: unknown; clientId: unknown; redirectUri: unknown; codeVerifier: unknown; resource?: unknown },
  now: Date = new Date(),
): Promise<{ ok: true; code: AuthCodeRow } | { ok: false; err: OAuthError }> {
  if (typeof input.code !== 'string' || !input.code) {
    return { ok: false, err: { error: 'invalid_request', error_description: 'code missing' } }
  }
  if (typeof input.codeVerifier !== 'string') {
    return { ok: false, err: { error: 'invalid_request', error_description: 'code_verifier missing (PKCE required)' } }
  }
  const row = await codes.findByHash(sha256Hex(input.code))
  if (!row || row.usedAt || row.expiresAt <= now) {
    return { ok: false, err: { error: 'invalid_grant', error_description: 'Invalid or expired authorization code' } }
  }
  if (input.clientId !== row.clientId) {
    return { ok: false, err: { error: 'invalid_grant', error_description: 'client_id mismatch' } }
  }
  if (input.redirectUri !== row.redirectUri) {
    return { ok: false, err: { error: 'invalid_grant', error_description: 'redirect_uri mismatch' } }
  }
  if (typeof input.resource === 'string' && input.resource && normalizeResource(input.resource) !== normalizeResource(row.resource)) {
    return { ok: false, err: { error: 'invalid_target', error_description: 'resource mismatch' } }
  }
  if (!verifyPkceS256(input.codeVerifier, row.codeChallenge)) {
    return { ok: false, err: { error: 'invalid_grant', error_description: 'PKCE verification failed' } }
  }
  if (!(await codes.consume(row.id, now))) {
    return { ok: false, err: { error: 'invalid_grant', error_description: 'Authorization code already used' } }
  }
  return { ok: true, code: row }
}

export function normalizeResource(r: string): string {
  return r.replace(/\/+$/, '')
}

// ── In-Memory-Stores (Tests) ───────────────────────────────────────────────

export class MemoryTokenStore implements TokenStore {
  rows: (TokenRow & { accessTokenHash: string; refreshTokenHash: string })[] = []
  private seq = 0
  async insert(row: NewTokenRow) {
    this.rows.push({ ...row, id: `tok_${++this.seq}`, rotatedAt: null, revokedAt: null })
  }
  async findByAccessHash(hash: string) {
    return this.rows.find((r) => r.accessTokenHash === hash) ?? null
  }
  async findByRefreshHash(hash: string) {
    return this.rows.find((r) => r.refreshTokenHash === hash) ?? null
  }
  async markRotated(id: string, now: Date) {
    const r = this.rows.find((x) => x.id === id)
    if (!r || r.rotatedAt || r.revokedAt) return false
    r.rotatedAt = now
    return true
  }
  async revokeFamily(familyId: string, now: Date) {
    for (const r of this.rows) if (r.familyId === familyId && !r.revokedAt) r.revokedAt = now
  }
}

export class MemoryAuthCodeStore implements AuthCodeStore {
  rows: (AuthCodeRow & { codeHash: string })[] = []
  async findByHash(hash: string) {
    return this.rows.find((r) => r.codeHash === hash) ?? null
  }
  async consume(id: string, now: Date) {
    const r = this.rows.find((x) => x.id === id)
    if (!r || r.usedAt) return false
    r.usedAt = now
    return true
  }
}
