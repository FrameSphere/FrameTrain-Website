import { describe, expect, it, vi } from 'vitest'
import { dispatchJsonRpc, negotiateProtocolVersion, RPC, type McpHandlers } from '../jsonrpc'
import { LATEST_PROTOCOL_VERSION } from '../config'

function handlers(overrides: Partial<McpHandlers> = {}): McpHandlers {
  return {
    listTools: vi.fn(async () => [{ name: 'system_info', inputSchema: { type: 'object' } }]),
    callTool: vi.fn(async (name) => ({ content: [{ type: 'text', text: `ran ${name}` }] })),
    ...overrides,
  }
}

describe('dispatchJsonRpc', () => {
  it('answers initialize with negotiated version, tools capability and server info', async () => {
    const res = await dispatchJsonRpc(
      { jsonrpc: '2.0', id: 1, method: 'initialize', params: { protocolVersion: '2025-06-18', capabilities: {} } },
      handlers(),
    )
    expect(res).toMatchObject({
      jsonrpc: '2.0',
      id: 1,
      result: { protocolVersion: '2025-06-18', capabilities: { tools: {} }, serverInfo: { name: 'frametrain' } },
    })
  })

  it('falls back to the latest protocol version for unknown versions', () => {
    expect(negotiateProtocolVersion('1999-01-01')).toBe(LATEST_PROTOCOL_VERSION)
    expect(negotiateProtocolVersion(undefined)).toBe(LATEST_PROTOCOL_VERSION)
  })

  it('returns null for notifications (HTTP 202)', async () => {
    expect(await dispatchJsonRpc({ jsonrpc: '2.0', method: 'notifications/initialized' }, handlers())).toBeNull()
  })

  it('accepts client responses silently', async () => {
    expect(await dispatchJsonRpc({ jsonrpc: '2.0', id: 5, result: {} }, handlers())).toBeNull()
  })

  it('answers ping with an empty result', async () => {
    expect(await dispatchJsonRpc({ jsonrpc: '2.0', id: 'a', method: 'ping' }, handlers())).toEqual({
      jsonrpc: '2.0',
      id: 'a',
      result: {},
    })
  })

  it('lists tools from the handler', async () => {
    const res = await dispatchJsonRpc({ jsonrpc: '2.0', id: 2, method: 'tools/list' }, handlers())
    expect(res).toEqual({ jsonrpc: '2.0', id: 2, result: { tools: [{ name: 'system_info', inputSchema: { type: 'object' } }] } })
  })

  it('calls a tool with arguments', async () => {
    const h = handlers()
    const res = await dispatchJsonRpc(
      { jsonrpc: '2.0', id: 3, method: 'tools/call', params: { name: 'models_list', arguments: { limit: 5 } } },
      h,
    )
    expect(h.callTool).toHaveBeenCalledWith('models_list', { limit: 5 })
    expect(res).toEqual({ jsonrpc: '2.0', id: 3, result: { content: [{ type: 'text', text: 'ran models_list' }] } })
  })

  it('defaults missing arguments to an empty object', async () => {
    const h = handlers()
    await dispatchJsonRpc({ jsonrpc: '2.0', id: 3, method: 'tools/call', params: { name: 'x' } }, h)
    expect(h.callTool).toHaveBeenCalledWith('x', {})
  })

  it('rejects tools/call without a name or with non-object arguments', async () => {
    const a = await dispatchJsonRpc({ jsonrpc: '2.0', id: 4, method: 'tools/call', params: {} }, handlers())
    expect(a).toMatchObject({ error: { code: RPC.INVALID_PARAMS } })
    const b = await dispatchJsonRpc(
      { jsonrpc: '2.0', id: 4, method: 'tools/call', params: { name: 'x', arguments: [1] } },
      handlers(),
    )
    expect(b).toMatchObject({ error: { code: RPC.INVALID_PARAMS } })
  })

  it('returns method not found for unknown methods', async () => {
    const res = await dispatchJsonRpc({ jsonrpc: '2.0', id: 9, method: 'sampling/createMessage' }, handlers())
    expect(res).toMatchObject({ id: 9, error: { code: RPC.METHOD_NOT_FOUND } })
  })

  it('returns empty lists for resources and prompts', async () => {
    expect(await dispatchJsonRpc({ jsonrpc: '2.0', id: 1, method: 'resources/list' }, handlers())).toMatchObject({
      result: { resources: [] },
    })
    expect(await dispatchJsonRpc({ jsonrpc: '2.0', id: 1, method: 'prompts/list' }, handlers())).toMatchObject({
      result: { prompts: [] },
    })
  })

  it('rejects batches and malformed messages', async () => {
    expect(await dispatchJsonRpc([{ jsonrpc: '2.0', id: 1, method: 'ping' }], handlers())).toMatchObject({
      error: { code: RPC.INVALID_REQUEST },
    })
    expect(await dispatchJsonRpc({ id: 1, method: 'ping' }, handlers())).toMatchObject({
      id: 1,
      error: { code: RPC.INVALID_REQUEST },
    })
    expect(await dispatchJsonRpc('hello', handlers())).toMatchObject({ id: null, error: { code: RPC.INVALID_REQUEST } })
  })

  it('maps handler exceptions to internal error', async () => {
    const res = await dispatchJsonRpc(
      { jsonrpc: '2.0', id: 7, method: 'tools/list' },
      handlers({ listTools: async () => { throw new Error('db down') } }),
    )
    expect(res).toMatchObject({ id: 7, error: { code: RPC.INTERNAL_ERROR } })
  })
})
