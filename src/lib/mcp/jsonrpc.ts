// Zustandsloser JSON-RPC-Dispatcher fuer Streamable HTTP (MCP 2025-06-18+).
// Methoden laut Vertrag: initialize, notifications/initialized, ping,
// tools/list, tools/call. Die eigentliche Arbeit steckt in McpHandlers.

import { LATEST_PROTOCOL_VERSION, MCP_PROTOCOL_VERSIONS, SERVER_INFO } from './config'
import type { CallToolResult, ManifestTool } from './types'

export type JsonRpcId = string | number | null

export interface JsonRpcRequest {
  jsonrpc: '2.0'
  id?: JsonRpcId
  method: string
  params?: Record<string, unknown>
}

export type JsonRpcResponse =
  | { jsonrpc: '2.0'; id: JsonRpcId; result: unknown }
  | { jsonrpc: '2.0'; id: JsonRpcId; error: { code: number; message: string; data?: unknown } }

export const RPC = {
  PARSE_ERROR: -32700,
  INVALID_REQUEST: -32600,
  METHOD_NOT_FOUND: -32601,
  INVALID_PARAMS: -32602,
  INTERNAL_ERROR: -32603,
} as const

export interface McpHandlers {
  listTools(): Promise<Omit<ManifestTool, '_meta'>[]>
  callTool(name: string, args: Record<string, unknown>): Promise<CallToolResult>
}

export const SERVER_INSTRUCTIONS =
  'FrameTrain trains and runs AI models locally on the user\'s computer. Every tool is executed by the ' +
  'FrameTrain desktop app, which must be open with remote access enabled. Long-running actions (training, ' +
  'downloads, tests, exports) return a job_id immediately; the matching *_status tool reports progress. ' +
  'Some actions ask the user for approval inside the app before they run. ' +
  'Datasets can come from Hugging Face (datasets_hf_files, datasets_download_hf), from https URLs including ' +
  'partial reads of large ZIP archives (datasets_import_url), or from local files. datasets_check and ' +
  'datasets_view show what a dataset contains. The Dataset Builder (studio_*) merges several datasets into one ' +
  'project with a common class list (studio_import with source dataset and class_map), shows samples as ' +
  'pictures (studio_view_samples), takes corrections (studio_set_annotation) and exports a training dataset ' +
  '(studio_export). This works for images with boxes, image, audio and video classification, audio with ' +
  'transcripts, and text classification or text pairs.'

function rpcError(id: JsonRpcId, code: number, message: string, data?: unknown): JsonRpcResponse {
  return { jsonrpc: '2.0', id, error: data === undefined ? { code, message } : { code, message, data } }
}

function isRequestShape(msg: unknown): msg is JsonRpcRequest {
  if (!msg || typeof msg !== 'object' || Array.isArray(msg)) return false
  const m = msg as Record<string, unknown>
  if (m.jsonrpc !== '2.0' || typeof m.method !== 'string') return false
  if ('id' in m && m.id !== null && typeof m.id !== 'string' && typeof m.id !== 'number') return false
  if ('params' in m && m.params !== undefined && (typeof m.params !== 'object' || m.params === null || Array.isArray(m.params))) return false
  return true
}

export function negotiateProtocolVersion(requested: unknown): string {
  return typeof requested === 'string' && (MCP_PROTOCOL_VERSIONS as readonly string[]).includes(requested)
    ? requested
    : LATEST_PROTOCOL_VERSION
}

/**
 * Bearbeitet genau eine JSON-RPC-Nachricht. Rueckgabe null = Notification
 * oder Response vom Client (HTTP 202 ohne Body).
 */
export async function dispatchJsonRpc(msg: unknown, handlers: McpHandlers): Promise<JsonRpcResponse | null> {
  if (Array.isArray(msg)) {
    // JSON-RPC-Batching wurde in MCP 2025-06-18 entfernt.
    return rpcError(null, RPC.INVALID_REQUEST, 'Batch requests are not supported')
  }
  if (!isRequestShape(msg)) {
    // Antworten des Clients (result/error ohne method) still annehmen.
    if (msg && typeof msg === 'object' && (msg as Record<string, unknown>).jsonrpc === '2.0' &&
        ('result' in (msg as object) || 'error' in (msg as object))) {
      return null
    }
    const id = msg && typeof msg === 'object' && 'id' in (msg as object) ? ((msg as { id: JsonRpcId }).id ?? null) : null
    return rpcError(typeof id === 'string' || typeof id === 'number' ? id : null, RPC.INVALID_REQUEST, 'Invalid JSON-RPC request')
  }

  const isNotification = !('id' in msg) || msg.id === undefined
  const id: JsonRpcId = isNotification ? null : (msg.id as JsonRpcId)
  const params = msg.params ?? {}

  if (isNotification) {
    // notifications/initialized, notifications/cancelled, … – nichts zu tun.
    return null
  }

  try {
    switch (msg.method) {
      case 'initialize':
        return {
          jsonrpc: '2.0',
          id,
          result: {
            protocolVersion: negotiateProtocolVersion(params.protocolVersion),
            capabilities: { tools: { listChanged: false } },
            serverInfo: SERVER_INFO,
            instructions: SERVER_INSTRUCTIONS,
          },
        }
      case 'ping':
        return { jsonrpc: '2.0', id, result: {} }
      case 'tools/list':
        return { jsonrpc: '2.0', id, result: { tools: await handlers.listTools() } }
      case 'tools/call': {
        const name = params.name
        const args = params.arguments ?? {}
        if (typeof name !== 'string' || !name) return rpcError(id, RPC.INVALID_PARAMS, 'Missing tool name')
        if (typeof args !== 'object' || args === null || Array.isArray(args)) {
          return rpcError(id, RPC.INVALID_PARAMS, 'arguments must be an object')
        }
        return { jsonrpc: '2.0', id, result: await handlers.callTool(name, args as Record<string, unknown>) }
      }
      // Nicht angebotene, aber haeufig abgefragte Listen: leer statt Fehler.
      case 'resources/list':
        return { jsonrpc: '2.0', id, result: { resources: [] } }
      case 'resources/templates/list':
        return { jsonrpc: '2.0', id, result: { resourceTemplates: [] } }
      case 'prompts/list':
        return { jsonrpc: '2.0', id, result: { prompts: [] } }
      default:
        return rpcError(id, RPC.METHOD_NOT_FOUND, `Method not found: ${msg.method}`)
    }
  } catch (err) {
    console.error('MCP dispatch error:', err)
    return rpcError(id, RPC.INTERNAL_ERROR, 'Internal error')
  }
}
