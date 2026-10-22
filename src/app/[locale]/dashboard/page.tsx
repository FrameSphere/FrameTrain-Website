'use client'

import { useEffect, useState, useRef, useCallback, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { useRouter, Link } from '@/i18n/navigation'
import { useTranslations, useLocale } from 'next-intl'
import { useAuth } from '@/contexts/AuthContext'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { EmailVerificationBanner } from '@/components/EmailVerificationBanner'
import {
  Download, Key, Copy, Check, ExternalLink, X, RefreshCw,
  Lightbulb, MessageCircle, Send, ChevronDown, Plus, Lock, Eye, EyeOff,
  Globe, AlertCircle, Pencil, Loader2, CreditCard, Zap,
} from 'lucide-react'
/* Temporäre UI Anfang, bald herausnehmen */
/* Temporäre UI Ende */

const MANAGER_API = process.env.NEXT_PUBLIC_MANAGER_API_URL || 'https://webcontrol-hq-api.karol-paschek.workers.dev'

// ── Types ─────────────────────────────────────────────────────────
interface ApiKey {
  id: string
  key: string
  createdAt: string
  lastUsedAt: string | null
  isActive: boolean
}

interface SupportTicket {
  id: number
  subject: string
  status: 'open' | 'in_progress' | 'resolved' | 'closed'
  created_at: string
  updated_at: string
}

interface SupportMessage {
  id: number
  sender: 'user' | 'admin'
  message: string
  created_at: string
}

interface StoredTicket {
  ticket_id: number
  user_token: string
  subject: string
}

// ── Status helpers ─────────────────────────────────────────────────
const STATUS_COLOR: Record<string, string> = {
  open: 'text-indigo-text bg-indigo-soft border-line',
  in_progress: 'text-warning bg-ghost-fill border-line',
  resolved: 'text-success bg-ghost-fill border-line',
  closed: 'text-ink-muted bg-surface-raised border-line',
}

// ── Support hook – persists ticket list in localStorage ────────────
function useStoredTickets(userId: string | undefined) {
  const key = `ft_tickets_${userId || 'anon'}`

  const getAll = useCallback((): StoredTicket[] => {
    try { return JSON.parse(localStorage.getItem(key) || '[]') } catch { return [] }
  }, [key])

  const add = useCallback((t: StoredTicket) => {
    const list = getAll().filter(x => x.ticket_id !== t.ticket_id)
    localStorage.setItem(key, JSON.stringify([t, ...list]))
  }, [key, getAll])

  return { getAll, add }
}

// ── DuplicateNameError Modal ──────────────────────────────────────────────

function CommunityNameErrorModal({ name, onClose, t }: { name: string; onClose: () => void; t: ReturnType<typeof useTranslations> }) {
  return (
    <div className="fixed inset-0 bg-[rgba(5,5,10,0.72)] flex items-center justify-center z-50 p-4">
      <div className="bg-surface border border-line rounded-lg border border-danger max-w-sm w-full p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-ghost-fill border border-danger flex items-center justify-center">
            <AlertCircle className="w-6 h-6 text-danger" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-ink">{t('communityNameError.title')}</h3>
            <p className="text-sm text-ink-muted mt-1">{t('communityNameError.subtitle')}</p>
          </div>
        </div>

        <div className="bg-ghost-fill border border-danger rounded-sm p-3">
          <p className="text-sm text-danger">
            {t.rich('communityNameError.text', { name, b: (chunks) => <strong className="text-danger">{chunks}</strong> })}
          </p>
        </div>

        <div className="bg-indigo-soft border border-line rounded-sm p-3">
          <p className="text-xs text-indigo-text">
            {t.rich('communityNameError.tip', { b: (chunks) => <strong>{chunks}</strong> })}
          </p>
        </div>

        <button
          onClick={onClose}
          className="press w-full py-2.5 rounded-sm bg-indigo-button hover:bg-indigo-hover text-on-indigo shadow-button-edge font-medium transition duration-200 ease-out  "
        >
          {t('communityNameError.retryButton')}
        </button>
      </div>
    </div>
  )
}

// ── Main Dashboard ─────────────────────────────────────────────────
function DashboardPageInner() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user, isAuthenticated, loading: authLoading } = useAuth()
  const t = useTranslations('Dashboard')
  const locale = useLocale()
  const dateLocale = locale === 'de' ? 'de-DE' : 'en-US'
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([])
  const [hasPaid, setHasPaid] = useState(true)
  const [subscriptionCancelAt, setSubscriptionCancelAt] = useState<string | null>(null)
  const [lifetimeAccess, setLifetimeAccess] = useState(false)
  const [promoAccessUntil, setPromoAccessUntil] = useState<string | null>(null)
  const [isTrial, setIsTrial] = useState(false)
  const [hasSubscription, setHasSubscription] = useState(false)
  const [subscriptionTrialEnd, setSubscriptionTrialEnd] = useState<string | null>(null)
  const [copiedKey, setCopiedKey] = useState<string | null>(null)
  const [dataLoading, setDataLoading] = useState(true)
  const [regenerating, setRegenerating] = useState(false)
  const [redirectingToPayment, setRedirectingToPayment] = useState(false)
  const [redirectingToPortal, setRedirectingToPortal] = useState(false)
  const [appVersion, setAppVersion] = useState('...')
  const [supportBadge, setSupportBadge] = useState(0)
  const [isOAuthUser, setIsOAuthUser] = useState(false)
  const [hasDesktopPassword, setHasDesktopPassword] = useState(false)

  // Desktop-Passwort State
  const [desktopPassword, setDesktopPassword] = useState('')
  const [desktopPasswordConfirm, setDesktopPasswordConfirm] = useState('')
  const [showDesktopPassword, setShowDesktopPassword] = useState(false)
  const [settingDesktopPassword, setSettingDesktopPassword] = useState(false)
  const [desktopPasswordSuccess, setDesktopPasswordSuccess] = useState('')
  const [desktopPasswordError, setDesktopPasswordError] = useState('')

  // Community-Name State
  const [communityNameInput, setCommunityNameInput] = useState('')
  const [editingCommunityName, setEditingCommunityName] = useState(false)
  const [savingCommunityName, setSavingCommunityName] = useState(false)
  const [communityNameError, setCommunityNameError] = useState<string | null>(null)

  // Load community name from user data
  useEffect(() => {
    if (user?.communityName) {
      setCommunityNameInput(user.communityName)
      if (typeof window !== 'undefined') {
        localStorage.setItem(`ft_author_${user.id}`, user.communityName)
      }
    }
  }, [user?.communityName, user?.id])

  // Support state
  const [supportOpen, setSupportOpen] = useState(false)
  const [supportView, setSupportView] = useState<'list' | 'new' | 'thread'>('list')
  const [storedTickets, setStoredTickets] = useState<StoredTicket[]>([])
  const [activeTicket, setActiveTicket] = useState<StoredTicket | null>(null)
  const [ticketInfo, setTicketInfo] = useState<SupportTicket | null>(null)
  const [messages, setMessages] = useState<SupportMessage[]>([])
  const [threadLoading, setThreadLoading] = useState(false)
  const [newSubject, setNewSubject] = useState('')
  const [newMessage, setNewMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [replyText, setReplyText] = useState('')
  const [sendingReply, setSendingReply] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const { getAll, add } = useStoredTickets(user?.id)

  // ── Check for unread admin replies ──────────────────────────────
  useEffect(() => {
    async function checkBadge() {
      const tickets = getAll()
      if (!tickets.length) return
      let unread = 0
      for (const t of tickets) {
        const lastSeenKey = `ft_ticket_seen_${t.ticket_id}`
        const lastSeen = parseInt(typeof window !== 'undefined' ? localStorage.getItem(lastSeenKey) || '0' : '0', 10)
        try {
          const res = await fetch(`${MANAGER_API}/api/support/${t.ticket_id}/thread?token=${t.user_token}`)
          if (!res.ok) continue
          const data = await res.json()
          const msgs: SupportMessage[] = data.messages || []
          const adminMsgs = msgs.filter((m: SupportMessage) => m.sender === 'admin')
          if (adminMsgs.length > 0) {
            const lastAdmin = new Date(adminMsgs[adminMsgs.length - 1].created_at).getTime()
            if (lastAdmin > lastSeen) unread++
          }
        } catch { /* ignore */ }
      }
      setSupportBadge(unread)
    }
    if (!authLoading && isAuthenticated) checkBadge()
  }, [authLoading, isAuthenticated, getAll])

  // ── Auth redirect ──────────────────────────────────────────────
  useEffect(() => {
    if (!authLoading && !isAuthenticated) router.push('/login')
  }, [authLoading, isAuthenticated, router])

  useEffect(() => {
    if (isAuthenticated && user) fetchDashboardData()
  }, [isAuthenticated, user])

  useEffect(() => { fetchAppVersion() }, [])

  // ?support=open → Support-Sektion direkt aufklappen
  useEffect(() => {
    if (searchParams.get('support') === 'open') {
      setSupportOpen(true)
      // Sanft zur Support-Sektion scrollen
      setTimeout(() => {
        document.getElementById('support-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }, 400)
    }
  }, [searchParams])

  useEffect(() => {
    if (supportOpen) setStoredTickets(getAll())
  }, [supportOpen, getAll])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // ── API calls ──────────────────────────────────────────────────
  const fetchDashboardData = async () => {
    try {
      const res = await fetch('/api/keys', { credentials: 'include', headers: { 'Content-Type': 'application/json' } })
      if (!res.ok) throw new Error()
      const data = await res.json()
      setApiKeys(data.apiKeys || [])
      setHasPaid(data.hasPaid ?? true)
      setSubscriptionCancelAt(data.subscriptionCancelAt ?? null)
      setLifetimeAccess(!!data.lifetimeAccess)
      setPromoAccessUntil(data.promoAccessUntil ?? null)
      setIsTrial(!!data.isTrial)
      setHasSubscription(!!data.hasSubscription)
      setSubscriptionTrialEnd(data.subscriptionTrialEnd ?? null)
      setIsOAuthUser(!!data.isOAuthUser)
      setHasDesktopPassword(!!data.hasDesktopPassword)
    } catch { /* silent */ } finally { setDataLoading(false) }
  }

  const fetchAppVersion = async () => {
    try {
      const res = await fetch('/api/app-version')
      if (res.ok) { const d = await res.json(); setAppVersion(d.version || '1.0.0') }
    } catch { setAppVersion('1.0.0') }
  }

  const handleSaveCommunityName = async () => {
    if (!communityNameInput.trim() || !user?.id) return

    setSavingCommunityName(true)
    setCommunityNameError(null)

    try {
      // Check for duplicates
      const checkRes = await fetch(`/api/library/authors/${encodeURIComponent(communityNameInput.trim())}/exists`)
      const checkData = await checkRes.json()
      if (checkData.exists) {
        setCommunityNameError(communityNameInput.trim())
        setSavingCommunityName(false)
        return
      }

      // Save to backend
      const res = await fetch('/api/user/community-name', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, communityName: communityNameInput.trim() }),
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || t('communityName.errorGeneric'))
      }

      // Save to localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem(`ft_author_${user.id}`, communityNameInput.trim())
      }

      setEditingCommunityName(false)
    } catch (err: any) {
      setCommunityNameError(err.message)
    } finally {
      setSavingCommunityName(false)
    }
  }

  const regenerateKey = async () => {
    if (!confirm(t('apiKeys.confirmRegenerate'))) return
    setRegenerating(true)
    try {
      const res = await fetch('/api/keys/regenerate', { method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' } })
      if (!res.ok) {
        const data = await res.json().catch(() => null)
        throw new Error(data?.code === 'EMAIL_NOT_VERIFIED' ? t('apiKeys.errorEmailNotVerified') : data?.error)
      }
      await fetchDashboardData()
      alert(t('apiKeys.successRegenerate'))
    } catch (err: any) { alert(err?.message || t('apiKeys.errorRegenerate')) } finally { setRegenerating(false) }
  }

  const copyToClipboard = (key: string) => {
    navigator.clipboard.writeText(key)
    setCopiedKey(key)
    setTimeout(() => setCopiedKey(null), 2000)
  }

  // Zur Payment-Seite statt direkt zu Stripe: dort kann der User
  // Monatlich/Jährlich wählen und Gutschein-Codes einlösen
  const handlePayment = () => {
    setRedirectingToPayment(true)
    router.push('/payment')
  }

  const handlePortal = async () => {
    setRedirectingToPortal(true)
    try {
      const res = await fetch('/api/payment/portal', { method: 'POST', credentials: 'include' })
      if (!res.ok) {
        const e = await res.json()
        throw new Error(e.error || t('subscription.errorGeneric'))
      }
      const data = await res.json()
      if (data.url) window.location.href = data.url
    } catch (err: any) {
      alert(`${err.message || t('subscription.errorPortal')}`)
      setRedirectingToPortal(false)
    }
  }

  const setDesktopPasswordHandler = async () => {
    setDesktopPasswordError('')
    setDesktopPasswordSuccess('')
    if (desktopPassword.length < 6) {
      setDesktopPasswordError(t('desktopPassword.minLengthError'))
      return
    }
    if (desktopPassword !== desktopPasswordConfirm) {
      setDesktopPasswordError(t('desktopPassword.mismatchError'))
      return
    }
    setSettingDesktopPassword(true)
    try {
      const res = await fetch('/api/desktop-password/set', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: desktopPassword }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || t('desktopPassword.genericError'))
      setDesktopPasswordSuccess(t('desktopPassword.successMessage'))
      setDesktopPassword('')
      setDesktopPasswordConfirm('')
      setHasDesktopPassword(true)
    } catch (err: any) {
      setDesktopPasswordError(err.message || t('desktopPassword.genericError'))
    } finally {
      setSettingDesktopPassword(false)
    }
  }

  const downloadApp = async (platform: 'windows' | 'mac' | 'linux') => {
    const activeKey = apiKeys.find(k => k.isActive)
    if (!activeKey) { alert(t('apiKeys.noKeyAlert')); return }
    try {
      const res = await fetch(`/api/download-app?platform=${platform}&key=${activeKey.key}`, { credentials: 'include' })
      if (!res.ok) { const e = await res.json(); alert(t('download.downloadFailedAlert', { message: e.message || '' })); return }
      const data = await res.json()
      if (data.download_url) window.location.href = data.download_url
    } catch { alert(t('download.downloadErrorAlert')) }
  }

  // ── Support actions ────────────────────────────────────────────
  const submitTicket = async () => {
    if (!newSubject.trim() || !newMessage.trim()) { alert(t('support.requiredAlert')); return }
    setSubmitting(true)
    try {
      const res = await fetch(`${MANAGER_API}/api/support/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user?.id || 'unknown',
          name: user?.email?.split('@')[0] || 'FrameTrain User',
          email: user?.email || '',
          subject: newSubject.trim(),
          message: newMessage.trim(),
        }),
      })
      const data = await res.json()
      if (!data.success) throw new Error()

      const stored: StoredTicket = { ticket_id: data.ticket_id, user_token: data.user_token, subject: newSubject.trim() }
      add(stored)
      setStoredTickets(getAll())
      setNewSubject('')
      setNewMessage('')
      openThread(stored)
    } catch { alert(t('support.submitError')) } finally { setSubmitting(false) }
  }

  const openThread = async (stored: StoredTicket) => {
    setActiveTicket(stored)
    setSupportView('thread')
    setThreadLoading(true)
    try {
      const res = await fetch(`${MANAGER_API}/api/support/${stored.ticket_id}/thread?token=${stored.user_token}`)
      if (!res.ok) throw new Error()
      const data = await res.json()
      setTicketInfo(data.ticket)
      setMessages(data.messages)
    } catch { setTicketInfo(null); setMessages([]) } finally { setThreadLoading(false) }
  }

  const sendReply = async () => {
    if (!replyText.trim() || !activeTicket) return
    setSendingReply(true)
    const text = replyText.trim()
    setReplyText('')
    try {
      const res = await fetch(`${MANAGER_API}/api/support/${activeTicket.ticket_id}/reply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: activeTicket.user_token, message: text }),
      })
      if (!res.ok) throw new Error()
      setMessages(prev => [...prev, { id: Date.now(), sender: 'user', message: text, created_at: new Date().toISOString() }])
      if (ticketInfo) setTicketInfo({ ...ticketInfo, status: 'in_progress' })
    } catch { alert(t('support.sendError')); setReplyText(text) } finally { setSendingReply(false) }
  }

  // ── Loading / auth guard ───────────────────────────────────────
  if (authLoading || dataLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg ">
        <div className="text-ink text-xl">{t('loading')}</div>
      </div>
    )
  }
  if (!isAuthenticated) return null

  const activeKey = apiKeys.find(k => k.isActive)

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 px-4 py-12">
        <div className="max-w-7xl mx-auto">

          {/* Page header */}
          <div className="mb-8">
            <h1 className="text-4xl font-semibold text-ink mb-2">{t('title')}</h1>
            <p className="text-ink-muted">{t('welcome', { email: user?.email || '' })}</p>
          </div>

          {/* ── E-Mail-Verifikations-Banner ────────────────────────── */}
          <EmailVerificationBanner />

          {/* ── Abo-Status-Banner (nur wenn abgelaufen) ───────────── */}
          {!hasPaid && (
            <div className="mb-8 p-5 rounded-lg border border-danger bg-ghost-fill flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="flex items-center gap-3 flex-1">
                <div className="w-10 h-10 rounded-full bg-ghost-fill flex items-center justify-center flex-shrink-0">
                  <AlertCircle className="w-5 h-5 text-danger" />
                </div>
                <div>
                  <p className="text-ink font-semibold">{t('subscriptionInactive.title')}</p>
                  <p className="text-danger text-sm mt-0.5">{t('subscriptionInactive.text')}</p>
                </div>
              </div>
              <button
                onClick={handlePayment}
                disabled={redirectingToPayment}
                className="press flex-shrink-0 flex items-center gap-2 px-5 py-2.5 bg-indigo-button hover:bg-indigo-hover text-on-indigo shadow-button-edge font-semibold rounded-md transition duration-200 ease-out disabled:opacity-50 text-sm"
              >
                {redirectingToPayment
                  ? <><RefreshCw className="w-4 h-4 animate-spin" /> {t('subscriptionInactive.redirecting')}</>
                  : <>{t('subscriptionInactive.renewButton')}</>}
              </button>
            </div>
          )}

          {/* ── Kündigung läuft noch ───────────────────────────────── */}
          {hasPaid && subscriptionCancelAt && (() => {
            const cancelDate = new Date(subscriptionCancelAt)
            const now = new Date()
            const diffMs = cancelDate.getTime() - now.getTime()
            const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24))
            const formattedDate = cancelDate.toLocaleDateString(dateLocale, { day: '2-digit', month: 'long', year: 'numeric' })
            return (
              <div className="mb-8 p-5 rounded-lg border border-warning bg-ghost-fill flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <div className="flex items-center gap-3 flex-1">
                  <div className="w-10 h-10 rounded-full bg-ghost-fill flex items-center justify-center flex-shrink-0">
                    <AlertCircle className="w-5 h-5 text-warning" />
                  </div>
                  <div>
                    <p className="text-ink font-semibold">
                      {t('subscriptionCanceling.title', { days: diffDays })}
                    </p>
                    <p className="text-warning text-sm mt-0.5">
                      {t('subscriptionCanceling.text', { date: formattedDate })}
                    </p>
                  </div>
                </div>
                <button
                  onClick={handlePayment}
                  disabled={redirectingToPayment}
                  className="press flex-shrink-0 flex items-center gap-2 px-5 py-2.5 bg-indigo-button hover:bg-indigo-hover text-on-indigo shadow-button-edge font-semibold rounded-md transition duration-200 ease-out disabled:opacity-50 text-sm"
                >
                  {redirectingToPayment
                    ? <><RefreshCw className="w-4 h-4 animate-spin" /> {t('subscriptionCanceling.redirecting')}</>
                    : <>{t('subscriptionCanceling.continueButton')}</>}
                </button>
              </div>
            )
          })()}

          {/* ── Gratiszeit (Promo-Code ohne Abo) läuft ab ──────────── */}
          {hasPaid && !lifetimeAccess && !hasSubscription && promoAccessUntil && (() => {
            const untilDate = new Date(promoAccessUntil)
            const now = new Date()
            const diffDays = Math.max(0, Math.ceil((untilDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)))
            const formattedDate = untilDate.toLocaleDateString(dateLocale, { day: '2-digit', month: 'long', year: 'numeric' })
            // Testphase ruhig anzeigen; Warnfarbe erst kurz vor dem Ende
            const urgent = diffDays <= 3
            const k = isTrial ? 'trialAccess' : 'promoAccess'
            return (
              <div className={`mb-8 p-5 rounded-lg border bg-surface flex flex-col sm:flex-row items-start sm:items-center gap-4 ${urgent ? 'border-warning' : 'border-line'}`}>
                <div className="flex items-center gap-3 flex-1">
                  <div className="w-10 h-10 rounded-full bg-ghost-fill flex items-center justify-center flex-shrink-0">
                    {urgent ? <AlertCircle className="w-5 h-5 text-warning" /> : <span className="ft-dot ft-dot--live" aria-hidden="true" />}
                  </div>
                  <div>
                    <p className="text-ink font-semibold">
                      {t(`${k}.title`, { days: diffDays })}
                    </p>
                    <p className={`text-sm mt-0.5 ${urgent ? 'text-warning' : 'text-ink-muted'}`}>
                      {t(`${k}.text`, { date: formattedDate })}
                    </p>
                  </div>
                </div>
                <div className="flex-shrink-0 flex flex-col sm:flex-row gap-2">
                  <button
                    onClick={handlePayment}
                    disabled={redirectingToPayment}
                    className="press flex items-center justify-center gap-2 px-5 py-2.5 bg-indigo-button hover:bg-indigo-hover text-on-indigo shadow-button-edge font-semibold rounded-md transition duration-200 ease-out disabled:opacity-50 text-sm"
                  >
                    {redirectingToPayment
                      ? <><RefreshCw className="w-4 h-4 animate-spin" /> {t('promoAccess.redirecting')}</>
                      : <>{t('promoAccess.subscribeButton')}</>}
                  </button>
                  <button
                    onClick={() => router.push('/redeem')}
                    className="flex items-center justify-center gap-2 px-5 py-2.5 border border-line text-ink hover:bg-ghost-fill font-semibold rounded-md transition duration-200 ease-out text-sm"
                  >
                    {t('promoAccess.redeemButton')}
                  </button>
                </div>
              </div>
            )
          })()}

          {/* ── Stripe-Gratiszeit (Trial) läuft – erste Abbuchung ankündigen ── */}
          {hasSubscription && !subscriptionCancelAt && subscriptionTrialEnd && (() => {
            const trialDate = new Date(subscriptionTrialEnd)
            if (trialDate <= new Date()) return null
            const diffDays = Math.max(0, Math.ceil((trialDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
            const formattedDate = trialDate.toLocaleDateString(dateLocale, { day: '2-digit', month: 'long', year: 'numeric' })
            return (
              <div className="mb-8 p-5 rounded-lg border border-line bg-indigo-soft flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-indigo-soft flex items-center justify-center flex-shrink-0">
                  <Zap className="w-5 h-5 text-indigo-text" />
                </div>
                <div>
                  <p className="text-ink font-semibold">{t('trial.title', { days: diffDays })}</p>
                  <p className="text-indigo-text text-sm mt-0.5">{t('trial.text', { date: formattedDate })}</p>
                </div>
              </div>
            )
          })()}

          {/* ── API Keys ─────────────────────────────────────────── */}
          <div className="bg-surface border border-line rounded-lg p-8 mb-8 border border-line">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <Key className="w-6 h-6 text-indigo-text mr-3" />
                <h2 className="text-2xl font-semibold text-ink">{t('apiKeys.title')}</h2>
              </div>
              {activeKey && (
                <button
                  onClick={regenerateKey}
                  disabled={regenerating}
                  className="flex items-center gap-2 px-4 py-2 bg-indigo-button hover:bg-indigo-button text-ink rounded-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <RefreshCw className={`w-4 h-4 ${regenerating ? 'animate-spin' : ''}`} />
                  {regenerating ? t('apiKeys.regenerating') : t('apiKeys.regenerateButton')}
                </button>
              )}
            </div>

            {apiKeys.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-ink-muted mb-4">{t('apiKeys.emptyText1')}</p>
                <p className="text-ink-faint text-sm mb-6">{t('apiKeys.emptyText2')}</p>
                <button
                  onClick={handlePayment}
                  disabled={redirectingToPayment}
                  className="press px-6 py-3 bg-indigo-button hover:bg-indigo-hover text-on-indigo shadow-button-edge font-semibold rounded-sm transition duration-200 ease-out disabled:opacity-50 flex items-center gap-2 mx-auto"
                >
                  {redirectingToPayment ? <><RefreshCw className="w-5 h-5 animate-spin" /><span>{t('apiKeys.payRedirecting')}</span></> : <><Key className="w-5 h-5" /><span>{t('apiKeys.payButton')}</span></>}
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {apiKeys.map((apiKey) => (
                  <div key={apiKey.id} className={`bg-surface border border-line rounded-sm p-4 border ${
                    apiKey.isActive ? 'border-line' : 'border-danger bg-ghost-fill'
                  }`}>
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <code className={`font-mono text-sm px-3 py-1 rounded border ${
                            apiKey.isActive
                              ? 'text-indigo-text bg-bg border-line'
                              : 'text-ink-faint bg-bg border-line line-through'
                          }`}>{apiKey.key}</code>
                          {apiKey.isActive && (
                            <button onClick={() => copyToClipboard(apiKey.key)} className="p-2 hover:bg-surface-raised rounded-sm transition-colors">
                              {copiedKey === apiKey.key ? <Check className="w-4 h-4 text-success" /> : <Copy className="w-4 h-4 text-ink-muted" />}
                            </button>
                          )}
                        </div>
                        <div className="flex items-center space-x-4 text-sm text-ink-muted">
                          <span>{t('apiKeys.created', { date: new Date(apiKey.createdAt).toLocaleDateString(dateLocale) })}</span>
                          {apiKey.lastUsedAt && <span>{t('apiKeys.lastUsed', { date: new Date(apiKey.lastUsedAt).toLocaleDateString(dateLocale) })}</span>}
                          {apiKey.isActive && isOAuthUser && !hasDesktopPassword ? (
                            <span className="flex items-center gap-1 text-warning">
                              <Lock className="w-4 h-4" /><span>{t('apiKeys.passwordMissing')}</span>
                            </span>
                          ) : (
                            <span className={`flex items-center gap-1 ${apiKey.isActive ? 'text-success' : 'text-danger'}`}>
                              {apiKey.isActive
                                ? <><Check className="w-4 h-4" /><span>{t('apiKeys.active')}</span></>
                                : <><X className="w-4 h-4" /><span>{t('apiKeys.deactivatedExpired')}</span></>}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ── Download ─────────────────────────────────────────── */}
          <div className="bg-surface border border-line rounded-lg p-8 mb-8 border border-line">
            <div className="flex items-center mb-6">
              <Download className="w-6 h-6 text-indigo-text mr-3" />
              <h2 className="text-2xl font-semibold text-ink">{t('download.title')}</h2>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              {[
                { platform: 'windows' as const, label: 'Windows', ext: '.exe', gradient: 'bg-surface-raised border border-line' },
                { platform: 'mac' as const, label: 'macOS', ext: '.dmg', gradient: 'bg-surface-raised border border-line' },
                { platform: 'linux' as const, label: 'Linux', ext: '.AppImage', gradient: 'bg-surface-raised border border-line' },
              ].map(({ platform, label, ext, gradient }) => (
                <button
                  key={platform}
                  onClick={() => downloadApp(platform)}
                  disabled={!activeKey}
                  className="card-lift bg-surface border border-line hover:bg-surface-raised border border-line rounded-md p-6 transition duration-200 ease-out group disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="text-center">
                    <div className={`w-16 h-16 mx-auto mb-4 ${gradient} rounded-lg flex items-center justify-center`}>
                      <Download className="w-8 h-8 text-ink" />
                    </div>
                    <h3 className="text-xl font-semibold text-ink mb-2">{label}</h3>
                    <p className="text-ink-muted text-sm mb-4">{t('download.version', { version: appVersion })}</p>
                    <div className="flex items-center justify-center text-indigo-text group-hover:text-indigo-text">
                      <Download className="w-4 h-4 mr-2" />
                      <span className="font-semibold">{t('download.downloadButton', { ext })}</span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
            <div className="mt-8 p-4 bg-surface border border-line border border-line rounded-sm">
              <p className="text-ink text-sm flex items-start gap-2">
                <Lightbulb className="w-5 h-5 text-indigo-text flex-shrink-0 mt-0.5" />
                <span>{t('download.securityWarningText')}
                  <Link href="/install" className="text-indigo-text hover:text-indigo-text underline ml-1">{t('download.installGuideLink')}</Link>
                </span>
              </p>
            </div>
          </div>

          {/* ── Community Name ────────────────────────────────── */}
          <div className="bg-surface border border-line rounded-lg p-8 mb-8 border border-line">
            <div className="flex items-center gap-3 mb-4">
              <Globe className="w-5 h-5 text-indigo-text" />
              <h2 className="text-2xl font-semibold text-ink">{t('communityName.title')}</h2>
            </div>
            <p className="text-ink-muted text-sm mb-4">{t('communityName.subtitle')}</p>

            {communityNameInput && !editingCommunityName && (
              <div className="flex items-center gap-2 px-4 py-3 mb-4 bg-ghost-fill border border-line rounded-sm">
                <Check className="w-4 h-4 text-success flex-shrink-0" />
                <p className="text-sm text-success">
                  {t.rich('communityName.saved', { name: communityNameInput, b: (chunks) => <strong>{chunks}</strong> })}
                </p>
              </div>
            )}

            {!communityNameInput || editingCommunityName ? (
              <div className="space-y-3">
                <div className="flex items-start gap-2 p-3 bg-indigo-soft border border-line rounded-sm">
                  <Lightbulb className="w-4 h-4 text-indigo-text flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-indigo-text">{!communityNameInput ? t('communityName.hintNew') : t('communityName.hintEdit')}</p>
                </div>
                <div className="flex gap-2">
                  <input
                    value={communityNameInput}
                    onChange={(e) => {
                      let val = e.target.value.replace(/[^a-z0-9_\-.]/gi, '').slice(0, 40)
                      if (val.startsWith('@')) val = val.slice(1)
                      setCommunityNameInput(val)
                    }}
                    placeholder={t('communityName.placeholder')}
                    maxLength={40}
                    className="flex-1 px-4 py-2.5 bg-surface border border-line border border-line rounded-sm text-ink text-sm placeholder-ink-faint focus:outline-none focus:border-line-strong"
                  />
                  <button
                    onClick={handleSaveCommunityName}
                    disabled={savingCommunityName || !communityNameInput.trim()}
                    className="press px-5 py-2.5 rounded-sm bg-indigo-button hover:bg-indigo-hover text-on-indigo shadow-button-edge font-medium transition duration-200 ease-out   disabled:opacity-60"
                  >
                    {savingCommunityName ? <Loader2 className="w-4 h-4 animate-spin" /> : t('communityName.saveButton')}
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between px-4 py-3 bg-surface border border-line border border-line rounded-sm">
                <span className="text-ink text-sm">@{communityNameInput}</span>
                <button
                  onClick={() => setEditingCommunityName(true)}
                  className="p-2 rounded-sm hover:bg-surface-raised text-ink-muted hover:text-ink transition-colors"
                  title={t('communityName.changeNameTitle')}
                >
                  <Pencil className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {/* ── Desktop-App Passwort – nur für OAuth-User ────────────── */}
          {isOAuthUser && (
            <div className="bg-surface border border-line rounded-lg p-8 mb-8 border border-line">
              <div className="flex items-center mb-2">
                <Lock className="w-6 h-6 text-indigo-text mr-3" />
                <h2 className="text-2xl font-semibold text-ink">{t('desktopPassword.title')}</h2>
              </div>
              <p className="text-ink-muted text-sm mb-6">
                {t('desktopPassword.description')}
              </p>
              <div className="max-w-md space-y-4">
                <div>
                  <label className="block text-sm font-medium text-ink mb-2">{t('desktopPassword.newPasswordLabel')}</label>
                  <div className="relative">
                    <input
                      type={showDesktopPassword ? 'text' : 'password'}
                      value={desktopPassword}
                      onChange={e => { setDesktopPassword(e.target.value); setDesktopPasswordSuccess(''); setDesktopPasswordError('') }}
                      placeholder={t('desktopPassword.newPasswordPlaceholder')}
                      className="w-full bg-ghost-fill border border-line rounded-md px-4 py-3 pr-12 text-ink placeholder-ink-faint focus:outline-none focus:border-line-strong transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowDesktopPassword(p => !p)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-muted hover:text-ink transition-colors"
                    >
                      {showDesktopPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-ink mb-2">{t('desktopPassword.confirmLabel')}</label>
                  <input
                    type={showDesktopPassword ? 'text' : 'password'}
                    value={desktopPasswordConfirm}
                    onChange={e => { setDesktopPasswordConfirm(e.target.value); setDesktopPasswordSuccess(''); setDesktopPasswordError('') }}
                    placeholder={t('desktopPassword.confirmPlaceholder')}
                    className="w-full bg-ghost-fill border border-line rounded-md px-4 py-3 text-ink placeholder-ink-faint focus:outline-none focus:border-line-strong transition-colors"
                  />
                </div>
                {desktopPasswordError && (
                  <div className="flex items-center gap-2 p-3 bg-ghost-fill border border-danger rounded-sm">
                    <X className="w-4 h-4 text-danger flex-shrink-0" />
                    <p className="text-sm text-danger">{desktopPasswordError}</p>
                  </div>
                )}
                {desktopPasswordSuccess && (
                  <div className="flex items-center gap-2 p-3 bg-ghost-fill border border-line rounded-sm">
                    <Check className="w-4 h-4 text-success flex-shrink-0" />
                    <p className="text-sm text-success">{desktopPasswordSuccess}</p>
                  </div>
                )}
                <button
                  onClick={setDesktopPasswordHandler}
                  disabled={settingDesktopPassword || !desktopPassword || !desktopPasswordConfirm}
                  className="flex items-center gap-2 px-6 py-3 bg-indigo-button hover:bg-indigo-hover text-on-indigo shadow-button-edge font-semibold rounded-md transition duration-200 ease-out disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {settingDesktopPassword
                    ? <><RefreshCw className="w-4 h-4 animate-spin" /><span>{t('desktopPassword.saving')}</span></>
                    : <><Lock className="w-4 h-4" /><span>{hasDesktopPassword ? t('desktopPassword.changeButton') : t('desktopPassword.setButton')}</span></>}
                </button>
              </div>
            </div>
          )}

          {/* ── Abo verwalten ──────────────────────────────────────── */}
          {hasPaid && (
            <div className="bg-surface border border-line rounded-lg p-8 mb-8 border border-line">
              <div className="flex items-center gap-3 mb-6">
                <CreditCard className="w-6 h-6 text-indigo-text" />
                <h2 className="text-2xl font-semibold text-ink">{t('subscription.title')}</h2>
              </div>

              {/* Status: Lifetime > Gratiszeit (Promo) > Abo */}
              <div className="flex flex-wrap items-center gap-3 mb-6">
                {lifetimeAccess ? (
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-semibold border bg-indigo-soft border-line text-indigo-text">
                    <span className="w-2 h-2 rounded-full bg-indigo-soft" />
                    {t('subscription.statusLifetime')}
                  </div>
                ) : !hasSubscription && promoAccessUntil ? (
                  <>
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-semibold border bg-ghost-fill border-warning text-warning">
                      <span className="w-2 h-2 rounded-full bg-warning" />
                      {isTrial ? t('subscription.statusTrial') : t('subscription.statusPromo')}
                    </div>
                    {(() => {
                      const d = new Date(promoAccessUntil)
                      const days = Math.max(0, Math.ceil((d.getTime() - Date.now()) / 86400000))
                      return (
                        <span className="text-sm text-warning font-medium">
                          {t('subscription.expiresOn', { date: d.toLocaleDateString(dateLocale, { day: '2-digit', month: 'long', year: 'numeric' }), days })}
                        </span>
                      )
                    })()}
                  </>
                ) : (
                  <>
                    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-semibold border ${
                      subscriptionCancelAt
                        ? 'bg-ghost-fill border-warning text-warning'
                        : 'bg-ghost-fill border-success text-success'
                    }`}>
                      <span className={`w-2 h-2 rounded-full ${
                        subscriptionCancelAt ? 'bg-warning' : 'bg-success'
                      }`} />
                      {subscriptionCancelAt ? t('subscription.statusCanceling') : t('subscription.statusActive')}
                    </div>
                    {subscriptionCancelAt && (() => {
                      const d = new Date(subscriptionCancelAt)
                      const days = Math.ceil((d.getTime() - Date.now()) / 86400000)
                      return (
                        <span className="text-sm text-warning font-medium">
                          {t('subscription.expiresOn', { date: d.toLocaleDateString(dateLocale, { day: '2-digit', month: 'long', year: 'numeric' }), days })}
                        </span>
                      )
                    })()}
                  </>
                )}
              </div>

              {/* Info-Kacheln */}
              <div className="grid sm:grid-cols-2 gap-3 mb-6">
                <div className="bg-surface border border-line rounded-md p-4 border border-line">
                  <p className="text-xs text-ink-faint mb-1">{t('subscription.includedTitle')}</p>
                  <p className="text-sm text-ink">{t('subscription.includedText')}</p>
                </div>
                {hasSubscription && (
                  <div className="bg-surface border border-line rounded-md p-4 border border-line">
                    <p className="text-xs text-ink-faint mb-1">{t('subscription.portalTitle')}</p>
                    <p className="text-sm text-ink">{t('subscription.portalText')}</p>
                  </div>
                )}
              </div>

              {/* Aktion: Stripe-Portal nur mit echtem Abo; Promo-User → Payment-Seite; Lifetime → nichts nötig */}
              {hasSubscription ? (
                <>
                  <button
                    onClick={handlePortal}
                    disabled={redirectingToPortal}
                    className="press flex items-center gap-2 px-6 py-3 bg-ghost-fill hover:bg-surface-raised border border-line-strong hover:border-line-strong text-ink font-semibold rounded-md transition duration-200 ease-out disabled:opacity-50"
                  >
                    {redirectingToPortal
                      ? <><RefreshCw className="w-4 h-4 animate-spin" /> {t('subscription.redirecting')}</>
                      : <><ExternalLink className="w-4 h-4" /> {t('subscription.manageButton')}</>
                    }
                  </button>
                  <p className="text-xs text-ink-faint mt-3">{t('subscription.redirectNote')}</p>
                </>
              ) : !lifetimeAccess && promoAccessUntil ? (
                <button
                  onClick={handlePayment}
                  disabled={redirectingToPayment}
                  className="press flex items-center gap-2 px-6 py-3 bg-indigo-button hover:bg-indigo-hover text-on-indigo shadow-button-edge font-semibold rounded-md transition duration-200 ease-out disabled:opacity-50"
                >
                  {redirectingToPayment
                    ? <><RefreshCw className="w-4 h-4 animate-spin" /> {t('subscription.redirecting')}</>
                    : <>{t('subscription.subscribeButton')}</>}
                </button>
              ) : null}
            </div>
          )}

          {/* ── CLI ───────────────────────────────────────────────── */}
          <div className="bg-surface border border-line rounded-lg p-8 mb-8 border border-line relative overflow-hidden">
            {/* Coming Soon Overlay */}
            <div className="absolute inset-0 bg-surface z-10 flex flex-col items-center justify-center gap-3 rounded-lg">
              <span className="text-4xl"></span>
              <span className="text-ink font-semibold text-2xl">{t('cli.comingSoonBadge')}</span>
              <span className="text-ink-muted text-sm text-center max-w-xs px-4">
                {t('cli.comingSoonText')}
              </span>
            </div>
            {/* Blurred background preview */}
            <h2 className="text-2xl font-semibold text-ink mb-4 blur-sm select-none">{t('cli.title')}</h2>
            <p className="text-ink-muted mb-4 blur-sm select-none">{t('cli.intro')}</p>
            <div className="bg-surface rounded-sm p-4 mb-4 blur-sm select-none">
              <code className="text-success font-mono text-sm">pip install frametrain-cli</code>
            </div>
            <div className="bg-surface rounded-sm p-4 blur-sm select-none">
              <code className="text-success font-mono text-sm">frametrain verify-key ft_sk_xxxxxxxxxxxx</code>
            </div>
          </div>

          {/* ── SUPPORT ──────────────────────────────────────────── */}
          <div id="support-section" className="bg-surface border border-line rounded-lg border border-line overflow-hidden">
            {/* Header */}
            <button
              onClick={() => {
                const opening = !supportOpen
                setSupportOpen(opening)
                if (opening) {
                  // Mark all tickets seen
                  getAll().forEach(t => {
                    localStorage.setItem(`ft_ticket_seen_${t.ticket_id}`, Date.now().toString())
                  })
                  setSupportBadge(0)
                }
              }}
              className="w-full flex items-center justify-between px-8 py-6 hover:bg-ghost-fill transition-colors relative"
            >
              {/* Unread admin reply badge */}
              {supportBadge > 0 && !supportOpen && (
                <span className="absolute top-3 right-16 flex items-center justify-center w-5 h-5 rounded-full bg-danger text-ink text-[11px] font-semibold animate-enter">
                  {supportBadge}
                </span>
              )}
              <div className="flex items-center gap-3">
                <MessageCircle className="w-6 h-6 text-indigo-text" />
                <h2 className="text-2xl font-semibold text-ink">{t('support.title')}</h2>
                {storedTickets.length > 0 && (
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-indigo-soft text-indigo-text border border-line">
                    {t('support.ticketCount', { count: storedTickets.length })}
                  </span>
                )}
              </div>
              <ChevronDown className={`w-5 h-5 text-ink-muted transition-transform duration-200 ${supportOpen ? 'rotate-180' : ''}`} />
            </button>

            {supportOpen && (
              <div className="border-t border-line">
                {/* Sub-nav */}
                <div className="flex border-b border-line">
                  {[
                    { id: 'list' as const, label: t('support.tabTickets') },
                    { id: 'new' as const, label: t('support.tabNew') },
                  ].map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => { setSupportView(tab.id); setActiveTicket(null) }}
                      className={`px-6 py-3 text-sm font-semibold transition-colors ${supportView === tab.id || (supportView === 'thread' && tab.id === 'list') ? 'text-indigo-text border-b-2 border-line-strong' : 'text-ink-muted hover:text-ink'}`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                <div className="p-8">
                  {/* ── New ticket form ── */}
                  {supportView === 'new' && (
                    <div className="max-w-2xl">
                      <h3 className="text-lg font-semibold text-ink mb-6">{t('support.newTitle')}</h3>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-ink mb-2">{t('support.subjectLabel')}</label>
                          <input
                            value={newSubject}
                            onChange={e => setNewSubject(e.target.value)}
                            placeholder={t('support.subjectPlaceholder')}
                            className="w-full bg-ghost-fill border border-line rounded-md px-4 py-3 text-ink placeholder-ink-faint focus:outline-none focus:border-line-strong transition-colors"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-ink mb-2">{t('support.messageLabel')}</label>
                          <textarea
                            value={newMessage}
                            onChange={e => setNewMessage(e.target.value)}
                            placeholder={t('support.messagePlaceholder')}
                            rows={5}
                            className="w-full bg-ghost-fill border border-line rounded-md px-4 py-3 text-ink placeholder-ink-faint focus:outline-none focus:border-line-strong transition-colors resize-none"
                          />
                        </div>
                        <div className="flex items-center gap-3 pt-2">
                          <p className="text-xs text-ink-faint flex-1">
                            {t.rich('support.userIdNote', { id: user?.id || '', code: (chunks) => <code className="text-indigo-text bg-ghost-fill px-1 rounded">{chunks}</code> })}
                          </p>
                          <button
                            onClick={submitTicket}
                            disabled={submitting || !newSubject.trim() || !newMessage.trim()}
                            className="flex items-center gap-2 px-6 py-3 bg-indigo-button hover:bg-indigo-hover text-on-indigo shadow-button-edge font-semibold rounded-md transition duration-200 ease-out disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {submitting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                            {submitting ? t('support.submitting') : t('support.submitButton')}
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* ── Ticket list ── */}
                  {supportView === 'list' && !activeTicket && (
                    <div>
                      {storedTickets.length === 0 ? (
                        <div className="text-center py-12">
                          <div className="text-5xl mb-4"></div>
                          <p className="text-ink-muted mb-2">{t('support.emptyTitle')}</p>
                          <p className="text-ink-faint text-sm mb-6">{t('support.emptyText')}</p>
                          <button
                            onClick={() => setSupportView('new')}
                            className="flex items-center gap-2 px-5 py-2.5 bg-indigo-button hover:bg-indigo-button text-ink rounded-sm transition-colors mx-auto text-sm font-semibold"
                          >
                            <Plus className="w-4 h-4" /> {t('support.emptyButton')}
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-ink">{t('support.yourTickets')}</h3>
                            <button
                              onClick={() => setSupportView('new')}
                              className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-soft hover:bg-indigo-soft text-indigo-text rounded-sm text-sm transition-colors border border-line"
                            >
                              <Plus className="w-3.5 h-3.5" /> {t('support.newTicketButton')}
                            </button>
                          </div>
                          {storedTickets.map(t2 => (
                            <button
                              key={t2.ticket_id}
                              onClick={() => openThread(t2)}
                              className="card-lift w-full flex items-center justify-between bg-surface border border-line rounded-md px-5 py-4 border border-line hover:border-line hover:bg-ghost-fill transition duration-200 ease-out text-left"
                            >
                              <div>
                                <p className="text-ink font-semibold text-sm">{t2.subject}</p>
                                <p className="text-ink-faint text-xs mt-0.5">{t('support.ticketNumber', { id: t2.ticket_id })}</p>
                              </div>
                              <MessageCircle className="w-4 h-4 text-ink-faint" />
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* ── Thread view ── */}
                  {supportView === 'thread' && activeTicket && (
                    <div className="max-w-2xl">
                      {/* Back */}
                      <button
                        onClick={() => { setSupportView('list'); setActiveTicket(null) }}
                        className="flex items-center gap-1.5 text-ink-muted hover:text-ink text-sm mb-5 transition-colors"
                      >
                        {t('support.backToOverview')}
                      </button>

                      {threadLoading ? (
                        <div className="flex items-center justify-center py-12">
                          <RefreshCw className="w-6 h-6 text-indigo-text animate-spin" />
                        </div>
                      ) : (
                        <>
                          {/* Ticket meta */}
                          <div className="bg-surface border border-line rounded-md px-5 py-4 border border-line mb-5">
                            <div className="flex items-start justify-between gap-4">
                              <div>
                                <h3 className="text-ink font-semibold">{activeTicket.subject}</h3>
                                <p className="text-ink-faint text-xs mt-0.5">{t('support.ticketNumber', { id: activeTicket.ticket_id })}</p>
                              </div>
                              {ticketInfo && (
                                <span className={`text-xs font-semibold px-3 py-1 rounded-full border flex-shrink-0 ${STATUS_COLOR[ticketInfo.status] || STATUS_COLOR.open}`}>
                                  {t(`status.${ticketInfo.status}` as any) || ticketInfo.status}
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Messages */}
                          <div className="space-y-4 mb-5 max-h-96 overflow-y-auto pr-1">
                            {messages.length === 0 && (
                              <p className="text-center text-ink-faint text-sm py-8">{t('support.noMessages')}</p>
                            )}
                            {messages.map(m => (
                              <div key={m.id} className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[78%] rounded-lg px-4 py-3 text-sm leading-relaxed ${
                                  m.sender === 'user'
                                    ? 'bg-indigo-button hover:bg-indigo-hover   text-ink rounded-br-sm'
                                    : 'bg-surface border border-line border border-line text-ink rounded-bl-sm'
                                }`}>
                                  <p style={{ whiteSpace: 'pre-wrap' }}>{m.message}</p>
                                  <p className={`text-xs mt-1.5 ${m.sender === 'user' ? 'text-indigo-text' : 'text-ink-faint'}`}>
                                    {m.sender === 'user' ? t('support.you') : t('support.supportLabel')} · {new Date(m.created_at).toLocaleString(dateLocale, { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                                  </p>
                                </div>
                              </div>
                            ))}
                            <div ref={messagesEndRef} />
                          </div>

                          {/* Reply box – nur wenn nicht geschlossen */}
                          {ticketInfo?.status !== 'closed' && ticketInfo?.status !== 'resolved' ? (
                            <div className="flex gap-3">
                              <textarea
                                value={replyText}
                                onChange={e => setReplyText(e.target.value)}
                                onKeyDown={e => { if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) sendReply() }}
                                placeholder={t('support.replyPlaceholder')}
                                rows={3}
                                className="flex-1 bg-ghost-fill border border-line rounded-md px-4 py-3 text-ink placeholder-ink-faint focus:outline-none focus:border-line-strong transition-colors resize-none text-sm"
                              />
                              <button
                                onClick={sendReply}
                                disabled={sendingReply || !replyText.trim()}
                                className="press self-end flex items-center gap-1.5 px-5 py-3 bg-indigo-button hover:bg-indigo-button text-ink rounded-md transition-colors disabled:opacity-50 font-semibold text-sm"
                              >
                                {sendingReply ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                              </button>
                            </div>
                          ) : (
                            <div className="bg-surface border border-line rounded-md px-4 py-3 border border-line text-center text-ink-faint text-sm">
                              {t('support.statusClosedNote', { status: (t(`status.${ticketInfo.status}` as any) || '').toLowerCase() })}
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

        </div>
      </main>

      {/* Community Name Error Modal */}
      {communityNameError && (
        <CommunityNameErrorModal
          name={communityNameError}
          onClose={() => setCommunityNameError(null)}
          t={t}
        />
      )}

      <Footer />
    </div>
  )
}

export default function DashboardPage() {
  return (
    <Suspense>
      <DashboardPageInner />
    </Suspense>
  )
}
