'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import {
  Download, Key, Copy, Check, ExternalLink, X, RefreshCw,
  Lightbulb, MessageCircle, Send, ChevronDown, Plus,
} from 'lucide-react'

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
const STATUS_LABEL: Record<string, string> = {
  open: 'Offen',
  in_progress: 'In Bearbeitung',
  resolved: 'Gelöst',
  closed: 'Geschlossen',
}
const STATUS_COLOR: Record<string, string> = {
  open: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
  in_progress: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20',
  resolved: 'text-green-400 bg-green-500/10 border-green-500/20',
  closed: 'text-gray-400 bg-gray-500/10 border-gray-500/20',
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

// ── Main Dashboard ─────────────────────────────────────────────────
export default function DashboardPage() {
  const router = useRouter()
  const { user, isAuthenticated, loading: authLoading } = useAuth()
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([])
  const [copiedKey, setCopiedKey] = useState<string | null>(null)
  const [dataLoading, setDataLoading] = useState(true)
  const [regenerating, setRegenerating] = useState(false)
  const [redirectingToPayment, setRedirectingToPayment] = useState(false)
  const [appVersion, setAppVersion] = useState('...')

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

  // ── Auth redirect ──────────────────────────────────────────────
  useEffect(() => {
    if (!authLoading && !isAuthenticated) router.push('/login')
  }, [authLoading, isAuthenticated, router])

  useEffect(() => {
    if (isAuthenticated && user) fetchDashboardData()
  }, [isAuthenticated, user])

  useEffect(() => { fetchAppVersion() }, [])

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
    } catch { /* silent */ } finally { setDataLoading(false) }
  }

  const fetchAppVersion = async () => {
    try {
      const res = await fetch('/api/app-version')
      if (res.ok) { const d = await res.json(); setAppVersion(d.version || '1.0.0') }
    } catch { setAppVersion('1.0.0') }
  }

  const regenerateKey = async () => {
    if (!confirm('Möchtest du wirklich einen neuen API-Key generieren? Der alte wird ungültig!')) return
    setRegenerating(true)
    try {
      const res = await fetch('/api/keys/regenerate', { method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' } })
      if (!res.ok) throw new Error()
      await fetchDashboardData()
      alert('✅ Neuer API-Key erfolgreich generiert!')
    } catch { alert('❌ Fehler beim Generieren des neuen Keys') } finally { setRegenerating(false) }
  }

  const copyToClipboard = (key: string) => {
    navigator.clipboard.writeText(key)
    setCopiedKey(key)
    setTimeout(() => setCopiedKey(null), 2000)
  }

  const handlePayment = async () => {
    setRedirectingToPayment(true)
    try {
      const res = await fetch('/api/payment/create-checkout', { method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' } })
      if (!res.ok) throw new Error()
      const data = await res.json()
      if (data.url) window.location.href = data.url
    } catch { alert('❌ Fehler beim Weiterleiten zur Zahlung'); setRedirectingToPayment(false) }
  }

  const downloadApp = async (platform: 'windows' | 'mac' | 'linux') => {
    const activeKey = apiKeys.find(k => k.isActive)
    if (!activeKey) { alert('❌ Du brauchst einen aktiven API-Key'); return }
    try {
      const res = await fetch(`/api/download-app?platform=${platform}&key=${activeKey.key}`, { credentials: 'include' })
      if (!res.ok) { const e = await res.json(); alert(`❌ ${e.message || 'Download fehlgeschlagen'}`); return }
      const data = await res.json()
      if (data.download_url) window.location.href = data.download_url
    } catch { alert('❌ Fehler beim Herunterladen') }
  }

  // ── Support actions ────────────────────────────────────────────
  const submitTicket = async () => {
    if (!newSubject.trim() || !newMessage.trim()) { alert('Bitte Betreff und Nachricht ausfüllen'); return }
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
    } catch { alert('❌ Fehler beim Einreichen des Tickets') } finally { setSubmitting(false) }
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
    } catch { alert('❌ Senden fehlgeschlagen'); setReplyText(text) } finally { setSendingReply(false) }
  }

  // ── Loading / auth guard ───────────────────────────────────────
  if (authLoading || dataLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="text-white text-xl">Lädt...</div>
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
            <h1 className="text-4xl font-bold text-white mb-2">Dashboard</h1>
            <p className="text-gray-400">Willkommen, {user?.email}</p>
          </div>

          {/* ── API Keys ─────────────────────────────────────────── */}
          <div className="glass-strong rounded-2xl shadow-lg p-8 mb-8 border border-white/10">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <Key className="w-6 h-6 text-purple-400 mr-3" />
                <h2 className="text-2xl font-bold text-white">Deine API-Keys</h2>
              </div>
              {activeKey && (
                <button
                  onClick={regenerateKey}
                  disabled={regenerating}
                  className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <RefreshCw className={`w-4 h-4 ${regenerating ? 'animate-spin' : ''}`} />
                  {regenerating ? 'Generiere...' : 'Neuen Key generieren'}
                </button>
              )}
            </div>

            {apiKeys.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-400 mb-4">Du hast noch keine API-Keys.</p>
                <p className="text-gray-500 text-sm mb-6">API-Keys werden automatisch nach erfolgreicher Zahlung erstellt.</p>
                <button
                  onClick={handlePayment}
                  disabled={redirectingToPayment}
                  className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold rounded-lg transition-all disabled:opacity-50 flex items-center gap-2 mx-auto"
                >
                  {redirectingToPayment ? <><RefreshCw className="w-5 h-5 animate-spin" /><span>Weiterleitung...</span></> : <><Key className="w-5 h-5" /><span>Jetzt bezahlen & API-Key erhalten</span></>}
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {apiKeys.map((apiKey) => (
                  <div key={apiKey.id} className={`glass rounded-lg p-4 border ${apiKey.isActive ? 'border-green-400/20' : 'border-white/10'}`}>
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <code className="text-purple-400 font-mono text-sm bg-black/30 px-3 py-1 rounded border border-white/10">{apiKey.key}</code>
                          <button onClick={() => copyToClipboard(apiKey.key)} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                            {copiedKey === apiKey.key ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4 text-gray-400" />}
                          </button>
                        </div>
                        <div className="flex items-center space-x-4 text-sm text-gray-400">
                          <span>Erstellt: {new Date(apiKey.createdAt).toLocaleDateString('de-DE')}</span>
                          {apiKey.lastUsedAt && <span>Zuletzt genutzt: {new Date(apiKey.lastUsedAt).toLocaleDateString('de-DE')}</span>}
                          <span className={`flex items-center gap-1 ${apiKey.isActive ? 'text-green-400' : 'text-red-400'}`}>
                            {apiKey.isActive ? <><Check className="w-4 h-4" /><span>Aktiv</span></> : <><X className="w-4 h-4" /><span>Inaktiv</span></>}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ── Download ─────────────────────────────────────────── */}
          <div className="glass-strong rounded-2xl shadow-lg p-8 mb-8 border border-white/10">
            <div className="flex items-center mb-6">
              <Download className="w-6 h-6 text-purple-400 mr-3" />
              <h2 className="text-2xl font-bold text-white">Desktop-App herunterladen</h2>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              {[
                { platform: 'windows' as const, label: 'Windows', ext: '.exe', gradient: 'from-blue-500 to-cyan-500' },
                { platform: 'mac' as const, label: 'macOS', ext: '.dmg', gradient: 'from-purple-500 to-pink-500' },
                { platform: 'linux' as const, label: 'Linux', ext: '.AppImage', gradient: 'from-green-500 to-emerald-500' },
              ].map(({ platform, label, ext, gradient }) => (
                <button
                  key={platform}
                  onClick={() => downloadApp(platform)}
                  disabled={!activeKey}
                  className="glass-strong hover:bg-white/10 border border-white/10 rounded-xl p-6 transition-all group disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="text-center">
                    <div className={`w-16 h-16 mx-auto mb-4 bg-gradient-to-br ${gradient} rounded-2xl flex items-center justify-center`}>
                      <Download className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-xl font-semibold text-white mb-2">{label}</h3>
                    <p className="text-gray-400 text-sm mb-4">Version {appVersion}</p>
                    <div className="flex items-center justify-center text-purple-400 group-hover:text-purple-300">
                      <Download className="w-4 h-4 mr-2" />
                      <span className="font-semibold">Download {ext}</span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
            <div className="mt-8 p-4 glass border border-blue-400/20 rounded-lg">
              <p className="text-gray-300 text-sm flex items-start gap-2">
                <Lightbulb className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                <span>Beim ersten Öffnen könnte eine Sicherheitswarnung erscheinen.
                  <a href="/install" className="text-purple-400 hover:text-purple-300 underline ml-1">Siehe Installations-Guide</a> für Details.
                </span>
              </p>
            </div>
          </div>

          {/* ── CLI ───────────────────────────────────────────────── */}
          <div className="glass-strong rounded-2xl shadow-lg p-8 mb-8 border border-white/10">
            <h2 className="text-2xl font-bold text-white mb-4">CLI Installation</h2>
            <p className="text-gray-400 mb-4">Installiere die FrameTrain CLI für erweiterte Funktionen:</p>
            <div className="bg-gray-900 rounded-lg p-4 mb-4">
              <code className="text-green-400 font-mono text-sm">pip install frametrain-cli</code>
            </div>
            {activeKey && (
              <div className="bg-gray-900 rounded-lg p-4 mb-4">
                <code className="text-green-400 font-mono text-sm">frametrain verify-key {activeKey.key}</code>
              </div>
            )}
            <a href="/docs" className="inline-flex items-center text-purple-400 hover:text-purple-300">
              <ExternalLink className="w-4 h-4 mr-2" />Zur vollständigen Dokumentation
            </a>
          </div>

          {/* ── SUPPORT ──────────────────────────────────────────── */}
          <div className="glass-strong rounded-2xl shadow-lg border border-white/10 overflow-hidden">
            {/* Header (always visible, clickable to toggle) */}
            <button
              onClick={() => setSupportOpen(o => !o)}
              className="w-full flex items-center justify-between px-8 py-6 hover:bg-white/5 transition-colors"
            >
              <div className="flex items-center gap-3">
                <MessageCircle className="w-6 h-6 text-purple-400" />
                <h2 className="text-2xl font-bold text-white">Support</h2>
                {storedTickets.length > 0 && (
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                    {storedTickets.length} Ticket{storedTickets.length !== 1 ? 's' : ''}
                  </span>
                )}
              </div>
              <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${supportOpen ? 'rotate-180' : ''}`} />
            </button>

            {supportOpen && (
              <div className="border-t border-white/10">
                {/* Sub-nav */}
                <div className="flex border-b border-white/10">
                  {[
                    { id: 'list' as const, label: '📬 Meine Tickets' },
                    { id: 'new' as const, label: '✏️ Neues Ticket' },
                  ].map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => { setSupportView(tab.id); setActiveTicket(null) }}
                      className={`px-6 py-3 text-sm font-semibold transition-colors ${supportView === tab.id || (supportView === 'thread' && tab.id === 'list') ? 'text-purple-400 border-b-2 border-purple-400' : 'text-gray-400 hover:text-white'}`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                <div className="p-8">
                  {/* ── New ticket form ── */}
                  {supportView === 'new' && (
                    <div className="max-w-2xl">
                      <h3 className="text-lg font-bold text-white mb-6">Neues Support-Ticket</h3>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">Betreff</label>
                          <input
                            value={newSubject}
                            onChange={e => setNewSubject(e.target.value)}
                            placeholder="Kurze Beschreibung deines Problems..."
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50 transition-colors"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">Nachricht</label>
                          <textarea
                            value={newMessage}
                            onChange={e => setNewMessage(e.target.value)}
                            placeholder="Beschreibe dein Anliegen so detailliert wie möglich..."
                            rows={5}
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50 transition-colors resize-none"
                          />
                        </div>
                        <div className="flex items-center gap-3 pt-2">
                          <p className="text-xs text-gray-500 flex-1">
                            Deine User-ID <code className="text-purple-400 bg-white/5 px-1 rounded">{user?.id}</code> wird automatisch mitgeschickt.
                          </p>
                          <button
                            onClick={submitTicket}
                            disabled={submitting || !newSubject.trim() || !newMessage.trim()}
                            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {submitting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                            {submitting ? 'Wird gesendet...' : 'Ticket einreichen'}
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
                          <div className="text-5xl mb-4">📭</div>
                          <p className="text-gray-400 mb-2">Du hast noch keine Support-Tickets.</p>
                          <p className="text-gray-500 text-sm mb-6">Hast du ein Problem oder eine Frage? Wir helfen gerne.</p>
                          <button
                            onClick={() => setSupportView('new')}
                            className="flex items-center gap-2 px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors mx-auto text-sm font-semibold"
                          >
                            <Plus className="w-4 h-4" /> Erstes Ticket erstellen
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-bold text-white">Deine Tickets</h3>
                            <button
                              onClick={() => setSupportView('new')}
                              className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 rounded-lg text-sm transition-colors border border-purple-500/20"
                            >
                              <Plus className="w-3.5 h-3.5" /> Neues Ticket
                            </button>
                          </div>
                          {storedTickets.map(t => (
                            <button
                              key={t.ticket_id}
                              onClick={() => openThread(t)}
                              className="w-full flex items-center justify-between glass rounded-xl px-5 py-4 border border-white/10 hover:border-purple-500/30 hover:bg-white/5 transition-all text-left"
                            >
                              <div>
                                <p className="text-white font-semibold text-sm">{t.subject}</p>
                                <p className="text-gray-500 text-xs mt-0.5">Ticket #{t.ticket_id}</p>
                              </div>
                              <MessageCircle className="w-4 h-4 text-gray-500" />
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
                        className="flex items-center gap-1.5 text-gray-400 hover:text-white text-sm mb-5 transition-colors"
                      >
                        ← Zurück zur Übersicht
                      </button>

                      {threadLoading ? (
                        <div className="flex items-center justify-center py-12">
                          <RefreshCw className="w-6 h-6 text-purple-400 animate-spin" />
                        </div>
                      ) : (
                        <>
                          {/* Ticket meta */}
                          <div className="glass rounded-xl px-5 py-4 border border-white/10 mb-5">
                            <div className="flex items-start justify-between gap-4">
                              <div>
                                <h3 className="text-white font-bold">{activeTicket.subject}</h3>
                                <p className="text-gray-500 text-xs mt-0.5">Ticket #{activeTicket.ticket_id}</p>
                              </div>
                              {ticketInfo && (
                                <span className={`text-xs font-bold px-3 py-1 rounded-full border flex-shrink-0 ${STATUS_COLOR[ticketInfo.status] || STATUS_COLOR.open}`}>
                                  {STATUS_LABEL[ticketInfo.status] || ticketInfo.status}
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Messages */}
                          <div className="space-y-4 mb-5 max-h-96 overflow-y-auto pr-1">
                            {messages.length === 0 && (
                              <p className="text-center text-gray-500 text-sm py-8">Noch keine Nachrichten</p>
                            )}
                            {messages.map(m => (
                              <div key={m.id} className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[78%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                                  m.sender === 'user'
                                    ? 'bg-gradient-to-br from-purple-600 to-pink-600 text-white rounded-br-sm'
                                    : 'glass border border-white/10 text-gray-200 rounded-bl-sm'
                                }`}>
                                  <p style={{ whiteSpace: 'pre-wrap' }}>{m.message}</p>
                                  <p className={`text-xs mt-1.5 ${m.sender === 'user' ? 'text-purple-200' : 'text-gray-500'}`}>
                                    {m.sender === 'user' ? 'Du' : '🔧 Support'} · {new Date(m.created_at).toLocaleString('de-DE', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
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
                                placeholder="Nachricht schreiben... (Strg+Enter zum Senden)"
                                rows={3}
                                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50 transition-colors resize-none text-sm"
                              />
                              <button
                                onClick={sendReply}
                                disabled={sendingReply || !replyText.trim()}
                                className="self-end flex items-center gap-1.5 px-5 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl transition-colors disabled:opacity-50 font-semibold text-sm"
                              >
                                {sendingReply ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                              </button>
                            </div>
                          ) : (
                            <div className="glass rounded-xl px-4 py-3 border border-white/10 text-center text-gray-500 text-sm">
                              Dieses Ticket ist {STATUS_LABEL[ticketInfo.status]?.toLowerCase()} – du kannst kein weiteres Ticket erstellen wenn du noch Fragen hast.
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

      <Footer />
    </div>
  )
}
