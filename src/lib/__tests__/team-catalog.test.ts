import { describe, expect, it } from 'vitest'
import {
  canEdit, canShare, cleanLocalRef, cleanPayload, cleanStorageHint, cleanStoragePath, cleanTitle,
  entryView, shareActivity, type Actor,
} from '../team-catalog'

const anna: Actor = { key: 'seat-anna', name: 'Anna', role: 'member' }
const lea: Actor = { key: 'seat-lea', name: 'Lea', role: 'viewer' }
const owner: Actor = { key: 'owner', name: 'Karol', role: 'admin' }

describe('Rechte', () => {
  it('viewer cannot share, others can', () => {
    expect(canShare(lea)).toBe(false)
    expect(canShare(anna)).toBe(true)
  })
  it('only author or admin edits', () => {
    expect(canEdit(anna, { authorKey: 'seat-anna' })).toBe(true)
    expect(canEdit(anna, { authorKey: 'seat-ben' })).toBe(false)
    expect(canEdit(owner, { authorKey: 'seat-ben' })).toBe(true)
  })
})

describe('Speicherpfad', () => {
  it('keeps relative paths and normalises separators', () => {
    expect(cleanStoragePath('models\\abc\\v4')).toBe('models/abc/v4')
    expect(cleanStoragePath('models//abc/')).toBe('models/abc')
  })
  it('rejects absolute paths and traversal', () => {
    expect(cleanStoragePath('/Volumes/NAS/x')).toBeUndefined()
    expect(cleanStoragePath('C:\\Daten')).toBeUndefined()
    expect(cleanStoragePath('models/../../etc')).toBeUndefined()
  })
  it('empty = no files in team storage', () => {
    expect(cleanStoragePath('')).toBeNull()
    expect(cleanStoragePath(null)).toBeNull()
  })
})

describe('Eingaben', () => {
  it('title, ref, hint', () => {
    expect(cleanTitle('  Defekt v4 ')).toBe('Defekt v4')
    expect(cleanTitle('x'.repeat(121))).toBeNull()
    expect(cleanLocalRef('ver_abc-123')).toBe('ver_abc-123')
    expect(cleanLocalRef('a/b')).toBeNull()
    expect(cleanStorageHint('  \\\\nas\\FrameTrain ')).toBe('\\\\nas\\FrameTrain')
    expect(cleanStorageHint('')).toBeNull()
  })
  it('payload must be a small object', () => {
    expect(cleanPayload({ task: 'detection' })).toEqual({ task: 'detection' })
    expect(cleanPayload([1])).toBeNull()
    expect(cleanPayload({ big: 'x'.repeat(70 * 1024) })).toBeNull()
  })
})

describe('shareActivity', () => {
  it('new or re-shared after removal', () => {
    expect(shareActivity(null, { storagePath: null, auto: true })).toBe('shared')
    expect(shareActivity({ storagePath: null, deletedAt: new Date() }, { storagePath: null, auto: false })).toBe('shared')
  })
  it('files moved to team storage', () => {
    expect(shareActivity({ storagePath: null, deletedAt: null }, { storagePath: 'models/x', auto: false })).toBe('stored')
  })
  it('repeated auto share is silent, manual update is logged', () => {
    expect(shareActivity({ storagePath: null, deletedAt: null }, { storagePath: null, auto: true })).toBeNull()
    expect(shareActivity({ storagePath: 'm', deletedAt: null }, { storagePath: 'm', auto: false })).toBe('updated')
  })
})

describe('entryView', () => {
  const base = {
    id: 'e1', kind: 'version', localRef: 'v1', authorKey: 'seat-anna', authorName: 'Anna', title: 'T',
    payload: { a: 1 }, storagePath: null, sizeBytes: BigInt(1024), auto: false,
    deletedAt: null, createdAt: new Date('2026-11-18T10:00:00Z'), updatedAt: new Date('2026-11-18T10:00:00Z'),
  }
  it('marks own entries and converts sizes', () => {
    const v = entryView(base, anna)
    expect(v).toMatchObject({ mine: true, canEdit: true, sizeBytes: 1024, deleted: false })
    expect(entryView(base, lea)).toMatchObject({ mine: false, canEdit: false })
  })
  it('hides payload of removed entries', () => {
    expect(entryView({ ...base, deletedAt: new Date() }, anna)).toMatchObject({ deleted: true, payload: null })
  })
})
