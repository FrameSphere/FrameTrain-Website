import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import {
  MCP_PROTOCOL_VERSIONS,
  OFFLINE_TEXT,
  resourceUrl,
  SUBSCRIPTION_TEXT,
} from '@/lib/mcp/config'
import { bearerToken, corsJson, unauthorized, withCors } from '@/lib/mcp/http'
import { dispatchJsonRpc, RPC, type McpHandlers } from '@/lib/mcp/jsonrpc'
import { normalizeResource, verifyAccessToken } from '@/lib/mcp/tokens'
import { prismaTokenStore } from '@/lib/mcp/tokens-prisma'
import { deviceManifest, isOnline, latestDevice } from '@/lib/mcp/devices'
import { FALLBACK_STATUS_TEXT, FALLBACK_TOOLS } from '@/lib/mcp/fallback'
import { publicTool, textResult } from '@/lib/mcp/types'
import { timeoutResult, waitForJobResult } from '@/lib/mcp/jobs'
import { prismaJobStore } from '@/lib/mcp/jobs-prisma'

// Remote-MCP (Streamable HTTP, zustandslos, JSON-Antworten). Vertrag Abschnitt 6.
export const dynamic = 'force-dynamic'
// tools/call wartet bis 50 s auf die Desktop-App.
export const maxDuration = 60

function methodNotAllowed() {
  const res = withCors(
    NextResponse.json(
      { jsonrpc: '2.0', id: null, error: { code: RPC.INVALID_REQUEST, message: 'Method not allowed. Use POST.' } },
      { status: 405 },
    ),
  )
  res.headers.set('Allow', 'POST, OPTIONS')
  return res
}

export async function GET() {
  // Kein serverseitiger SSE-Stream (zustandslos).
  return methodNotAllowed()
}

export async function DELETE() {
  return methodNotAllowed()
}

export async function OPTIONS() {
  return withCors(new NextResponse(null, { status: 204 }))
}

export async function POST(req: NextRequest) {
  // 1. Auth: Bearer-Access-Token aus unserem OAuth-Server.
  const token = bearerToken(req)
  if (!token) return unauthorized()
  const grant = await verifyAccessToken(prismaTokenStore, token)
  if (!grant) return unauthorized('invalid_token', 'The access token is invalid or expired')
  if (normalizeResource(grant.resource) !== normalizeResource(resourceUrl())) {
    return unauthorized('invalid_token', 'The access token was issued for another resource')
  }

  const connection = await prisma.mcpConnection.findUnique({
    where: { id: grant.connectionId },
    select: { id: true, clientName: true, revokedAt: true, lastUsedAt: true, user: { select: { hasPaid: true } } },
  })
  if (!connection || connection.revokedAt) return unauthorized('invalid_token', 'The connection was disconnected')

  // 2. Protokollversion (Header ab 2025-06-18).
  const pv = req.headers.get('mcp-protocol-version')
  if (pv && !(MCP_PROTOCOL_VERSIONS as readonly string[]).includes(pv)) {
    return corsJson(
      { jsonrpc: '2.0', id: null, error: { code: RPC.INVALID_REQUEST, message: `Unsupported MCP-Protocol-Version: ${pv}` } },
      { status: 400 },
    )
  }

  // 3. Body
  let msg: unknown
  try {
    msg = await req.json()
  } catch {
    return corsJson({ jsonrpc: '2.0', id: null, error: { code: RPC.PARSE_ERROR, message: 'Parse error' } }, { status: 400 })
  }

  // lastUsedAt hoechstens einmal pro Minute schreiben.
  if (!connection.lastUsedAt || Date.now() - connection.lastUsedAt.getTime() > 60_000) {
    prisma.mcpConnection.update({ where: { id: connection.id }, data: { lastUsedAt: new Date() } }).catch(() => {})
  }

  const userId = grant.userId
  const handlers: McpHandlers = {
    async listTools() {
      const device = await latestDevice(userId)
      const tools = deviceManifest(device)
      return (tools && tools.length > 0 ? tools : FALLBACK_TOOLS).map(publicTool)
    },
    async callTool(name, args) {
      if (!connection.user.hasPaid) return textResult(SUBSCRIPTION_TEXT, true)
      const device = await latestDevice(userId)
      if (!device) {
        return name === 'system_status' ? textResult(FALLBACK_STATUS_TEXT) : textResult(OFFLINE_TEXT, true)
      }
      if (!isOnline(device.lastSeenAt)) {
        if (name === 'system_status') return textResult(`${OFFLINE_TEXT}\n\n${FALLBACK_STATUS_TEXT}`, true)
        return textResult(OFFLINE_TEXT, true)
      }
      const job = await prismaJobStore.create(
        { userId, deviceId: device.id, connectionId: connection.id, clientName: connection.clientName, tool: name, args },
        new Date(),
      )
      const outcome = await waitForJobResult(prismaJobStore, job.id, { signal: req.signal })
      return outcome.status === 'done' ? outcome.result : timeoutResult()
    },
  }

  const response = await dispatchJsonRpc(msg, handlers)
  if (!response) return withCors(new NextResponse(null, { status: 202 }))
  return corsJson(response)
}
