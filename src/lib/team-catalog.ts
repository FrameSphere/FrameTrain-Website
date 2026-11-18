// Team-Katalog (Business Stufe 2): Regeln ohne Datenbank, damit testbar.
import type { TeamRole } from '@/lib/team'

export const ENTRY_KINDS = ['version', 'dataset'] as const
export type EntryKind = (typeof ENTRY_KINDS)[number]

export const PAYLOAD_MAX_BYTES = 64 * 1024
export const TITLE_MAX = 120
export const ENTRIES_PER_TEAM_MAX = 2000
export const ACTIVITY_LIMIT = 40
export const STORAGE_HINT_MAX = 300

export type ActivityAction = 'shared' | 'updated' | 'stored' | 'removed' | 'fetched'

export interface Actor {
  key: string          // Seat-ID oder "owner"
  name: string
  role: TeamRole
}

export function isEntryKind(v: unknown): v is EntryKind {
  return typeof v === 'string' && (ENTRY_KINDS as readonly string[]).includes(v)
}

/** Nur lesen darf holen, aber nichts teilen oder entfernen. */
export function canShare(actor: Actor): boolean {
  return actor.role !== 'viewer'
}

/** Eintrag aendern/entfernen: Autor selbst oder Admin. */
export function canEdit(actor: Actor, entry: { authorKey: string }): boolean {
  return actor.role === 'admin' || entry.authorKey === actor.key
}

export function cleanTitle(v: unknown): string | null {
  if (typeof v !== 'string') return null
  const s = v.replace(/[\u0000-\u001f]/g, ' ').trim()
  return s && s.length <= TITLE_MAX ? s : null
}

export function cleanLocalRef(v: unknown): string | null {
  return typeof v === 'string' && /^[A-Za-z0-9_.:-]{1,120}$/.test(v) ? v : null
}

/**
 * Pfad im Team-Speicher: relativ, ohne "..", mit "/" getrennt. Absolute Pfade
 * waeren auf jedem Rechner anders (Laufwerksbuchstabe, /Volumes/...).
 * undefined = ungueltig, null = keine Dateien im Team-Speicher.
 */
export function cleanStoragePath(v: unknown): string | null | undefined {
  if (v === null || v === undefined || v === '') return null
  if (typeof v !== 'string' || v.length > 400) return undefined
  const p = v.replace(/\\/g, '/')
  if (p.startsWith('/') || /^[A-Za-z]:/.test(p)) return undefined
  const parts = p.split('/').filter(Boolean)
  if (!parts.length || parts.some((s) => s === '..' || s === '.')) return undefined
  return parts.join('/')
}

/** Nutzdaten: JSON-Objekt bis 64 KB. */
export function cleanPayload(v: unknown): Record<string, unknown> | null {
  if (!v || typeof v !== 'object' || Array.isArray(v)) return null
  const size = Buffer.byteLength(JSON.stringify(v), 'utf8')
  return size <= PAYLOAD_MAX_BYTES ? (v as Record<string, unknown>) : null
}

export function cleanSize(v: unknown): bigint | null {
  if (typeof v !== 'number' || !Number.isFinite(v) || v < 0) return null
  return BigInt(Math.floor(v))
}

export function cleanStorageHint(v: unknown): string | null | undefined {
  if (v === null || v === '') return null
  if (typeof v !== 'string') return undefined
  const s = v.replace(/[\u0000-\u001f]/g, '').trim()
  return s.length <= STORAGE_HINT_MAX ? s || null : undefined
}

/**
 * Welche Aktivitaet ein Teilen ausloest: neu, Kennzahlen aktualisiert oder
 * Dateien in den Team-Speicher gelegt. Wiederholtes Auto-Teilen ohne
 * Aenderung am Speicherort erzeugt keinen Eintrag (Rauschen).
 */
export function shareActivity(
  existing: { storagePath: string | null; deletedAt: Date | null } | null,
  next: { storagePath: string | null; auto: boolean },
): ActivityAction | null {
  if (!existing || existing.deletedAt) return 'shared'
  if (!existing.storagePath && next.storagePath) return 'stored'
  if (next.auto) return null
  return 'updated'
}

export interface EntryView {
  id: string
  kind: EntryKind
  localRef: string
  authorKey: string
  authorName: string
  title: string
  payload: unknown
  storagePath: string | null
  sizeBytes: number | null
  auto: boolean
  deleted: boolean
  mine: boolean
  canEdit: boolean
  createdAt: string
  updatedAt: string
}

export function entryView(
  e: {
    id: string; kind: string; localRef: string; authorKey: string; authorName: string; title: string
    payload: unknown; storagePath: string | null; sizeBytes: bigint | null; auto: boolean
    deletedAt: Date | null; createdAt: Date; updatedAt: Date
  },
  actor: Actor,
): EntryView {
  return {
    id: e.id,
    kind: isEntryKind(e.kind) ? e.kind : 'version',
    localRef: e.localRef,
    authorKey: e.authorKey,
    authorName: e.authorName,
    title: e.title,
    payload: e.deletedAt ? null : e.payload,
    storagePath: e.storagePath,
    sizeBytes: e.sizeBytes === null ? null : Number(e.sizeBytes),
    auto: e.auto,
    deleted: !!e.deletedAt,
    mine: e.authorKey === actor.key,
    canEdit: canEdit(actor, e),
    createdAt: e.createdAt.toISOString(),
    updatedAt: e.updatedAt.toISOString(),
  }
}
