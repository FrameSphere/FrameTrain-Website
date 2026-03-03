'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { Sparkles, Zap, Bug, Shield, Rocket, RefreshCw } from 'lucide-react'

const MANAGER_API = process.env.NEXT_PUBLIC_MANAGER_API_URL || 'https://webcontrol-hq-api.karol-paschek.workers.dev'

interface ChangelogEntry {
  id: number
  version: string
  title: string
  description: string | null
  type: 'feature' | 'fix' | 'improvement' | 'breaking' | 'security'
  published: number
  created_at: string
}

// ── Icon / style helpers ──────────────────────────────────────────
function getChangeIcon(type: string) {
  const cls = 'w-4 h-4 flex-shrink-0 mt-0.5'
  switch (type) {
    case 'feature':     return <Sparkles className={`${cls} text-purple-400`} />
    case 'improvement': return <Zap       className={`${cls} text-blue-400`} />
    case 'fix':         return <Bug       className={`${cls} text-orange-400`} />
    case 'security':    return <Shield    className={`${cls} text-green-400`} />
    case 'breaking':    return <span className="text-sm flex-shrink-0 mt-0.5">💥</span>
    default:            return <Sparkles className={`${cls} text-gray-400`} />
  }
}

const TYPE_LABEL: Record<string, string> = {
  feature:     'New',
  improvement: 'Improved',
  fix:         'Fixed',
  security:    'Security',
  breaking:    'Breaking',
}

const TYPE_COLOR: Record<string, string> = {
  feature:     'text-purple-400 bg-purple-500/10 border-purple-500/20',
  improvement: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
  fix:         'text-orange-400 bg-orange-500/10 border-orange-500/20',
  security:    'text-green-400 bg-green-500/10 border-green-500/20',
  breaking:    'text-red-400 bg-red-500/10 border-red-500/20',
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('de-DE', { year: 'numeric', month: 'long', day: 'numeric' })
}

// ── Static fallback releases (shown while API loads / on error) ───
const STATIC_RELEASES = [
  {
    version: '0.9.2',
    date: '2025-01-15',
    tag: 'Early Access',
    tagColor: 'purple',
    entries: [
      { type: 'feature',     text: 'QLoRA (Quantized LoRA) – Training jetzt auch auf GPUs mit 6 GB VRAM' },
      { type: 'feature',     text: 'Apple M4 Chip: Verbesserte MPS-Performance durch optimierte Metal-Shader' },
      { type: 'improvement', text: 'Training Dashboard: Neue Verlust-Kurve mit Glättungsfilter (EMA)' },
      { type: 'fix',         text: 'Fixed: Gradient Checkpointing führte unter Windows zu Memory Leak' },
      { type: 'fix',         text: 'Fixed: GGUF Export bei Modellen über 7B Parameter' },
    ],
  },
  {
    version: '0.9.1',
    date: '2024-12-10',
    tag: 'Early Access',
    tagColor: 'purple',
    entries: [
      { type: 'feature',     text: 'BF16 Mixed Precision Training für NVIDIA Ampere+ GPUs' },
      { type: 'feature',     text: 'Datensatz-Validierung: Automatische Erkennung fehlerhafter JSON/JSONL-Zeilen' },
      { type: 'improvement', text: 'Startup-Zeit um ~40 % reduziert durch lazy loading der ML-Bibliotheken' },
      { type: 'security',    text: 'Dependency-Updates: PyTorch 2.2.1, Transformers 4.38.x, Safetensors 0.4.x' },
    ],
  },
  {
    version: '0.9.0',
    date: '2024-11-01',
    tag: 'Early Access Launch',
    tagColor: 'green',
    entries: [
      { type: 'feature', text: '🚀 Erster öffentlicher Early Access Launch von FrameTrain' },
      { type: 'feature', text: 'LoRA Fine-Tuning: Rank, Alpha, Dropout und Target-Module konfigurierbar' },
      { type: 'feature', text: 'HuggingFace Hub Integration: Direkter Modell-Import über Suchfunktion' },
      { type: 'feature', text: 'Live Training Monitor: Echtzeit-Charts für Loss, Accuracy und Lernrate' },
      { type: 'feature', text: 'GPU Support: NVIDIA CUDA ab GTX 1060, Apple Silicon M1/M2/M3' },
    ],
  },
]

