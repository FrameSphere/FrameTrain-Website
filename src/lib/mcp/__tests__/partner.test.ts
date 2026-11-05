import { describe, expect, it } from 'vitest'
import { partnerOf } from '@/components/mcp/PartnerLogos'

describe('partnerOf', () => {
  it('erkennt Claude, ChatGPT und unbekannte Clients', () => {
    expect(partnerOf('https://claude.ai/oauth/mcp-oauth-client-metadata', 'Claude', 'claude.ai')).toBe('claude')
    expect(partnerOf('ftc_123', 'ChatGPT', 'chatgpt.com')).toBe('openai')
    expect(partnerOf('ftc_1', 'OpenAI Connector', null)).toBe('openai')
    expect(partnerOf('ftc_2', 'Cursor', 'localhost')).toBeNull()
  })
})
