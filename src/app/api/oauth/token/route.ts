import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { resolveClient } from '@/lib/mcp/clients'
import { corsJson, withCors } from '@/lib/mcp/http'
import { readFormOrJson } from '@/lib/mcp/form'
import { issueTokens, redeemAuthCode, rotateRefreshToken, type OAuthError } from '@/lib/mcp/tokens'
import { prismaAuthCodeStore, prismaTokenStore } from '@/lib/mcp/tokens-prisma'
import { cleanupOAuthData } from '@/lib/mcp/cleanup'

// Token-Endpunkt (RFC 6749 + PKCE): authorization_code und refresh_token.
export const dynamic = 'force-dynamic'

function oauthError(err: OAuthError | { error: string; error_description: string }, status = 400) {
  const res = corsJson(err, { status })
  res.headers.set('Pragma', 'no-cache')
  return res
}

export async function POST(req: NextRequest) {
  const form = await readFormOrJson(req)
  const grantType = form.grant_type
  const now = new Date()

  // Gelegentlich abgelaufene Codes/Tokens/Jobs wegraeumen (kein eigener Cron noetig).
  if (Math.random() < 0.02) cleanupOAuthData().catch(() => {})

  if (grantType === 'authorization_code') {
    const client = await resolveClient(form.client_id)
    if (!client) return oauthError({ error: 'invalid_client', error_description: 'Unknown client_id' }, 401)
    const redeemed = await redeemAuthCode(
      prismaAuthCodeStore,
      {
        code: form.code,
        clientId: form.client_id,
        redirectUri: form.redirect_uri,
        codeVerifier: form.code_verifier,
        resource: form.resource,
      },
      now,
    )
    if (!redeemed.ok) return oauthError(redeemed.err)
    const code = redeemed.code

    const user = await prisma.user.findUnique({ where: { id: code.userId }, select: { hasPaid: true } })
    if (!user?.hasPaid) {
      return oauthError({ error: 'invalid_grant', error_description: 'No active FrameTrain subscription' })
    }
    const connection = await prisma.mcpConnection.findUnique({
      where: { userId_clientId: { userId: code.userId, clientId: code.clientId } },
      select: { id: true, revokedAt: true },
    })
    if (!connection || connection.revokedAt) {
      return oauthError({ error: 'invalid_grant', error_description: 'Connection not approved' })
    }
    const tokens = await issueTokens(
      prismaTokenStore,
      { userId: code.userId, clientId: code.clientId, connectionId: connection.id, scope: code.scope, resource: code.resource },
      now,
    )
    prisma.oAuthClient.update({ where: { clientId: code.clientId }, data: { lastUsedAt: now } }).catch(() => {})
    return corsJson(tokens)
  }

  if (grantType === 'refresh_token') {
    const rotated = await rotateRefreshToken(prismaTokenStore, form.refresh_token, form.client_id, now, {
      isConnectionActive: async (id) => {
        const c = await prisma.mcpConnection.findUnique({ where: { id }, select: { revokedAt: true } })
        return !!c && !c.revokedAt
      },
    })
    if (!rotated.ok) return oauthError(rotated.err)
    return corsJson(rotated.tokens)
  }

  return oauthError({ error: 'unsupported_grant_type', error_description: 'Use authorization_code or refresh_token' })
}

export async function OPTIONS() {
  return withCors(new NextResponse(null, { status: 204 }))
}
