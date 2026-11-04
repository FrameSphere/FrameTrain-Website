import { describe, expect, it } from 'vitest'
import { isValidCodeChallenge, isValidCodeVerifier, s256Challenge, verifyPkceS256 } from '../crypto'

describe('PKCE S256', () => {
  // RFC 7636 Appendix B
  const verifier = 'dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk'
  const challenge = 'E9Melhoa2OwvFrEMTJguCHaoeK1t8URWbuGJSstw-cM'

  it('computes the RFC 7636 test vector', () => {
    expect(s256Challenge(verifier)).toBe(challenge)
  })

  it('accepts the matching verifier', () => {
    expect(verifyPkceS256(verifier, challenge)).toBe(true)
  })

  it('rejects a wrong verifier', () => {
    expect(verifyPkceS256(verifier.replace('d', 'e'), challenge)).toBe(false)
  })

  it('rejects malformed verifiers (too short, bad chars, non-string)', () => {
    expect(isValidCodeVerifier('short')).toBe(false)
    expect(isValidCodeVerifier('a'.repeat(129))).toBe(false)
    expect(isValidCodeVerifier('a'.repeat(42) + ' ')).toBe(false)
    expect(isValidCodeVerifier(123)).toBe(false)
    expect(verifyPkceS256(undefined, challenge)).toBe(false)
  })

  it('rejects the plain method trick (verifier == challenge)', () => {
    expect(verifyPkceS256(challenge, challenge)).toBe(false)
  })

  it('validates challenge format', () => {
    expect(isValidCodeChallenge(challenge)).toBe(true)
    expect(isValidCodeChallenge(challenge + '=')).toBe(false)
    expect(isValidCodeChallenge('abc')).toBe(false)
  })
})
