import { describe, expect, it } from 'vitest'
import {
  issueTokens, MemoryAuthCodeStore, MemoryTokenStore, redeemAuthCode, rotateRefreshToken, verifyAccessToken,
} from '../tokens'
import { s256Challenge, sha256Hex } from '../crypto'
import { ACCESS_TOKEN_TTL_MS, REFRESH_TOKEN_TTL_MS } from '../config'

const grant = { userId: 'u1', clientId: 'c1', connectionId: 'conn1', scope: 'frametrain', resource: 'https://frame-train.com/api/mcp' }
const t0 = new Date('2026-11-04T10:00:00Z')

describe('token issuance', () => {
  it('stores only hashes and verifies the access token', async () => {
    const store = new MemoryTokenStore()
    const tokens = await issueTokens(store, grant, t0)
    expect(tokens.token_type).toBe('Bearer')
    expect(tokens.expires_in).toBe(3600)
    expect(tokens.access_token.startsWith('ftat_')).toBe(true)
    expect(tokens.refresh_token.startsWith('ftrt_')).toBe(true)
    const row = store.rows[0]
    expect(row.accessTokenHash).toBe(sha256Hex(tokens.access_token))
    expect(JSON.stringify(store.rows)).not.toContain(tokens.access_token)
    expect(JSON.stringify(store.rows)).not.toContain(tokens.refresh_token)
    expect(await verifyAccessToken(store, tokens.access_token, t0)).toMatchObject({ userId: 'u1' })
  })

  it('expires access tokens after 1 h', async () => {
    const store = new MemoryTokenStore()
    const { access_token } = await issueTokens(store, grant, t0)
    expect(await verifyAccessToken(store, access_token, new Date(t0.getTime() + ACCESS_TOKEN_TTL_MS - 1))).not.toBeNull()
    expect(await verifyAccessToken(store, access_token, new Date(t0.getTime() + ACCESS_TOKEN_TTL_MS))).toBeNull()
  })

  it('rejects unknown and foreign tokens', async () => {
    const store = new MemoryTokenStore()
    expect(await verifyAccessToken(store, 'ftat_nope', t0)).toBeNull()
    expect(await verifyAccessToken(store, 'ft_apikey_lookalike', t0)).toBeNull()
    expect(await verifyAccessToken(store, null, t0)).toBeNull()
  })
})

describe('refresh token rotation', () => {
  it('rotates: new pair works, old refresh token is consumed', async () => {
    const store = new MemoryTokenStore()
    const first = await issueTokens(store, grant, t0)
    const r = await rotateRefreshToken(store, first.refresh_token, 'c1', t0)
    expect(r.ok).toBe(true)
    if (!r.ok) return
    expect(r.tokens.refresh_token).not.toBe(first.refresh_token)
    expect(store.rows).toHaveLength(2)
    expect(store.rows[0].familyId).toBe(store.rows[1].familyId)
    expect(await verifyAccessToken(store, r.tokens.access_token, t0)).not.toBeNull()
  })

  it('detects reuse of an old refresh token and revokes the whole family', async () => {
    const store = new MemoryTokenStore()
    const first = await issueTokens(store, grant, t0)
    const second = await rotateRefreshToken(store, first.refresh_token, 'c1', t0)
    if (!second.ok) throw new Error('rotation failed')
    const replay = await rotateRefreshToken(store, first.refresh_token, 'c1', t0)
    expect(replay).toMatchObject({ ok: false, err: { error: 'invalid_grant' } })
    // Auch das neue Paar ist jetzt gesperrt.
    expect(await verifyAccessToken(store, second.tokens.access_token, t0)).toBeNull()
    const third = await rotateRefreshToken(store, second.tokens.refresh_token, 'c1', t0)
    expect(third.ok).toBe(false)
  })

  it('rejects expired refresh tokens and wrong clients', async () => {
    const store = new MemoryTokenStore()
    const first = await issueTokens(store, grant, t0)
    expect(await rotateRefreshToken(store, first.refresh_token, 'other', t0)).toMatchObject({ ok: false })
    const late = new Date(t0.getTime() + REFRESH_TOKEN_TTL_MS)
    expect(await rotateRefreshToken(store, first.refresh_token, 'c1', late)).toMatchObject({
      ok: false,
      err: { error: 'invalid_grant' },
    })
  })

  it('rejects refresh for a disconnected connection', async () => {
    const store = new MemoryTokenStore()
    const first = await issueTokens(store, grant, t0)
    const r = await rotateRefreshToken(store, first.refresh_token, 'c1', t0, { isConnectionActive: async () => false })
    expect(r).toMatchObject({ ok: false, err: { error: 'invalid_grant' } })
  })

  it('lets only one of two concurrent refreshes win', async () => {
    const store = new MemoryTokenStore()
    const first = await issueTokens(store, grant, t0)
    const [a, b] = await Promise.all([
      rotateRefreshToken(store, first.refresh_token, 'c1', t0),
      rotateRefreshToken(store, first.refresh_token, 'c1', t0),
    ])
    expect([a.ok, b.ok].filter(Boolean)).toHaveLength(1)
  })
})

describe('authorization code redemption', () => {
  const verifier = 'x'.repeat(50)
  function setup(overrides: Partial<{ expiresAt: Date }> = {}) {
    const codes = new MemoryAuthCodeStore()
    codes.rows.push({
      id: 'code1',
      codeHash: sha256Hex('ftac_secret'),
      clientId: 'c1',
      userId: 'u1',
      redirectUri: 'https://claude.ai/api/mcp/auth_callback',
      codeChallenge: s256Challenge(verifier),
      scope: 'frametrain',
      resource: 'https://frame-train.com/api/mcp',
      expiresAt: overrides.expiresAt ?? new Date(t0.getTime() + 600_000),
      usedAt: null,
    })
    return codes
  }
  const input = {
    code: 'ftac_secret',
    clientId: 'c1',
    redirectUri: 'https://claude.ai/api/mcp/auth_callback',
    codeVerifier: verifier,
  }

  it('redeems once with correct PKCE', async () => {
    const codes = setup()
    expect(await redeemAuthCode(codes, input, t0)).toMatchObject({ ok: true, code: { userId: 'u1' } })
    expect(await redeemAuthCode(codes, input, t0)).toMatchObject({ ok: false, err: { error: 'invalid_grant' } })
  })

  it('fails on wrong verifier, client, redirect or resource', async () => {
    expect(await redeemAuthCode(setup(), { ...input, codeVerifier: 'y'.repeat(50) }, t0)).toMatchObject({ ok: false })
    expect(await redeemAuthCode(setup(), { ...input, clientId: 'c2' }, t0)).toMatchObject({ ok: false })
    expect(await redeemAuthCode(setup(), { ...input, redirectUri: 'https://evil.example/cb' }, t0)).toMatchObject({ ok: false })
    expect(await redeemAuthCode(setup(), { ...input, resource: 'https://other.example/mcp' }, t0)).toMatchObject({
      ok: false,
      err: { error: 'invalid_target' },
    })
    // Trailing Slash gilt als gleiche Ressource.
    expect(await redeemAuthCode(setup(), { ...input, resource: 'https://frame-train.com/api/mcp/' }, t0)).toMatchObject({ ok: true })
  })

  it('requires a code_verifier and rejects expired codes', async () => {
    expect(await redeemAuthCode(setup(), { ...input, codeVerifier: undefined }, t0)).toMatchObject({
      ok: false,
      err: { error: 'invalid_request' },
    })
    expect(await redeemAuthCode(setup({ expiresAt: t0 }), input, t0)).toMatchObject({ ok: false })
  })
})
