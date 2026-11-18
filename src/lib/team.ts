// FrameTrain Business: Regeln fuer Teams und Plaetze.
//
// Der Inhaber eines Teams meldet sich mit seinem normalen Schluessel an und
// zaehlt als erster Platz. Jede weitere Person hat einen TeamSeat mit eigenem
// Schluessel und eigenem Desktop-Passwort; ein Platz ist immer nur auf einem
// Geraet gleichzeitig aktiv.

export const TEAM_ROLES = ['admin', 'member', 'viewer'] as const
export type TeamRole = (typeof TEAM_ROLES)[number]

export function isTeamRole(v: unknown): v is TeamRole {
  return typeof v === 'string' && (TEAM_ROLES as readonly string[]).includes(v)
}

export const SEAT_PASSWORD_MIN = 8
export const SEAT_NAME_MAX = 80

/** Wie viele Plaetze (ohne Inhaber) noch vergeben werden koennen. */
export function freeSeats(seatLimit: number, usedSeats: number): number {
  return Math.max(0, seatLimit - 1 - usedSeats)
}

/**
 * Zugang fuer alle im Team: bezahlt per Abo/Hand (owner.hasPaid) oder per
 * Rechnung bis accessUntil.
 */
export function teamHasAccess(ownerHasPaid: boolean, accessUntil: Date | null, now = new Date()): boolean {
  if (accessUntil) return accessUntil > now
  return ownerHasPaid
}

export type DeviceDecision =
  | { kind: 'bind' }                         // frei oder dasselbe Geraet: hier binden
  | { kind: 'in_use'; deviceName: string }   // anderes Geraet hat den Platz; Uebernahme noetig
  | { kind: 'needs_device' }                 // App zu alt (keine Geraete-ID)

export function decideDevice(
  seat: { deviceId: string | null; deviceName: string | null },
  deviceId: unknown,
  takeover: boolean,
): DeviceDecision {
  if (typeof deviceId !== 'string' || deviceId.length < 8 || deviceId.length > 100) return { kind: 'needs_device' }
  if (!seat.deviceId || seat.deviceId === deviceId || takeover) return { kind: 'bind' }
  return { kind: 'in_use', deviceName: seat.deviceName || 'einem anderen Geraet' }
}

export function cleanDeviceName(v: unknown): string {
  if (typeof v !== 'string') return 'Unbekanntes Geraet'
  const s = v.replace(/[\u0000-\u001f]/g, '').trim().slice(0, 80)
  return s || 'Unbekanntes Geraet'
}

export function cleanSeatName(v: unknown): string | null {
  if (typeof v !== 'string') return null
  const s = v.replace(/[\u0000-\u001f]/g, '').trim()
  if (!s || s.length > SEAT_NAME_MAX) return null
  return s
}

export function cleanEmail(v: unknown): string | null | undefined {
  if (v === undefined) return undefined
  if (v === null || v === '') return null
  if (typeof v !== 'string') return undefined
  const s = v.trim().toLowerCase()
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s) && s.length <= 200 ? s : undefined
}

/** Was die App ueber das Team erfaehrt (Login und Team-Seite). */
export interface TeamInfo {
  id: string
  name: string
  seatLimit: number
  role: TeamRole
  isOwner: boolean
  seatId: string | null
}

export interface TeamMemberView {
  id: string
  name: string
  role: TeamRole
  isOwner: boolean
  isYou: boolean
  isActive: boolean
  deviceName: string | null
  lastSeenAt: string | null
}

type SeatRow = {
  id: string
  name: string
  role: string
  isActive: boolean
  deviceName: string | null
  lastSeenAt: Date | null
  createdAt: Date
}

/** Mitgliederliste: Inhaber zuerst, dann Plaetze in Reihenfolge der Vergabe. */
export function buildMemberList(
  owner: { id: string; name: string | null; email: string; lastSeenAt: Date | null },
  seats: SeatRow[],
  viewer: { seatId: string | null },
): TeamMemberView[] {
  const ownerRow: TeamMemberView = {
    id: owner.id,
    name: owner.name || owner.email,
    role: 'admin',
    isOwner: true,
    isYou: viewer.seatId === null,
    isActive: true,
    deviceName: null,
    lastSeenAt: owner.lastSeenAt ? owner.lastSeenAt.toISOString() : null,
  }
  const rest = [...seats]
    .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
    .map((s) => ({
      id: s.id,
      name: s.name,
      role: isTeamRole(s.role) ? s.role : 'member',
      isOwner: false,
      isYou: viewer.seatId === s.id,
      isActive: s.isActive,
      deviceName: s.deviceName,
      lastSeenAt: s.lastSeenAt ? s.lastSeenAt.toISOString() : null,
    }))
  return [ownerRow, ...rest]
}
