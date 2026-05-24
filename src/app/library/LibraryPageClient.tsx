'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import {
  Search, Filter, Globe, Star, Download, CheckCircle2,
  Upload, X, ChevronDown, ArrowRight, Loader2, Code2,
  FlaskConical, Dumbbell, Sparkles, BookOpen, Copy, Check,
  ExternalLink, TrendingUp, Clock, Tag, User, AlertCircle,
} from 'lucide-react'

// ── Types ─────────────────────────────────────────────────────────────────────

export interface LibraryScript {
  id: string
  name: string
  description: string
  author: string
  model_type: string
  task_type: string
  framework: string
  script_type: string
  script: string
  verified: boolean
  downloads: number
  stars: number
  tags: string[]
  created_at: string
  updated_at: string
}

interface UploadForm {
  name: string
  description: string
  model_type: string
  task_type: string
  framework: string
  script_type: 'train' | 'test'
  tags: string
  script: string
}



const API_BASE = '/api/library'

// ── Helpers ───────────────────────────────────────────────────────────────────

// ── Helper: Author-Name speichern/laden ──────────────────────────────────────

function getOrCreateAuthorName(userEmail?: string): string {
  if (!userEmail) return 'anonymous';
  
  const AUTHOR_STORAGE_KEY = `ft_author_${userEmail}`;
  const stored = localStorage.getItem(AUTHOR_STORAGE_KEY);
  
  if (stored) {
    return stored;
  }
  
  // Beim ersten Upload: Author-Name aus Email generieren
  const generatedName = userEmail
    .split('@')[0]
    .replace(/[^a-z0-9_-]/gi, '_')
    .slice(0, 20);
  
  // Speichern für alle zukünftigen Uploads
  localStorage.setItem(AUTHOR_STORAGE_KEY, generatedName);
  
  return generatedName;
}

function parseDate(iso: string | null | undefined): Date {
  if (!iso) return new Date(0)
  // Konvertiere "2026-05-23 18:36:20.857+00" zu "2026-05-23T18:36:20.857Z"
  const normalized = iso.replace(' ', 'T').replace('+00', 'Z')
  return new Date(normalized)
}

function timeAgo(iso: string | null | undefined) {
  if (!iso) return '–'
  const diff = Date.now() - parseDate(iso).getTime()
  const d = Math.floor(diff / 86400000)
  if (d === 0) return 'heute'
  if (d === 1) return 'gestern'
  if (d < 30) return `vor ${d} Tagen`
  if (d < 365) return `vor ${Math.floor(d / 30)} Monaten`
  return `vor ${Math.floor(d / 365)} Jahren`
}

function frameworkColor(fw: string) {
  const m: Record<string, string> = {
    transformers: 'bg-yellow-500/15 text-yellow-300 border-yellow-500/25',
    pytorch: 'bg-orange-500/15 text-orange-300 border-orange-500/25',
    tensorflow: 'bg-blue-500/15 text-blue-300 border-blue-500/25',
    jax: 'bg-green-500/15 text-green-300 border-green-500/25',
  }
  return m[fw.toLowerCase()] ?? 'bg-white/10 text-gray-300 border-white/15'
}

// ── ScriptCard ─────────────────────────────────────────────────────────────────