export default function ChangelogPage() {
  const [apiEntries, setApiEntries] = useState<ChangelogEntry[] | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    fetch(`${MANAGER_API}/api/changelog/published?site_id=frametrain`)
      .then(r => r.json())
      .then((data: ChangelogEntry[]) => {
        setApiEntries(Array.isArray(data) ? data : [])
        setLoading(false)
      })
      .catch(() => {
        setError(true)
        setLoading(false)
      })
  }, [])

  // Group API entries by version
  const grouped: Record<string, ChangelogEntry[]> = {}
  if (apiEntries) {
    apiEntries.forEach(e => {
      grouped[e.version] = grouped[e.version] || []
      grouped[e.version].push(e)
    })
  }
  const versions = Object.keys(grouped).sort((a, b) => {
    // Sort by newest created_at within that version group
    const dateA = grouped[a][0].created_at
    const dateB = grouped[b][0].created_at
    return new Date(dateB).getTime() - new Date(dateA).getTime()
  })

  const hasApiData = apiEntries && apiEntries.length > 0

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1">
        {/* Hero */}
        <section className="relative py-20 px-4 border-b border-white/10">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-900/10 to-blue-900/10 pointer-events-none" />
          <div className="max-w-4xl mx-auto text-center relative">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-3xl mb-6">
              <Rocket className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-5xl md:text-6xl font-black text-white mb-6">Changelog</h1>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Alle Updates, neuen Features und Bugfixes – was sich in FrameTrain verändert hat.
            </p>
            <div className="mt-8 flex gap-6 justify-center text-sm text-gray-500 flex-wrap">
              {[
                { icon: <Sparkles className="w-4 h-4 text-purple-400" />, label: 'New Feature' },
                { icon: <Zap       className="w-4 h-4 text-blue-400" />,   label: 'Improvement' },
                { icon: <Bug       className="w-4 h-4 text-orange-400" />, label: 'Bugfix' },
                { icon: <Shield    className="w-4 h-4 text-green-400" />,  label: 'Security' },
              ].map(({ icon, label }) => (
                <div key={label} className="flex items-center gap-2">{icon}<span>{label}</span></div>
              ))}
            </div>
          </div>
        </section>

        {/* Releases */}
        <section className="py-16 px-4">
          <div className="max-w-4xl mx-auto space-y-12">

            {/* Loading state */}
            {loading && (
              <div className="flex items-center justify-center py-20 gap-3 text-gray-400">
                <RefreshCw className="w-5 h-5 animate-spin text-purple-400" />
                <span>Lade neueste Releases…</span>
              </div>
            )}

            {/* API entries */}
            {!loading && hasApiData && versions.map(version => {
              const entries = grouped[version]
              const latest = entries[0]
              return (
                <article key={version}>
                  <div className="flex items-center gap-4 mb-6 flex-wrap">
                    <div className="glass-strong rounded-2xl px-6 py-4 border border-white/10">
                      <div className="flex items-center gap-3 mb-1">
                        <span className="text-2xl font-black text-white">v{version}</span>
                        <span className="text-xs font-bold px-3 py-1 rounded-full border text-purple-400 bg-purple-500/10 border-purple-500/20">
                          Release
                        </span>
                      </div>
                      <div className="text-sm text-gray-500">{fmtDate(latest.created_at)}</div>
                    </div>
                  </div>

                  <div className="glass-strong rounded-2xl border border-white/10 overflow-hidden">
                    <div className="divide-y divide-white/5">
                      {entries.map(e => (
                        <div key={e.id} className="flex items-start gap-4 px-6 py-4 hover:bg-white/[0.02] transition-colors">
                          {getChangeIcon(e.type)}
                          <span className={`text-xs font-bold px-2 py-0.5 rounded border flex-shrink-0 mt-0.5 ${TYPE_COLOR[e.type] || TYPE_COLOR.feature}`}>
                            {TYPE_LABEL[e.type] || e.type}
                          </span>
                          <div>
                            <p className="text-white text-sm font-semibold">{e.title}</p>
                            {e.description && <p className="text-gray-400 text-sm mt-1 leading-relaxed">{e.description}</p>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </article>
              )
            })}

            {/* Static fallback (no API data or error) */}
            {!loading && !hasApiData && STATIC_RELEASES.map(release => (
              <article key={release.version}>
                <div className="flex items-center gap-4 mb-6 flex-wrap">
                  <div className="glass-strong rounded-2xl px-6 py-4 border border-white/10">
                    <div className="flex items-center gap-3 mb-1">
                      <span className="text-2xl font-black text-white">v{release.version}</span>
                      <span className={`text-xs font-bold px-3 py-1 rounded-full border ${
                        release.tagColor === 'green'
                          ? 'text-green-400 bg-green-500/10 border-green-500/20'
                          : 'text-purple-400 bg-purple-500/10 border-purple-500/20'
                      }`}>
                        {release.tag}
                      </span>
                    </div>
                    <div className="text-sm text-gray-500">{fmtDate(release.date)}</div>
                  </div>
                </div>

                <div className="glass-strong rounded-2xl border border-white/10 overflow-hidden">
                  <div className="divide-y divide-white/5">
                    {release.entries.map((change, i) => (
                      <div key={i} className="flex items-start gap-4 px-6 py-4 hover:bg-white/[0.02] transition-colors">
                        {getChangeIcon(change.type)}
                        <span className={`text-xs font-bold px-2 py-0.5 rounded border flex-shrink-0 mt-0.5 ${TYPE_COLOR[change.type] || TYPE_COLOR.feature}`}>
                          {TYPE_LABEL[change.type] || change.type}
                        </span>
                        <p className="text-gray-300 text-sm leading-relaxed">{change.text}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </article>
            ))}

            {/* Empty API response */}
            {!loading && !error && apiEntries && apiEntries.length === 0 && (
              <div className="text-center py-16 text-gray-500">
                <div className="text-4xl mb-4">🚀</div>
                <p>Noch keine Releases veröffentlicht – bald gibt's Neues!</p>
              </div>
            )}
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 px-4">
          <div className="max-w-2xl mx-auto text-center">
            <div className="glass-strong rounded-3xl p-10 border border-white/10">
              <h2 className="text-2xl font-bold text-white mb-4">Immer auf dem neuesten Stand</h2>
              <p className="text-gray-400 mb-6">
                FrameTrain erhält mit jeder Version automatisch Updates über den eingebauten Auto-Updater.
                Kein manuelles Herunterladen nötig.
              </p>
              <div className="flex gap-4 justify-center flex-wrap">
                <Link href="/register" className="relative group px-6 py-3 rounded-xl overflow-hidden inline-block">
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600" />
                  <span className="relative text-white font-semibold">Jetzt starten</span>
                </Link>
                <Link href="/docs" className="glass-strong px-6 py-3 rounded-xl text-gray-300 hover:text-white transition font-semibold">
                  Dokumentation
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
