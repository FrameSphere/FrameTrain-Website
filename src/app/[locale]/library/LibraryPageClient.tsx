'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { Link } from '@/i18n/navigation'
import { useTranslations } from 'next-intl'
import { useAuth } from '@/contexts/AuthContext'
import {
  Search, Globe, Star, Download, CheckCircle2,
  Upload, X, ArrowRight, Loader2, Code2,
  FlaskConical, Dumbbell, Sparkles, BookOpen, Copy, Check,
  Clock, User, AlertCircle,
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

type TimeAgoMessages = {
  today: string; yesterday: string; daysAgo: string; monthsAgo: string; yearsAgo: string; none: string
}

const API_BASE = '/api/library'

// ── Helper: Author-Name speichern/laden ──────────────────────────────────

const AUTHOR_KEY = (userId: string) => `ft_author_${userId}`

function saveAuthorName(userId: string, name: string): void {
  if (typeof window === 'undefined') return
  let val = name.trim().slice(0, 40).replace(/[^a-z0-9_\-.]/gi, '')
  if (val.startsWith('@')) val = val.slice(1)
  localStorage.setItem(AUTHOR_KEY(userId), val)
}

function parseDate(iso: string | null | undefined): Date {
  if (!iso) return new Date(0)
  const normalized = iso.replace(' ', 'T').replace('+00', 'Z')
  return new Date(normalized)
}

function timeAgo(iso: string | null | undefined, m: TimeAgoMessages) {
  if (!iso) return m.none
  const diff = Date.now() - parseDate(iso).getTime()
  const d = Math.floor(diff / 86400000)
  if (d === 0) return m.today
  if (d === 1) return m.yesterday
  if (d < 30) return m.daysAgo.replace('{d}', String(d))
  if (d < 365) return m.monthsAgo.replace('{m}', String(Math.floor(d / 30)))
  return m.yearsAgo.replace('{y}', String(Math.floor(d / 365)))
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
  t,
  timeAgoMessages,
}: {
  script: LibraryScript
  onView: (s: LibraryScript) => void
  t: ReturnType<typeof useTranslations>
  timeAgoMessages: TimeAgoMessages
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
                <FlaskConical className="w-2.5 h-2.5" /> {t('badgeTest')}
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-violet-500/15 text-violet-300 border border-violet-500/25">
                <Dumbbell className="w-2.5 h-2.5" /> {t('badgeTraining')}
              </span>
            )}
            {script.verified && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/25">
                <CheckCircle2 className="w-2.5 h-2.5" /> {t('badgeVerified')}
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
          {script.tags.slice(0, 5).map((tag) => (
            <span
              key={tag}
              className="text-[10px] px-1.5 py-0.5 rounded bg-purple-500/10 text-purple-400 font-mono border border-purple-500/15"
              itemProp="keywords"
            >
              #{tag}
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
            {timeAgo(script.created_at, timeAgoMessages)}
          </span>
        </div>
        <div className="flex items-center gap-3 text-xs text-gray-500">
          <span className="flex items-center gap-1">
            <Download className="w-3 h-3" />
            {script.downloads.toLocaleString()}
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
  t,
  timeAgoMessages,
}: {
  script: LibraryScript
  onClose: () => void
  t: ReturnType<typeof useTranslations>
  timeAgoMessages: TimeAgoMessages
}) {
  const [fullScript, setFullScript] = useState(script.script || '')
  const [loading, setLoading] = useState(!script.script)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (script.script) return
    fetch(`${API_BASE}/scripts/${script.id}`)
      .then((r) => r.json())
      .then((d) => setFullScript(d.script ?? ''))
      .catch(() => setFullScript(`# ${t('scriptLoadError')}`))
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
                  <FlaskConical className="w-3 h-3" /> {t('modalTestScript')}
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-violet-500/15 text-violet-300 border border-violet-500/25">
                  <Dumbbell className="w-3 h-3" /> {t('modalTrainingScript')}
                </span>
              )}
              {script.verified && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/25">
                  <CheckCircle2 className="w-3 h-3" /> {t('modalVerifiedBy')}
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
            <span className="flex items-center gap-1"><Download className="w-3.5 h-3.5" />{script.downloads.toLocaleString()}</span>
            <span className="flex items-center gap-1"><Star className="w-3.5 h-3.5 text-yellow-400" />{script.stars}</span>
          </div>
        </div>

        {/* Tags */}
        {script.tags?.length > 0 && (
          <div className="flex flex-wrap gap-1.5 px-6 py-3 border-b border-white/8">
            {script.tags.map((tag) => (
              <span key={tag} className="text-[10px] px-2 py-0.5 rounded bg-purple-500/10 text-purple-400 font-mono border border-purple-500/15">
                #{tag}
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
              {copied ? t('copiedButton') : t('copyButton')}
            </button>
          </div>
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center h-40">
                <Loader2 className="w-6 h-6 animate-spin text-purple-400" />
              </div>
            ) : (
              <pre className="text-xs text-gray-300 font-mono p-6 leading-relaxed whitespace-pre-wrap break-words">
                {fullScript || `# ${t('noScriptContent')}`}
              </pre>
            )}
          </div>
        </div>

        {/* Footer – Download-Button */}
        <div className="flex items-center justify-between gap-4 px-6 py-4 border-t border-white/8 bg-white/2">
          <p className="text-xs text-gray-500">
            {t('createdLabel')}: {timeAgo(script.created_at, timeAgoMessages)} · {t('licenseLabel')}
          </p>
          <div className="flex gap-2">
            <button onClick={onClose} className="px-4 py-2 min-h-[44px] rounded-xl glass hover:bg-white/10 text-gray-400 text-sm font-medium transition-all">
              {t('closeButton')}
            </button>
            <a
              href={`data:text/plain;charset=utf-8,${encodeURIComponent(fullScript)}`}
              download={`${script.name.replace(/\s+/g, '_').toLowerCase()}.py`}
              className="inline-flex items-center gap-2 px-4 py-2 min-h-[44px] rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white text-sm font-bold hover:from-purple-500 hover:to-pink-500 transition-all"
            >
              <Download className="w-4 h-4" /> {t('downloadButton')}
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── DuplicateNameError Modal ──────────────────────────────────────────────────

function DuplicateNameErrorModal({ name, onClose, t }: { name: string; onClose: () => void; t: ReturnType<typeof useTranslations> }) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="glass-strong rounded-2xl border border-red-500/20 max-w-sm w-full p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-red-500/20 border border-red-500/30 flex items-center justify-center">
            <AlertCircle className="w-6 h-6 text-red-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">{t('duplicateNameTitle')}</h3>
            <p className="text-sm text-gray-400 mt-1">{t('duplicateNameSubtitle')}</p>
          </div>
        </div>

        <div className="bg-red-500/8 border border-red-500/20 rounded-lg p-3">
          <p className="text-sm text-red-200">
            {t.rich('duplicateNameText', { name, b: (chunks) => <strong className="text-red-300">{chunks}</strong> })}
          </p>
        </div>

        <div className="bg-blue-500/8 border border-blue-500/20 rounded-lg p-3">
          <p className="text-xs text-blue-200">
            {t.rich('duplicateNameTip', { b: (chunks) => <strong>{chunks}</strong> })}
          </p>
        </div>

        <button
          onClick={onClose}
          className="w-full py-2.5 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 text-white font-medium transition-all hover:from-purple-500 hover:to-pink-500"
        >
          {t('duplicateNameRetry')}
        </button>
      </div>
    </div>
  )
}

// ── UploadModal ────────────────────────────────────────────────────────────────

function UploadModal({ onClose, onSuccess, t }: { onClose: () => void; onSuccess: () => void; t: ReturnType<typeof useTranslations> }) {
  const { user } = useAuth()
  const [form, setForm] = useState<UploadForm>({
    name: '', description: '', model_type: '', task_type: '',
    framework: 'transformers', script_type: 'train', tags: '', script: '',
  })
  const [authorInput, setAuthorInput] = useState('')
  const [authorLocked, setAuthorLocked] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [duplicateNameError, setDuplicateNameError] = useState<string | null>(null)

  // Load community name from user data (backend) on mount
  useEffect(() => {
    if (user?.communityName) {
      setAuthorInput(user.communityName)
      setAuthorLocked(true)
    }
  }, [user?.communityName])

  const set = (k: keyof UploadForm) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm((p) => ({ ...p, [k]: e.target.value }))

  const checkAuthorNameExists = async (name: string): Promise<boolean> => {
    try {
      const res = await fetch(`${API_BASE}/authors/${encodeURIComponent(name)}/exists`)
      const data = await res.json()
      return data.exists ?? false
    } catch {
      return false
    }
  }

  const updateUserCommunityName = async (newName: string): Promise<void> => {
    try {
      const response = await fetch(`/api/user/community-name`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user?.id, communityName: newName }),
      })
      if (!response.ok) {
        console.error('Error updating community name:', await response.json())
      }
    } catch (err) {
      console.error('Error updating community name:', err)
    }
  }

  const handleSubmit = async () => {
    if (!form.name.trim() || !form.script.trim()) {
      setError(t('upload.errors.required'))
      return
    }

    if (!user?.id) {
      setError(t('upload.errors.mustLogin'))
      return
    }

    if (!authorInput.trim()) {
      setError(t('upload.errors.communityNameRequired'))
      return
    }

    setLoading(true)
    setError('')
    try {
      // Check for duplicates (only on first upload)
      if (!authorLocked) {
        const exists = await checkAuthorNameExists(authorInput.trim())
        if (exists) {
          setDuplicateNameError(authorInput.trim())
          setLoading(false)
          return
        }
      }

      // Auto-save author name on first upload
      if (!authorLocked && user?.id && authorInput.trim()) {
        saveAuthorName(user.id, authorInput.trim())
        setAuthorLocked(true)
        await updateUserCommunityName(authorInput.trim())
      }

      const res = await fetch(`${API_BASE}/scripts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          author: authorInput.trim(),
          userId: user.id,
          tags: form.tags.split(',').map((tag) => tag.trim()).filter(Boolean),
        }),
      })
      if (!res.ok) throw new Error((await res.json()).error ?? t('upload.errors.uploadFailed'))
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
            <h2 className="text-lg font-bold text-white">{t('upload.title')}</h2>
            <p className="text-gray-400 text-sm">{t('upload.subtitle')}</p>
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
            {/* Community Name Input */}
            <div className="col-span-2">
              <label className="block text-xs font-medium text-gray-400 mb-1.5">{t('upload.communityNameLabel')}</label>
              {!authorLocked ? (
                <input
                  value={authorInput}
                  onChange={(e) => setAuthorInput(e.target.value.replace(/[^a-z0-9_\-. ]/gi, ''))}
                  placeholder={t('upload.communityNamePlaceholder')}
                  maxLength={40}
                  className="w-full px-4 py-2.5 rounded-xl glass border border-purple-500/30 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-purple-500/50"
                />
              ) : (
                <div className="flex items-center gap-2 px-4 py-2.5 glass border border-white/10 rounded-xl">
                  <span className="text-white text-sm flex-1">@{authorInput}</span>
                  <span className="text-[10px] text-gray-600">{t('upload.savedLabel')}</span>
                </div>
              )}
              <p className="text-xs text-gray-400 mt-1.5">
                {!authorLocked ? t('upload.communityNameHintNew') : t('upload.communityNameHintLocked')}
              </p>
            </div>

            <div className="col-span-2">
              <label className="block text-xs font-medium text-gray-400 mb-1.5">{t('upload.nameLabel')}</label>
              <input
                value={form.name} onChange={set('name')} placeholder={t('upload.namePlaceholder')}
                className="w-full px-4 py-2.5 rounded-xl glass border border-white/10 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-purple-500/50"
              />
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-medium text-gray-400 mb-1.5">{t('upload.descriptionLabel')}</label>
              <textarea
                value={form.description} onChange={set('description')} rows={2}
                placeholder={t('upload.descriptionPlaceholder')}
                className="w-full px-4 py-2.5 rounded-xl glass border border-white/10 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-purple-500/50 resize-none"
              />
            </div>

            {/* Typ */}
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">{t('upload.typeLabel')}</label>
              <select value={form.script_type} onChange={set('script_type')}
                className="w-full px-4 py-2.5 rounded-xl glass border border-white/10 text-white text-sm focus:outline-none focus:border-purple-500/50">
                <option value="train">{t('upload.typeTraining')}</option>
                <option value="test">{t('upload.typeTest')}</option>
              </select>
            </div>

            {/* Framework */}
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">{t('upload.frameworkLabel')}</label>
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
              <label className="block text-xs font-medium text-gray-400 mb-1.5">{t('upload.modelTypeLabel')}</label>
              <input value={form.model_type} onChange={set('model_type')} placeholder={t('upload.modelTypePlaceholder')}
                className="w-full px-4 py-2.5 rounded-xl glass border border-white/10 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-purple-500/50" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">{t('upload.taskTypeLabel')}</label>
              <input value={form.task_type} onChange={set('task_type')} placeholder={t('upload.taskTypePlaceholder')}
                className="w-full px-4 py-2.5 rounded-xl glass border border-white/10 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-purple-500/50" />
            </div>

            <div className="col-span-2">
              <label className="block text-xs font-medium text-gray-400 mb-1.5">{t('upload.tagsLabel')}</label>
              <input value={form.tags} onChange={set('tags')} placeholder={t('upload.tagsPlaceholder')}
                className="w-full px-4 py-2.5 rounded-xl glass border border-white/10 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-purple-500/50" />
            </div>

            <div className="col-span-2">
              <label className="block text-xs font-medium text-gray-400 mb-1.5">{t('upload.scriptLabel')}</label>
              <textarea value={form.script} onChange={set('script')} rows={10}
                placeholder={t('upload.scriptPlaceholder')}
                className="w-full px-4 py-2.5 rounded-xl glass border border-white/10 text-white text-xs font-mono placeholder-gray-600 focus:outline-none focus:border-purple-500/50 resize-none"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 px-6 py-4 border-t border-white/8">
          <button onClick={onClose} className="px-4 py-2 min-h-[44px] rounded-xl glass hover:bg-white/10 text-gray-400 text-sm font-medium transition-all">
            {t('upload.cancel')}
          </button>
          <button
            onClick={handleSubmit} disabled={loading}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white text-sm font-bold hover:from-purple-500 hover:to-pink-500 transition-all disabled:opacity-60"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
            {t('upload.submit')}
          </button>
        </div>

        {/* Duplicate Name Error Modal */}
        {duplicateNameError && (
          <DuplicateNameErrorModal
            name={duplicateNameError}
            onClose={() => setDuplicateNameError(null)}
            t={t}
          />
        )}
      </div>
    </div>
  )
}
// ── Main Client Component ──────────────────────────────────────────────────────

export function LibraryPageClient({ initialScripts }: { initialScripts: LibraryScript[] }) {
  const { isAuthenticated } = useAuth()
  const t = useTranslations('Library')
  const timeAgoMessages = t.raw('timeAgo') as TimeAgoMessages
  const seoCards = t.raw('seo.cards') as { title: string; desc: string }[]
  const seoSteps = t.raw('seo.steps') as { step: string; title: string; desc: string }[]

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
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
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
              {t('badge')}
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-6xl font-black mb-5 leading-tight">
              <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
                {t('heroTitlePart1')}
              </span>{' '}
              <span className="text-white">{t('heroTitlePart2')}</span>
            </h1>

            <p className="text-xl text-gray-400 leading-relaxed mb-8">
              {t.rich('heroSubtitle', { b: (chunks) => <strong className="text-white">{chunks}</strong> })}
            </p>

            {/* Stats pills */}
            <div className="flex items-center justify-center gap-4 flex-wrap mb-8">
              <div className="glass px-4 py-2 rounded-full text-sm text-gray-300 flex items-center gap-2">
                <Dumbbell className="w-4 h-4 text-violet-400" />
                <span>{t('statsTrain', { count: totalTrain })}</span>
              </div>
              <div className="glass px-4 py-2 rounded-full text-sm text-gray-300 flex items-center gap-2">
                <FlaskConical className="w-4 h-4 text-amber-400" />
                <span>{t('statsTest', { count: totalTest })}</span>
              </div>
              <div className="glass px-4 py-2 rounded-full text-sm text-gray-300 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>{t('statsVerified', { count: scripts.filter((s) => s.verified).length })}</span>
              </div>
            </div>

            {/* CTA Upload */}
            {isAuthenticated ? (
              <button
                onClick={() => setShowUpload(true)}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold hover:from-purple-500 hover:to-pink-500 transition-all shadow-lg shadow-purple-500/30"
              >
                <Upload className="w-4 h-4" /> {t('uploadCta')}
              </button>
            ) : (
              <Link
                href="/login"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl glass border border-white/15 text-gray-300 hover:border-white/30 hover:text-white font-semibold transition-all"
              >
                <Upload className="w-4 h-4" /> {t('loginCta')}
                <ArrowRight className="w-4 h-4" />
              </Link>
            )}
          </div>

          {/* ── Search & Filter bar ── */}
          <div className="glass-strong rounded-2xl p-4 border border-white/8 flex flex-col md:flex-row md:flex-wrap gap-3">
            {/* Search */}
            <div className="relative flex-1 md:min-w-[220px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={t('searchPlaceholder')}
                className="w-full pl-9 pr-4 py-2.5 rounded-xl glass border border-white/10 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-purple-500/50"
              />
            </div>

            {/* Type filter */}
            <div className="flex rounded-xl overflow-hidden border border-white/10 flex-shrink-0">
              {(['all', 'train', 'test'] as const).map((tf) => (
                <button
                  key={tf}
                  onClick={() => setTypeFilter(tf)}
                  className={`px-4 py-2.5 min-h-[44px] text-sm font-medium transition-all ${
                    typeFilter === tf
                      ? 'bg-purple-500/20 text-purple-300'
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {tf === 'all' ? t('filterAll') : tf === 'train' ? t('filterTrain') : t('filterTest')}
                </button>
              ))}
            </div>

            {/* Framework filter */}
            <select
              value={frameworkFilter}
              onChange={(e) => setFrameworkFilter(e.target.value)}
              className="px-4 py-2.5 min-h-[44px] rounded-xl glass border border-white/10 text-gray-300 text-sm focus:outline-none focus:border-purple-500/50 flex-shrink-0"
            >
              <option value="">{t('allFrameworks')}</option>
              <option value="transformers">transformers</option>
              <option value="pytorch">pytorch</option>
              <option value="tensorflow">tensorflow</option>
              <option value="jax">jax</option>
            </select>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-4 py-2.5 min-h-[44px] rounded-xl glass border border-white/10 text-gray-300 text-sm focus:outline-none focus:border-purple-500/50 flex-shrink-0"
            >
              <option value="downloads">{t('sortDownloads')}</option>
              <option value="stars">{t('sortStars')}</option>
              <option value="newest">{t('sortNewest')}</option>
            </select>

            {/* Verified toggle */}
            <button
              onClick={() => setVerifiedOnly((v) => !v)}
              className={`px-4 py-2.5 min-h-[44px] rounded-xl border text-sm font-medium transition-all flex items-center gap-2 flex-shrink-0 ${
                verifiedOnly
                  ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/25'
                  : 'glass border-white/10 text-gray-400 hover:text-white'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              {t('verifiedToggle')}
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
                <span className="flex items-center gap-2"><Loader2 className="w-3.5 h-3.5 animate-spin" /> {t('loadingText')}</span>
              ) : (
                <span>{t('resultsFound', { count: sorted.length })}</span>
              )}
            </p>
          </div>

          {sorted.length === 0 && !loading ? (
            <div className="text-center py-24 glass-strong rounded-2xl border border-white/8">
              <Code2 className="w-12 h-12 text-gray-600 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-white mb-2">{t('emptyTitle')}</h3>
              <p className="text-gray-500 text-sm mb-6">{t('emptyText')}</p>
              {isAuthenticated && (
                <button
                  onClick={() => setShowUpload(true)}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white text-sm font-bold"
                >
                  <Upload className="w-4 h-4" /> {t('emptyCta')}
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
                  <ScriptCard script={s} onView={setSelectedScript} t={t} timeAgoMessages={timeAgoMessages} />
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
              {t('seo.heading')}
            </h2>
            <p className="text-gray-400 text-lg max-w-3xl mx-auto">
              {t('seo.subtitle')}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-16">
            {[Dumbbell, FlaskConical, CheckCircle2].map((Icon, i) => (
              <div key={seoCards[i].title} className="glass-strong rounded-2xl p-7">
                <div className={`w-12 h-12 bg-gradient-to-br ${['from-violet-500 to-purple-600', 'from-amber-500 to-orange-600', 'from-emerald-500 to-green-600'][i]} rounded-xl flex items-center justify-center mb-5`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-bold text-white mb-3">{seoCards[i].title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{seoCards[i].desc}</p>
              </div>
            ))}
          </div>

          {/* Supported frameworks */}
          <div className="glass-strong rounded-2xl p-8 mb-10">
            <h3 className="text-xl font-bold text-white mb-2">{t('seo.frameworksHeading')}</h3>
            <p className="text-gray-400 text-sm mb-6">
              {t('seo.frameworksIntro')}
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
            <h3 className="text-xl font-bold text-white mb-6">{t('seo.howToHeading')}</h3>
            <div className="grid md:grid-cols-3 gap-6">
              {[Search, BookOpen, Sparkles].map((Icon, i) => (
                <div key={seoSteps[i].step} className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center text-white">
                      <Icon className="w-5 h-5" />
                    </div>
                  </div>
                  <div>
                    <span className="text-xs font-mono text-gray-600">{seoSteps[i].step}</span>
                    <h4 className="font-semibold text-white text-sm mb-1">{seoSteps[i].title}</h4>
                    <p className="text-gray-400 text-xs leading-relaxed">{seoSteps[i].desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* CTA Download App */}
          <div className="glass-strong rounded-2xl p-8 border border-purple-500/15 bg-gradient-to-br from-purple-600/5 to-transparent text-center">
            <h3 className="text-2xl font-black text-white mb-3">
              {t('seo.ctaHeading')}
            </h3>
            <p className="text-gray-400 text-base mb-6 max-w-xl mx-auto">
              {t('seo.ctaText')}
            </p>
            <div className="flex flex-wrap gap-3 justify-center">
              <Link
                href="/download"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold hover:from-purple-500 hover:to-pink-500 transition-all shadow-lg shadow-purple-500/30"
              >
                <Sparkles className="w-4 h-4" /> {t('seo.ctaDownload')}
              </Link>
              <Link
                href="/docs"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl glass border border-white/15 text-gray-300 hover:border-white/30 hover:text-white font-semibold transition-all"
              >
                <BookOpen className="w-4 h-4" /> {t('seo.ctaDocs')}
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Modals */}
      {selectedScript && (
        <ScriptDetailModal script={selectedScript} onClose={() => setSelectedScript(null)} t={t} timeAgoMessages={timeAgoMessages} />
      )}
      {showUpload && (
        <UploadModal
          onClose={() => setShowUpload(false)}
          onSuccess={() => { fetchScripts(); }}
          t={t}
        />
      )}
    </>
  )
}