function ScriptCard({
  script,
  onView,
}: {
  script: LibraryScript
  onView: (s: LibraryScript) => void
}) {
  return (
    <article
      className="glass-strong rounded-2xl p-6 flex flex-col gap-4 hover:border-white/20 border border-white/8 transition-all duration-300 hover:scale-[1.01] cursor-pointer group"
      onClick={() => onView(script)}
      itemScope
      itemType="https://schema.org/SoftwareSourceCode"
    >
      {/* Header row */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            {/* Train / Test badge */}
            {script.script_type === 'test' ? (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-300 border border-amber-500/25">
                <FlaskConical className="w-2.5 h-2.5" /> Test
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-violet-500/15 text-violet-300 border border-violet-500/25">
                <Dumbbell className="w-2.5 h-2.5" /> Training
              </span>
            )}
            {script.verified && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/25">
                <CheckCircle2 className="w-2.5 h-2.5" /> Verified
              </span>
            )}
          </div>
          <h3
            className="font-bold text-white text-base leading-tight group-hover:text-purple-300 transition-colors"
            itemProp="name"
          >
            {script.name}
          </h3>
          <meta itemProp="programmingLanguage" content="Python" />
          <meta itemProp="runtimePlatform" content={script.framework} />
        </div>
      </div>

      {/* Description */}
      <p
        className="text-gray-400 text-sm leading-relaxed line-clamp-2"
        itemProp="description"
      >
        {script.description}
      </p>

      {/* Meta row */}
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <span className={`px-2 py-0.5 rounded-md border text-[11px] font-medium ${frameworkColor(script.framework)}`}>
          {script.framework}
        </span>
        <span className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-gray-400">
          {script.model_type}
        </span>
        <span className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-gray-400">
          {script.task_type}
        </span>
      </div>

      {/* Tags */}
      {script.tags?.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {script.tags.slice(0, 5).map((t) => (
            <span
              key={t}
              className="text-[10px] px-1.5 py-0.5 rounded bg-purple-500/10 text-purple-400 font-mono border border-purple-500/15"
              itemProp="keywords"
            >
              #{t}
            </span>
          ))}
          {script.tags.length > 5 && (
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/5 text-gray-500 font-mono">
              +{script.tags.length - 5}
            </span>
          )}
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pt-1 border-t border-white/5">
        <div className="flex items-center gap-3 text-xs text-gray-500">
          <span className="flex items-center gap-1">
            <User className="w-3 h-3" />
            <span itemProp="author">{script.author}</span>
          </span>
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {timeAgo(script.updated_at)}
          </span>
        </div>
        <div className="flex items-center gap-3 text-xs text-gray-500">
          <span className="flex items-center gap-1">
            <Download className="w-3 h-3" />
            {script.downloads.toLocaleString('de')}
          </span>
          <span className="flex items-center gap-1">
            <Star className="w-3 h-3 text-yellow-400" />
            {script.stars}
          </span>
        </div>
      </div>
    </article>
  )
}

// ── ScriptDetailModal ──────────────────────────────────────────────────────────

function ScriptDetailModal({
  script,
  onClose,
}: {
  script: LibraryScript
  onClose: () => void
}) {
  const [fullScript, setFullScript] = useState(script.script || '')
  const [loading, setLoading] = useState(!script.script)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (script.script) return
    fetch(`${API_BASE}/scripts/${script.id}`)
      .then((r) => r.json())
      .then((d) => setFullScript(d.script ?? ''))
      .catch(() => setFullScript('# Skript konnte nicht geladen werden'))
      .finally(() => setLoading(false))
  }, [script.id, script.script])

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(fullScript)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {}
  }

  // Close on Escape
  useEffect(() => {
    const fn = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', fn)
    return () => window.removeEventListener('keydown', fn)
  }, [onClose])

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-4xl max-h-[90vh] flex flex-col glass-strong border border-white/15 rounded-2xl overflow-hidden shadow-2xl shadow-black/50">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 p-6 border-b border-white/8">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              {script.script_type === 'test' ? (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-amber-500/15 text-amber-300 border border-amber-500/25">
                  <FlaskConical className="w-3 h-3" /> Test-Skript
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-violet-500/15 text-violet-300 border border-violet-500/25">
                  <Dumbbell className="w-3 h-3" /> Trainings-Skript
                </span>
              )}
              {script.verified && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/25">
                  <CheckCircle2 className="w-3 h-3" /> Verified by FrameTrain Team
                </span>
              )}
            </div>
            <h2 className="text-xl font-bold text-white">{script.name}</h2>
            <p className="text-gray-400 text-sm mt-1">{script.description}</p>
          </div>
          <button
            onClick={onClose}
            className="flex-shrink-0 p-2 rounded-xl hover:bg-white/10 text-gray-400 hover:text-white transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Meta */}
        <div className="flex flex-wrap items-center gap-3 px-6 py-3 border-b border-white/8 bg-white/2">
          <div className="flex items-center gap-1.5 text-xs text-gray-400">
            <User className="w-3.5 h-3.5" />
            <span className="font-medium text-gray-300">{script.author}</span>
          </div>
          <span className={`px-2 py-0.5 rounded-md border text-[11px] font-medium ${frameworkColor(script.framework)}`}>
            {script.framework}
          </span>
          <span className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-gray-400 text-[11px]">
            {script.model_type}
          </span>
          <span className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-gray-400 text-[11px]">
            {script.task_type}
          </span>
          <div className="ml-auto flex items-center gap-3 text-xs text-gray-500">
            <span className="flex items-center gap-1"><Download className="w-3.5 h-3.5" />{script.downloads.toLocaleString('de')}</span>
            <span className="flex items-center gap-1"><Star className="w-3.5 h-3.5 text-yellow-400" />{script.stars}</span>
          </div>
        </div>

        {/* Tags */}
        {script.tags?.length > 0 && (
          <div className="flex flex-wrap gap-1.5 px-6 py-3 border-b border-white/8">
            {script.tags.map((t) => (
              <span key={t} className="text-[10px] px-2 py-0.5 rounded bg-purple-500/10 text-purple-400 font-mono border border-purple-500/15">
                #{t}
              </span>
            ))}
          </div>
        )}

        {/* Code area */}
        <div className="flex-1 overflow-hidden flex flex-col min-h-0">
          <div className="flex items-center justify-between px-6 py-2 bg-black/30 border-b border-white/8">
            <span className="text-xs text-gray-500 font-mono">script.py</span>
            <button
              onClick={handleCopy}
              disabled={loading || !fullScript}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-gray-400 hover:text-white text-xs font-medium transition-all disabled:opacity-40"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Kopiert!' : 'Kopieren'}
            </button>
          </div>
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center h-40">
                <Loader2 className="w-6 h-6 animate-spin text-purple-400" />
              </div>
            ) : (
              <pre className="text-xs text-gray-300 font-mono p-6 leading-relaxed whitespace-pre-wrap break-words">
                {fullScript || '# Kein Skript-Inhalt verfügbar'}
              </pre>
            )}
          </div>
        </div>

        {/* Footer – Download-Button */}
        <div className="flex items-center justify-between gap-4 px-6 py-4 border-t border-white/8 bg-white/2">
          <p className="text-xs text-gray-500">
            Zuletzt aktualisiert: {timeAgo(script.updated_at)} · Lizenz: MIT
          </p>
          <div className="flex gap-2">
            <button onClick={onClose} className="px-4 py-2 rounded-xl glass hover:bg-white/10 text-gray-400 text-sm font-medium transition-all">
              Schließen
            </button>
            <a
              href={`data:text/plain;charset=utf-8,${encodeURIComponent(fullScript)}`}
              download={`${script.name.replace(/\s+/g, '_').toLowerCase()}.py`}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white text-sm font-bold hover:from-purple-500 hover:to-pink-500 transition-all"
            >
              <Download className="w-4 h-4" /> Download
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── UploadModal ────────────────────────────────────────────────────────────────

function UploadModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const { user } = useAuth()
  const [form, setForm] = useState<UploadForm>({
    name: '', description: '', model_type: '', task_type: '',
    framework: 'transformers', script_type: 'train', tags: '', script: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const set = (k: keyof UploadForm) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm((p) => ({ ...p, [k]: e.target.value }))

  const handleSubmit = async () => {
    if (!form.name.trim() || !form.script.trim()) {
      setError('Name und Skript sind Pflichtfelder.')
      return
    }
    
    const authorName = getOrCreateAuthorName(user?.email)
    
    // Duplikat-Check für Community-Namen
    try {
      const res = await fetch(`${API_BASE}/authors/${encodeURIComponent(authorName)}/exists`)
      const data = await res.json()
      if (data.exists) {
        setError(`Der Community-Name "${authorName}" ist bereits vergeben.`)
        return
      }
    } catch { /* ignore - fallback ohne Check */ }
    
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`${API_BASE}/scripts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          author: authorName,
          tags: form.tags.split(',').map((t) => t.trim()).filter(Boolean),
        }),
      })
      if (!res.ok) throw new Error((await res.json()).error ?? 'Upload fehlgeschlagen')
      onSuccess()
      onClose()
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" onClick={(e) => { if (e.target === e.currentTarget) onClose() }}>
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-2xl glass-strong border border-white/15 rounded-2xl overflow-hidden shadow-2xl shadow-black/50">
        <div className="flex items-center justify-between p-6 border-b border-white/8">
          <div>
            <h2 className="text-lg font-bold text-white">Skript hochladen</h2>
            <p className="text-gray-400 text-sm">Teile dein ML-Skript mit der Community</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-white/10 text-gray-400 hover:text-white transition-all">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
          {error && (
            <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/25 text-red-300 text-sm">
              <AlertCircle className="w-4 h-4 flex-shrink-0" /> {error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-xs font-medium text-gray-400 mb-1.5">Name *</label>
              <input
                value={form.name} onChange={set('name')} placeholder="z.B. LoRA Fine-Tuning für BERT"
                className="w-full px-4 py-2.5 rounded-xl glass border border-white/10 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-purple-500/50"
              />
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-medium text-gray-400 mb-1.5">Beschreibung</label>
              <textarea
                value={form.description} onChange={set('description')} rows={2}
                placeholder="Kurze Beschreibung was das Skript macht..."
                className="w-full px-4 py-2.5 rounded-xl glass border border-white/10 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-purple-500/50 resize-none"
              />
            </div>

            {/* Typ */}
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">Typ *</label>
              <select value={form.script_type} onChange={set('script_type')}
                className="w-full px-4 py-2.5 rounded-xl glass border border-white/10 text-white text-sm focus:outline-none focus:border-purple-500/50">
                <option value="train">🏋️ Training</option>
                <option value="test">🧪 Test / Evaluation</option>
              </select>
            </div>

            {/* Framework */}
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">Framework</label>
              <select value={form.framework} onChange={set('framework')}
                className="w-full px-4 py-2.5 rounded-xl glass border border-white/10 text-white text-sm focus:outline-none focus:border-purple-500/50">
                <option value="transformers">transformers</option>
                <option value="pytorch">pytorch</option>
                <option value="tensorflow">tensorflow</option>
                <option value="jax">jax</option>
                <option value="other">other</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">Modell-Typ</label>
              <input value={form.model_type} onChange={set('model_type')} placeholder="LLM, Classifier, Vision..."
                className="w-full px-4 py-2.5 rounded-xl glass border border-white/10 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-purple-500/50" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">Task-Typ</label>
              <input value={form.task_type} onChange={set('task_type')} placeholder="Fine-Tuning, Evaluation..."
                className="w-full px-4 py-2.5 rounded-xl glass border border-white/10 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-purple-500/50" />
            </div>

            <div className="col-span-2">
              <label className="block text-xs font-medium text-gray-400 mb-1.5">Tags (kommagetrennt)</label>
              <input value={form.tags} onChange={set('tags')} placeholder="lora, bert, classification"
                className="w-full px-4 py-2.5 rounded-xl glass border border-white/10 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-purple-500/50" />
            </div>

            <div className="col-span-2">
              <label className="block text-xs font-medium text-gray-400 mb-1.5">Skript (Python) *</label>
              <textarea value={form.script} onChange={set('script')} rows={10}
                placeholder="#!/usr/bin/env python3&#10;# Dein Skript hier..."
                className="w-full px-4 py-2.5 rounded-xl glass border border-white/10 text-white text-xs font-mono placeholder-gray-600 focus:outline-none focus:border-purple-500/50 resize-none"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 px-6 py-4 border-t border-white/8">
          <button onClick={onClose} className="px-4 py-2 rounded-xl glass hover:bg-white/10 text-gray-400 text-sm font-medium transition-all">
            Abbrechen
          </button>
          <button
            onClick={handleSubmit} disabled={loading}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white text-sm font-bold hover:from-purple-500 hover:to-pink-500 transition-all disabled:opacity-60"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
            Hochladen
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Main Client Component ──────────────────────────────────────────────────────

export function LibraryPageClient({ initialScripts }: { initialScripts: LibraryScript[] }) {
  const { isAuthenticated } = useAuth()

  const [scripts, setScripts] = useState<LibraryScript[]>(initialScripts)
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState<'all' | 'train' | 'test'>('all')
  const [frameworkFilter, setFrameworkFilter] = useState('')
  const [sortBy, setSortBy] = useState<'downloads' | 'stars' | 'newest'>('downloads')
  const [verifiedOnly, setVerifiedOnly] = useState(false)
  const [selectedScript, setSelectedScript] = useState<LibraryScript | null>(null)
  const [showUpload, setShowUpload] = useState(false)

  // Skripte vom API laden
  const fetchScripts = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (search) params.set('search', search)
      if (typeFilter !== 'all') params.set('script_type', typeFilter)
      if (frameworkFilter) params.set('framework', frameworkFilter)
      if (verifiedOnly) params.set('verified_only', 'true')
      params.set('limit', '60')

      const res = await fetch(`${API_BASE}/scripts?${params}`, { signal: AbortSignal.timeout(6000) })
      if (!res.ok) throw new Error()
      const data = await res.json()
      const list: LibraryScript[] = Array.isArray(data) ? data : (data.scripts ?? [])
      setScripts(list)
    } catch {
      // Bei Fehler leeres Array zeigen
      setScripts([])
    } finally {
      setLoading(false)
    }
  }, [search, typeFilter, frameworkFilter, verifiedOnly])

  // Debounce bei Suche
  const debounceRef = useRef<ReturnType<typeof setTimeout>>()
  useEffect(() => {
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(fetchScripts, 400)
    return () => clearTimeout(debounceRef.current)
  }, [fetchScripts])

  // Sortierung client-seitig
  const sorted = [...scripts].sort((a, b) => {
    if (sortBy === 'downloads') return b.downloads - a.downloads
    if (sortBy === 'stars') return b.stars - a.stars
    return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
  })

  const totalTrain = scripts.filter((s) => s.script_type === 'train').length
  const totalTest  = scripts.filter((s) => s.script_type === 'test').length

  return (
    <>
      {/* Hero */}
      <section className="pt-16 pb-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-12">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-purple-500/25 text-purple-300 text-sm font-medium mb-6">
              <Globe className="w-4 h-4" />
              Community Open Library
            </div>

            <h1 className="text-5xl md:text-6xl font-black mb-5 leading-tight">
              <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
                ML-Skripte
              </span>{' '}
              <span className="text-white">der Community</span>
            </h1>

            <p className="text-xl text-gray-400 leading-relaxed mb-8">
              Entdecke kuratierte{' '}
              <strong className="text-white">Trainings- und Test-Skripte</strong> für HuggingFace,
              PyTorch, LoRA & mehr. Direkt in FrameTrain ladbar – in Sekunden.
            </p>

            {/* Stats pills */}
            <div className="flex items-center justify-center gap-4 flex-wrap mb-8">
              <div className="glass px-4 py-2 rounded-full text-sm text-gray-300 flex items-center gap-2">
                <Dumbbell className="w-4 h-4 text-violet-400" />
                <span>{totalTrain} Trainings-Skripte</span>
              </div>
              <div className="glass px-4 py-2 rounded-full text-sm text-gray-300 flex items-center gap-2">
                <FlaskConical className="w-4 h-4 text-amber-400" />
                <span>{totalTest} Test-Skripte</span>
              </div>
              <div className="glass px-4 py-2 rounded-full text-sm text-gray-300 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>{scripts.filter((s) => s.verified).length} verifiziert</span>
              </div>
            </div>

            {/* CTA Upload */}
            {isAuthenticated ? (
              <button
                onClick={() => setShowUpload(true)}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold hover:from-purple-500 hover:to-pink-500 transition-all shadow-lg shadow-purple-500/30"
              >
                <Upload className="w-4 h-4" /> Skript hochladen
              </button>
            ) : (
              <Link
                href="/login"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl glass border border-white/15 text-gray-300 hover:border-white/30 hover:text-white font-semibold transition-all"
              >
                <Upload className="w-4 h-4" /> Anmelden um hochzuladen
                <ArrowRight className="w-4 h-4" />
              </Link>
            )}
          </div>

          {/* ── Search & Filter bar ── */}
          <div className="glass-strong rounded-2xl p-4 border border-white/8 flex flex-col md:flex-row gap-3">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Skripte suchen (Name, Beschreibung, Tags)..."
                className="w-full pl-9 pr-4 py-2.5 rounded-xl glass border border-white/10 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-purple-500/50"
              />
            </div>

            {/* Type filter */}
            <div className="flex rounded-xl overflow-hidden border border-white/10 flex-shrink-0">
              {(['all', 'train', 'test'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setTypeFilter(t)}
                  className={`px-4 py-2.5 text-sm font-medium transition-all ${
                    typeFilter === t
                      ? 'bg-purple-500/20 text-purple-300'
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {t === 'all' ? 'Alle' : t === 'train' ? '🏋️ Training' : '🧪 Test'}
                </button>
              ))}
            </div>

            {/* Framework filter */}
            <select
              value={frameworkFilter}
              onChange={(e) => setFrameworkFilter(e.target.value)}
              className="px-4 py-2.5 rounded-xl glass border border-white/10 text-gray-300 text-sm focus:outline-none focus:border-purple-500/50 flex-shrink-0"
            >
              <option value="">Alle Frameworks</option>
              <option value="transformers">transformers</option>
              <option value="pytorch">pytorch</option>
              <option value="tensorflow">tensorflow</option>
              <option value="jax">jax</option>
            </select>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-4 py-2.5 rounded-xl glass border border-white/10 text-gray-300 text-sm focus:outline-none focus:border-purple-500/50 flex-shrink-0"
            >
              <option value="downloads">↓ Downloads</option>
              <option value="stars">⭐ Stars</option>
              <option value="newest">🕐 Neueste</option>
            </select>

            {/* Verified toggle */}
            <button
              onClick={() => setVerifiedOnly((v) => !v)}
              className={`px-4 py-2.5 rounded-xl border text-sm font-medium transition-all flex items-center gap-2 flex-shrink-0 ${
                verifiedOnly
                  ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/25'
                  : 'glass border-white/10 text-gray-400 hover:text-white'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              Verified
            </button>
          </div>
        </div>
      </section>

      {/* ── Script Grid ── */}
      <section className="pb-20 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Result count */}
          <div className="flex items-center justify-between mb-6">
            <p className="text-sm text-gray-500">
              {loading ? (
                <span className="flex items-center gap-2"><Loader2 className="w-3.5 h-3.5 animate-spin" /> Laden...</span>
              ) : (
                <span>{sorted.length} Skript{sorted.length !== 1 ? 'e' : ''} gefunden</span>
              )}
            </p>
          </div>

          {sorted.length === 0 && !loading ? (
            <div className="text-center py-24 glass-strong rounded-2xl border border-white/8">
              <Code2 className="w-12 h-12 text-gray-600 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-white mb-2">Keine Skripte gefunden</h3>
              <p className="text-gray-500 text-sm mb-6">Versuche andere Suchbegriffe oder Filter</p>
              {isAuthenticated && (
                <button
                  onClick={() => setShowUpload(true)}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white text-sm font-bold"
                >
                  <Upload className="w-4 h-4" /> Erstes Skript hochladen
                </button>
              )}
            </div>
          ) : (
            <div
              className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5"
              itemScope
              itemType="https://schema.org/ItemList"
            >
              {sorted.map((s, i) => (
                <div key={s.id} itemProp="itemListElement" itemScope itemType="https://schema.org/ListItem">
                  <meta itemProp="position" content={String(i + 1)} />
                  <ScriptCard script={s} onView={setSelectedScript} />
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── SEO Rich Content Section ── */}
      <section className="py-20 px-4 border-t border-white/5">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-4xl font-black mb-4 bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
              Was ist die FrameTrain Open Library?
            </h2>
            <p className="text-gray-400 text-lg max-w-3xl mx-auto">
              Eine kostenlose, von der Community betriebene Sammlung von ML-Skripten – für jeden, der lokal
              KI-Modelle trainieren oder testen möchte.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-16">
            <div className="glass-strong rounded-2xl p-7">
              <div className="w-12 h-12 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl flex items-center justify-center mb-5">
                <Dumbbell className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-bold text-white mb-3">Trainings-Skripte</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                Vollständige Python-Skripte für das Fine-Tuning von HuggingFace-Modellen. Von LoRA und QLoRA
                für LLMs bis hin zu BERT-Klassifikatoren und Vision Transformern – alle Skripte laufen
                direkt in FrameTrain auf deiner lokalen GPU.
              </p>
            </div>
            <div className="glass-strong rounded-2xl p-7">
              <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center mb-5">
                <FlaskConical className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-bold text-white mb-3">Test & Evaluation Skripte</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                Evaluierungs- und Benchmark-Skripte, um trainierte Modelle zu testen. Misst Accuracy,
                F1-Score, Latenz und Durchsatz. Kompatibel mit allen Modellformaten die FrameTrain
                unterstützt: PyTorch, SafeTensors und GGUF.
              </p>
            </div>
            <div className="glass-strong rounded-2xl p-7">
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl flex items-center justify-center mb-5">
                <CheckCircle2 className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-bold text-white mb-3">Verified Scripts</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                Das FrameTrain-Team prüft und verifiziert ausgewählte Skripte auf Korrektheit,
                Sicherheit und Best Practices. Verifizierte Skripte sind mit einem grünen Badge
                gekennzeichnet und werden priorisiert angezeigt.
              </p>
            </div>
          </div>

          {/* Supported frameworks */}
          <div className="glass-strong rounded-2xl p-8 mb-10">
            <h3 className="text-xl font-bold text-white mb-2">Unterstützte Frameworks & Technologien</h3>
            <p className="text-gray-400 text-sm mb-6">
              Alle Skripte in der Open Library basieren auf gängigen Open-Source-ML-Frameworks und laufen
              nativ in FrameTrain auf Windows, macOS (Intel & Apple Silicon) und Linux.
            </p>
            <div className="flex flex-wrap gap-3">
              {[
                { name: 'HuggingFace Transformers', color: 'from-yellow-500/20 to-orange-500/20 border-yellow-500/25 text-yellow-300' },
                { name: 'PyTorch', color: 'from-orange-500/20 to-red-500/20 border-orange-500/25 text-orange-300' },
                { name: 'PEFT / LoRA', color: 'from-purple-500/20 to-violet-500/20 border-purple-500/25 text-purple-300' },
                { name: 'bitsandbytes (4-bit)', color: 'from-blue-500/20 to-cyan-500/20 border-blue-500/25 text-blue-300' },
                { name: 'Datasets', color: 'from-green-500/20 to-emerald-500/20 border-green-500/25 text-green-300' },
                { name: 'TRL', color: 'from-pink-500/20 to-rose-500/20 border-pink-500/25 text-pink-300' },
                { name: 'Accelerate', color: 'from-indigo-500/20 to-blue-500/20 border-indigo-500/25 text-indigo-300' },
                { name: 'scikit-learn', color: 'from-cyan-500/20 to-teal-500/20 border-cyan-500/25 text-cyan-300' },
              ].map((fw) => (
                <span key={fw.name} className={`px-3 py-1.5 rounded-lg bg-gradient-to-r border text-sm font-medium ${fw.color}`}>
                  {fw.name}
                </span>
              ))}
            </div>
          </div>

          {/* How to use */}
          <div className="glass-strong rounded-2xl p-8 mb-10">
            <h3 className="text-xl font-bold text-white mb-6">So verwendest du die Open Library</h3>
            <div className="grid md:grid-cols-3 gap-6">
              {[
                {
                  step: '01',
                  icon: <Search className="w-5 h-5" />,
                  title: 'Skript suchen & filtern',
                  desc: 'Nutze die Suche und Filter nach Typ (Training / Test), Framework und Verifikationsstatus, um das passende Skript zu finden.',
                },
                {
                  step: '02',
                  icon: <BookOpen className="w-5 h-5" />,
                  title: 'Vorschau & Prüfung',
                  desc: 'Öffne die Detailansicht, lies das vollständige Skript, sieh dir Tags und Metadaten an – bevor du es herunterlädst.',
                },
                {
                  step: '03',
                  icon: <Sparkles className="w-5 h-5" />,
                  title: 'In FrameTrain laden',
                  desc: 'Klicke in der Desktop-App auf „Bibliothek Open Library" → das Skript wird direkt in den Dev Train oder Dev Test Editor geladen.',
                },
              ].map((item) => (
                <div key={item.step} className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center text-white">
                      {item.icon}
                    </div>
                  </div>
                  <div>
                    <span className="text-xs font-mono text-gray-600">{item.step}</span>
                    <h4 className="font-semibold text-white text-sm mb-1">{item.title}</h4>
                    <p className="text-gray-400 text-xs leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* CTA Download App */}
          <div className="glass-strong rounded-2xl p-8 border border-purple-500/15 bg-gradient-to-br from-purple-600/5 to-transparent text-center">
            <h3 className="text-2xl font-black text-white mb-3">
              Skripte direkt in FrameTrain nutzen
            </h3>
            <p className="text-gray-400 text-base mb-6 max-w-xl mx-auto">
              In der Desktop-App öffnest du mit einem Klick die Open Library – und lädst jedes Skript
              direkt in deinen Editor. Kein Copy-Paste, kein Datei-Chaos.
            </p>
            <div className="flex flex-wrap gap-3 justify-center">
              <Link
                href="/download"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold hover:from-purple-500 hover:to-pink-500 transition-all shadow-lg shadow-purple-500/30"
              >
                <Sparkles className="w-4 h-4" /> FrameTrain herunterladen
              </Link>
              <Link
                href="/docs"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl glass border border-white/15 text-gray-300 hover:border-white/30 hover:text-white font-semibold transition-all"
              >
                <BookOpen className="w-4 h-4" /> Zur Dokumentation
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Modals */}
      {selectedScript && (
        <ScriptDetailModal script={selectedScript} onClose={() => setSelectedScript(null)} />
      )}
      {showUpload && (
        <UploadModal
          onClose={() => setShowUpload(false)}
          onSuccess={() => { fetchScripts(); }}
        />
      )}
    </>
  )
}
