import { describe, expect, it, vi } from 'vitest'
vi.mock('@/lib/prisma', () => ({ prisma: {} }))
import { fetchCimd, isCimdClientId, redirectUriAllowed, validateRedirectUri, validateRegistration } from '../clients'
import { checkAuthorizeRequest, grantedScope } from '../authorize'
import { sanitizeManifest, publicTool } from '../types'

describe('redirect URIs', () => {
  it('requires https except for loopback', () => {
    expect(validateRedirectUri('https://claude.ai/api/mcp/auth_callback')).toBeTruthy()
    expect(validateRedirectUri('http://localhost:3118/callback')).toBeTruthy()
    expect(validateRedirectUri('http://127.0.0.1/callback')).toBeTruthy()
    expect(validateRedirectUri('http://example.com/cb')).toBeNull()
    expect(validateRedirectUri('javascript:alert(1)')).toBeNull()
    expect(validateRedirectUri('https://a.example/cb#frag')).toBeNull()
  })

  it('matches loopback redirects ignoring the port (Claude Code)', () => {
    const reg = ['http://localhost/callback', 'http://127.0.0.1/callback']
    expect(redirectUriAllowed(reg, 'http://localhost:54321/callback')).toBe(true)
    expect(redirectUriAllowed(reg, 'http://127.0.0.1:9999/callback')).toBe(true)
    expect(redirectUriAllowed(reg, 'http://localhost:54321/other')).toBe(false)
    expect(redirectUriAllowed(['https://chatgpt.com/connector_platform_oauth_redirect'], 'https://chatgpt.com/connector_platform_oauth_redirect')).toBe(true)
    expect(redirectUriAllowed(['https://chatgpt.com/connector_platform_oauth_redirect'], 'https://chatgpt.com/other')).toBe(false)
  })
})

describe('DCR validation', () => {
  it('accepts a Claude-style registration', () => {
    const r = validateRegistration({
      client_name: 'Claude',
      redirect_uris: ['https://claude.ai/api/mcp/auth_callback'],
      grant_types: ['authorization_code', 'refresh_token'],
      response_types: ['code'],
      token_endpoint_auth_method: 'none',
    })
    expect(r).toMatchObject({ ok: true, data: { clientName: 'Claude' } })
  })

  it('accepts Claude\'s published CIMD document (extra jwt-bearer grant)', async () => {
    const id = 'https://claude.ai/oauth/mcp-oauth-client-metadata'
    const doc = {
      client_id: id, client_name: 'Claude', client_uri: 'https://claude.ai',
      redirect_uris: ['https://claude.ai/api/mcp/auth_callback'],
      grant_types: ['authorization_code', 'refresh_token', 'urn:ietf:params:oauth:grant-type:jwt-bearer'],
      response_types: ['code'], token_endpoint_auth_method: 'none',
    }
    const fake = (async () => new Response(JSON.stringify(doc), { status: 200 })) as unknown as typeof fetch
    expect(await fetchCimd(id, fake)).toMatchObject({ clientName: 'Claude', redirectUris: ['https://claude.ai/api/mcp/auth_callback'] })
  })

  it('falls back to the known Claude document when claude.ai answers with a challenge page', async () => {
    const id = 'https://claude.ai/oauth/mcp-oauth-client-metadata'
    const challenge = (async () => new Response('<!DOCTYPE html><title>Just a moment...</title>', { status: 403 })) as unknown as typeof fetch
    expect(await fetchCimd(id, challenge)).toMatchObject({ clientName: 'Claude' })
    const html200 = (async () => new Response('<!DOCTYPE html>', { status: 200 })) as unknown as typeof fetch
    expect(await fetchCimd(id, html200)).toMatchObject({ clientName: 'Claude' })
    const unknown = 'https://evil.example/client'
    expect(await fetchCimd(unknown, challenge)).toBeNull()
  })

  it('accepts ChatGPT\'s CIMD document (prefers private_key_jwt, also lists none)', async () => {
    const id = 'https://chatgpt.com/oauth/client.json'
    const doc = {
      client_id: id, client_uri: 'https://chatgpt.com/', client_name: 'ChatGPT',
      redirect_uris: ['https://chatgpt.com/connector_platform_oauth_redirect'],
      token_endpoint_auth_method: 'private_key_jwt', token_endpoint_auth_methods_supported: ['none', 'private_key_jwt'],
      grant_types: ['authorization_code', 'refresh_token'], response_types: ['code'],
      token_endpoint_auth_signing_alg: 'RS256', jwks_uri: 'https://chatgpt.com/oauth/jwks.json',
    }
    const fake = (async () => new Response(JSON.stringify(doc), { status: 200 })) as unknown as typeof fetch
    expect(await fetchCimd(id, fake)).toMatchObject({ clientName: 'ChatGPT', redirectUris: ['https://chatgpt.com/connector_platform_oauth_redirect'] })
    const confidentialOnly = { ...doc, token_endpoint_auth_methods_supported: ['private_key_jwt'] }
    const fake2 = (async () => new Response(JSON.stringify(confidentialOnly), { status: 200 })) as unknown as typeof fetch
    expect(await fetchCimd(id, fake2)).toBeNull()
  })

  it('rejects missing or insecure redirect URIs and unsupported grants', () => {
    expect(validateRegistration({})).toMatchObject({ ok: false, error: 'invalid_redirect_uri' })
    expect(validateRegistration({ redirect_uris: ['http://evil.example/cb'] })).toMatchObject({ ok: false })
    expect(validateRegistration({ redirect_uris: ['https://a.example/cb'], grant_types: ['client_credentials'] })).toMatchObject({
      ok: false,
      error: 'invalid_client_metadata',
    })
  })
})

