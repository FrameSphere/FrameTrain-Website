import { describe, expect, it } from 'vitest'
import {
  buildMemberList,
  cleanDeviceName,
  cleanEmail,
  cleanSeatName,
  decideDevice,
  freeSeats,
  isTeamRole,
  teamHasAccess,
} from '../team'

describe('freeSeats', () => {
  it('counts the owner as the first seat', () => {
    expect(freeSeats(5, 0)).toBe(4)
    expect(freeSeats(5, 4)).toBe(0)
    expect(freeSeats(5, 6)).toBe(0)
  })
})

describe('teamHasAccess', () => {
  const now = new Date('2026-11-17T10:00:00Z')
  it('uses accessUntil when set (invoice)', () => {
    expect(teamHasAccess(false, new Date('2026-12-01'), now)).toBe(true)
    expect(teamHasAccess(true, new Date('2026-11-01'), now)).toBe(false)
  })
  it('falls back to owner.hasPaid', () => {
    expect(teamHasAccess(true, null, now)).toBe(true)
    expect(teamHasAccess(false, null, now)).toBe(false)
  })
})

describe('decideDevice', () => {
  const free = { deviceId: null, deviceName: null }
  const busy = { deviceId: 'device-aaaa-1111', deviceName: 'Annas MacBook' }
  it('binds a free seat', () => {
    expect(decideDevice(free, 'device-bbbb-2222', false)).toEqual({ kind: 'bind' })
  })
  it('binds the same device again', () => {
    expect(decideDevice(busy, 'device-aaaa-1111', false)).toEqual({ kind: 'bind' })
  })
  it('reports another device and allows takeover', () => {
    expect(decideDevice(busy, 'device-bbbb-2222', false)).toEqual({ kind: 'in_use', deviceName: 'Annas MacBook' })
    expect(decideDevice(busy, 'device-bbbb-2222', true)).toEqual({ kind: 'bind' })
  })
  it('requires a device id (old app versions)', () => {
    expect(decideDevice(free, undefined, false)).toEqual({ kind: 'needs_device' })
    expect(decideDevice(free, 'x', false)).toEqual({ kind: 'needs_device' })
  })
})

describe('input cleaning', () => {
  it('roles', () => {
    expect(isTeamRole('viewer')).toBe(true)
    expect(isTeamRole('owner')).toBe(false)
  })
  it('names', () => {
    expect(cleanSeatName('  Anna M. ')).toBe('Anna M.')
    expect(cleanSeatName('')).toBeNull()
    expect(cleanSeatName('x'.repeat(81))).toBeNull()
    expect(cleanDeviceName('Mac\u0007Book')).toBe('MacBook')
    expect(cleanDeviceName(42)).toBe('Unbekanntes Geraet')
  })
  it('emails: undefined = invalid/untouched, null = cleared', () => {
    expect(cleanEmail('Anna@Firma.de')).toBe('anna@firma.de')
    expect(cleanEmail('')).toBeNull()
    expect(cleanEmail('kein-at')).toBeUndefined()
  })
})

describe('buildMemberList', () => {
  const owner = { id: 'u1', name: 'Karol', email: 'k@x.de', lastSeenAt: null }
  const seats = [
    { id: 's2', name: 'Ben', role: 'viewer', isActive: false, deviceName: null, lastSeenAt: null, createdAt: new Date('2026-11-02') },
    { id: 's1', name: 'Anna', role: 'member', isActive: true, deviceName: 'Annas Mac', lastSeenAt: new Date('2026-11-17T09:00:00Z'), createdAt: new Date('2026-11-01') },
  ]
  it('puts the owner first and marks the viewer', () => {
    const list = buildMemberList(owner, seats, { seatId: 's1' })
    expect(list.map((m) => m.name)).toEqual(['Karol', 'Anna', 'Ben'])
    expect(list[0]).toMatchObject({ isOwner: true, role: 'admin', isYou: false })
    expect(list[1]).toMatchObject({ isYou: true, deviceName: 'Annas Mac', lastSeenAt: '2026-11-17T09:00:00.000Z' })
    expect(list[2]).toMatchObject({ isActive: false, role: 'viewer' })
  })
  it('owner sees themself as you', () => {
    expect(buildMemberList(owner, [], { seatId: null })[0].isYou).toBe(true)
  })
})
