'use client'
import { useCallback, useEffect, useState } from 'react'
import { useLocale, useTranslations } from 'next-intl'
import { Check, Copy, KeyRound, Loader2, Lock, MonitorSmartphone, Plus, RefreshCw, Trash2, Unlock, Users } from 'lucide-react'

type Role = 'admin' | 'member' | 'viewer'
interface Seat {
  id: string
  name: string
  email: string | null
  role: Role
  isActive: boolean
  apiKey: string
  hasPassword: boolean
  deviceName: string | null
  lastSeenAt: string | null
}
interface TeamView {
  id: string
  name: string
  seatLimit: number
  freeSeats: number
  accessUntil: string | null
  seats: Seat[]
}

/**
 * Business-Team im Dashboard: nur fuer den Inhaber sichtbar (GET /api/team
 * liefert sonst 404). Plaetze vergeben, sperren, Passwort/Geraet zuruecksetzen.
 */
export function TeamSection() {
  const t = useTranslations('BusinessTeam')
  const locale = useLocale()
  const [team, setTeam] = useState<TeamView | null>(null)
  const [busy, setBusy] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [role, setRole] = useState<Role>('member')
  const [copied, setCopied] = useState<string | null>(null)

  const load = useCallback(async () => {
    const res = await fetch('/api/team').catch(() => null)
    if (res?.ok) setTeam((await res.json()).team)
  }, [])
  useEffect(() => { void load() }, [load])

  const call = async (busyKey: string, url: string, init: RequestInit) => {
    setBusy(busyKey)
    setError('')
    try {
      const res = await fetch(url, { ...init, headers: { 'Content-Type': 'application/json' } })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.error || t('genericError'))
      setTeam(data.team)
      return true
    } catch (e) {
      setError(e instanceof Error ? e.message : t('genericError'))
      return false
    } finally {
      setBusy(null)
    }
  }

  const addSeat = async () => {
    if (!name.trim()) { setError(t('nameRequired')); return }
    const ok = await call('add', '/api/team/seats', { method: 'POST', body: JSON.stringify({ name, email: email || null, role }) })
    if (ok) { setName(''); setEmail(''); setRole('member') }
  }
  const patch = (seat: Seat, body: object, key: string) =>
    call(`${seat.id}:${key}`, `/api/team/seats/${seat.id}`, { method: 'PATCH', body: JSON.stringify(body) })
  const remove = (seat: Seat) => {
    if (!confirm(t('confirmDelete', { name: seat.name }))) return
    void call(`${seat.id}:delete`, `/api/team/seats/${seat.id}`, { method: 'DELETE' })
  }
  const copy = (key: string) => {
    void navigator.clipboard.writeText(key)
    setCopied(key)
    setTimeout(() => setCopied(null), 1500)
  }

  if (!team) return null
  const fmt = (iso: string) => new Date(iso).toLocaleDateString(locale === 'de' ? 'de-DE' : 'en-US')
  const used = team.seats.length + 1

  return (
    <div className="bg-surface border border-line rounded-lg p-8 mb-8">
      <div className="flex items-start justify-between gap-4 mb-2">
        <div className="flex items-center">
          <Users className="w-6 h-6 text-indigo-text mr-3" aria-hidden="true" />
          <h2 className="text-2xl font-semibold text-ink">{t('title', { name: team.name })}</h2>
        </div>
        <span className="text-sm text-ink-muted whitespace-nowrap">{t('seatCount', { used, limit: team.seatLimit })}</span>
      </div>
      <p className="text-ink-muted text-sm mb-6">
        {t('intro')}
        {team.accessUntil && <> {t('paidUntil', { date: fmt(team.accessUntil) })}</>}
      </p>

      <ul className="flex flex-col gap-3 mb-6">
        {team.seats.map((seat) => (
          <li key={seat.id} className={`border rounded-sm p-4 ${seat.isActive ? 'border-line' : 'border-danger bg-ghost-fill'}`}>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-ink font-medium">
                  {seat.name}
                  {seat.email && <span className="text-ink-faint font-normal"> · {seat.email}</span>}
                </p>
                <p className="text-sm text-ink-muted mt-0.5 flex flex-wrap gap-x-4">
                  <span>{!seat.isActive ? t('statusLocked') : !seat.hasPassword ? t('statusWaiting') : t('statusReady')}</span>
                  {seat.deviceName && <span className="flex items-center gap-1"><MonitorSmartphone className="w-3.5 h-3.5" aria-hidden="true" />{seat.deviceName}</span>}
                  {seat.lastSeenAt && <span>{t('lastSeen', { date: fmt(seat.lastSeenAt) })}</span>}
                </p>
              </div>
              <select
                value={seat.role}
                onChange={(e) => void patch(seat, { role: e.target.value }, 'role')}
                className="bg-bg border border-line rounded-sm px-2 py-1 text-sm text-ink"
                aria-label={t('roleLabel')}
              >
                <option value="admin">{t('roleAdmin')}</option>
                <option value="member">{t('roleMember')}</option>
                <option value="viewer">{t('roleViewer')}</option>
              </select>
            </div>
            <div className="flex items-center gap-2 mt-3">
              <code className="font-mono text-xs px-2 py-1 rounded border border-line bg-bg text-indigo-text truncate">{seat.apiKey}</code>
              <button onClick={() => copy(seat.apiKey)} className="p-1.5 hover:bg-surface-raised rounded-sm" aria-label={t('copyKey')}>
                {copied === seat.apiKey ? <Check className="w-4 h-4 text-success" /> : <Copy className="w-4 h-4 text-ink-muted" />}
              </button>
            </div>
            <div className="flex flex-wrap gap-2 mt-3 text-sm">
              <SeatButton busy={busy === `${seat.id}:lock`} onClick={() => void patch(seat, { isActive: !seat.isActive }, 'lock')}
                icon={seat.isActive ? Lock : Unlock} label={seat.isActive ? t('lock') : t('unlock')} />
              {seat.hasPassword && (
                <SeatButton busy={busy === `${seat.id}:pw`} onClick={() => void patch(seat, { resetPassword: true }, 'pw')} icon={KeyRound} label={t('resetPassword')} />
              )}
              {seat.deviceName && (
                <SeatButton busy={busy === `${seat.id}:device`} onClick={() => void patch(seat, { releaseDevice: true }, 'device')} icon={MonitorSmartphone} label={t('releaseDevice')} />
              )}
              <SeatButton busy={busy === `${seat.id}:key`} onClick={() => { if (confirm(t('confirmNewKey'))) void patch(seat, { regenerateKey: true }, 'key') }} icon={RefreshCw} label={t('newKey')} />
              <SeatButton busy={busy === `${seat.id}:delete`} onClick={() => remove(seat)} icon={Trash2} label={t('delete')} danger />
            </div>
          </li>
        ))}
      </ul>

      {team.freeSeats > 0 ? (
        <div className="border border-line rounded-sm p-4">
          <p className="text-ink font-medium mb-3">{t('addTitle', { free: team.freeSeats })}</p>
          <div className="grid gap-3 sm:grid-cols-[1fr_1fr_auto_auto]">
            <input value={name} onChange={(e) => { setName(e.target.value); setError('') }} placeholder={t('namePlaceholder')} maxLength={80}
              className="bg-bg border border-line rounded-sm px-3 py-2 text-ink" aria-label={t('nameLabel')} />
            <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder={t('emailPlaceholder')} type="email"
              className="bg-bg border border-line rounded-sm px-3 py-2 text-ink" aria-label={t('emailLabel')} />
            <select value={role} onChange={(e) => setRole(e.target.value as Role)} className="bg-bg border border-line rounded-sm px-2 py-2 text-ink" aria-label={t('roleLabel')}>
              <option value="admin">{t('roleAdmin')}</option>
              <option value="member">{t('roleMember')}</option>
              <option value="viewer">{t('roleViewer')}</option>
            </select>
            <button onClick={() => void addSeat()} disabled={busy === 'add'}
              className="press flex items-center justify-center gap-2 px-4 py-2 bg-indigo-button hover:bg-indigo-hover text-on-indigo rounded-sm disabled:opacity-50">
              {busy === 'add' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
              {t('addButton')}
            </button>
          </div>
          <p className="text-ink-faint text-sm mt-3">{t('addHint')}</p>
        </div>
      ) : (
        <p className="text-ink-muted text-sm">{t('full')}</p>
      )}
      {error && <p className="text-danger text-sm mt-3" role="alert">{error}</p>}
    </div>
  )
}

function SeatButton({ onClick, icon: Icon, label, busy, danger }: {
  onClick: () => void; icon: typeof Lock; label: string; busy: boolean; danger?: boolean
}) {
  return (
    <button onClick={onClick} disabled={busy}
      className={`flex items-center gap-1.5 px-3 py-1.5 border border-line rounded-sm hover:bg-surface-raised disabled:opacity-50 ${danger ? 'text-danger' : 'text-ink-muted'}`}>
      {busy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Icon className="w-3.5 h-3.5" aria-hidden="true" />}
      {label}
    </button>
  )
}