describe('CIMD', () => {
  it('detects URL client ids', () => {
    expect(isCimdClientId('https://chatgpt.com/oauth/client.json')).toBe(true)
    expect(isCimdClientId('https://claude.ai/oauth/claude-code-client-metadata')).toBe(true)
    expect(isCimdClientId('ftc_abc')).toBe(false)
    expect(isCimdClientId('https://127.0.0.1/x.json')).toBe(false)
    expect(isCimdClientId('http://chatgpt.com/oauth/client.json')).toBe(false)
  })

  it('accepts a matching document and rejects a mismatched client_id', async () => {
    const url = 'https://chatgpt.com/oauth/client.json'
    const good = vi.fn(async () =>
      new Response(JSON.stringify({ client_id: url, client_name: 'ChatGPT', redirect_uris: ['https://chatgpt.com/connector_platform_oauth_redirect'] })),
    )
    expect(await fetchCimd(url, good as unknown as typeof fetch)).toMatchObject({ clientName: 'ChatGPT' })
    const bad = vi.fn(async () => new Response(JSON.stringify({ client_id: 'https://evil.example/c.json', redirect_uris: ['https://e.example/cb'] })))
    expect(await fetchCimd(url, bad as unknown as typeof fetch)).toBeNull()
  })
})

describe('authorize request', () => {
  const client = {
    clientId: 'c1', clientName: 'Claude', redirectUris: ['https://claude.ai/api/mcp/auth_callback'],
    clientUri: null, logoUri: null, registrationType: 'dcr' as const,
  }
  const base = {
    response_type: 'code', client_id: 'c1', redirect_uri: 'https://claude.ai/api/mcp/auth_callback',
    code_challenge: 'E9Melhoa2OwvFrEMTJguCHaoeK1t8URWbuGJSstw-cM', code_challenge_method: 'S256', state: 'xyz',
  }

  it('never redirects to an unregistered redirect_uri', () => {
    expect(checkAuthorizeRequest({ ...base, redirect_uri: 'https://evil.example/cb' }, client)).toEqual({
      kind: 'fatal', reason: 'invalid_redirect_uri',
    })
    expect(checkAuthorizeRequest(base, null)).toEqual({ kind: 'fatal', reason: 'unknown_client' })
  })

  it('redirects PKCE errors back to the client with state and iss', () => {
    const r = checkAuthorizeRequest({ ...base, code_challenge_method: 'plain' }, client)
    expect(r.kind).toBe('redirect_error')
    if (r.kind !== 'redirect_error') return
    const u = new URL(r.url)
    expect(u.searchParams.get('error')).toBe('invalid_request')
    expect(u.searchParams.get('state')).toBe('xyz')
    expect(u.searchParams.get('iss')).toBe('https://frame-train.com')
  })

  it('rejects foreign resources and accepts ours', () => {
    expect(checkAuthorizeRequest({ ...base, resource: 'https://other.example/mcp' }, client).kind).toBe('redirect_error')
    const ok = checkAuthorizeRequest({ ...base, resource: 'https://frame-train.com/api/mcp' }, client)
    expect(ok).toMatchObject({ kind: 'ok', params: { resource: 'https://frame-train.com/api/mcp', scope: 'frametrain' } })
  })

  it('grants frametrain plus offline_access when requested', () => {
    expect(grantedScope('openid offline_access')).toBe('frametrain offline_access')
    expect(grantedScope(null)).toBe('frametrain')
  })
})

describe('manifest', () => {
  it('drops invalid tools and strips _meta for tools/list', () => {
    const tools = sanitizeManifest([
      { name: 'datasets_list', inputSchema: { type: 'object' }, annotations: { readOnlyHint: true }, _meta: { 'frametrain/approval': 'none' } },
      { name: 'Bad Name', inputSchema: {} },
      { name: 'no_schema' },
      { name: 'datasets_list', inputSchema: {} },
    ])
    expect(tools?.map((t) => t.name)).toEqual(['datasets_list'])
    expect(publicTool(tools![0])).toEqual({
      name: 'datasets_list',
      title: 'Datasets list',
      inputSchema: { type: 'object' },
      annotations: { title: 'Datasets list', readOnlyHint: true, destructiveHint: false, openWorldHint: true },
    })
  })

  it('fills safe annotation defaults and forces destructiveHint for approval=always', () => {
    const bare = publicTool({ name: 'models_rename', inputSchema: { type: 'object' } })
    expect(bare.annotations).toMatchObject({ readOnlyHint: false, destructiveHint: true, openWorldHint: true })
    const del = publicTool({
      name: 'models_delete', title: 'Delete model', inputSchema: { type: 'object' },
      annotations: { readOnlyHint: true, destructiveHint: false, openWorldHint: false },
      _meta: { 'frametrain/approval': 'always' },
    })
    expect(del).toMatchObject({ title: 'Delete model', annotations: { readOnlyHint: false, destructiveHint: true, openWorldHint: false } })
    expect(del).not.toHaveProperty('_meta')
    const ro = publicTool({ name: 'system_info', inputSchema: {}, annotations: { readOnlyHint: true, openWorldHint: false } })
    expect(ro.annotations).toMatchObject({ readOnlyHint: true, destructiveHint: false, openWorldHint: false })
  })
})

import { isAllowedOrigin } from '../origin'

describe('origin validation', () => {
  it('allows server-to-server calls without Origin', () => {
    expect(isAllowedOrigin(null)).toBe(true)
  })
  it('allows Claude, ChatGPT, our site and localhost (Inspector)', () => {
    expect(isAllowedOrigin('https://claude.ai')).toBe(true)
    expect(isAllowedOrigin('https://claude.com')).toBe(true)
    expect(isAllowedOrigin('https://chatgpt.com')).toBe(true)
    expect(isAllowedOrigin('https://frame-train.com')).toBe(true)
    expect(isAllowedOrigin('http://localhost:6274')).toBe(true)
    expect(isAllowedOrigin('http://127.0.0.1:6274')).toBe(true)
  })
  it('rejects foreign origins, look-alikes, http variants and "null"', () => {
    expect(isAllowedOrigin('https://evil.example')).toBe(false)
    expect(isAllowedOrigin('https://claude.ai.evil.example')).toBe(false)
    expect(isAllowedOrigin('http://claude.ai')).toBe(false)
    expect(isAllowedOrigin('null')).toBe(false)
  })
})
