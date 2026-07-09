'use client'

import { useState, useRef, useEffect, useMemo } from 'react'
import { useTranslations } from 'next-intl'
import { Search, X, ArrowRight } from 'lucide-react'

// ─── Sektions-Struktur (statisch, IDs nicht übersetzbar) ──────────────────────
// Titel/Beschreibung werden zur Laufzeit aus den Docs-Übersetzungen gezogen,
// damit der Suchindex automatisch DE/EN korrekt ist und nicht dupliziert wird.
const SECTIONS: { id: string; ns: string; group: string }[] = [
  { id: 'installation', ns: 'installation', group: 'gettingStarted' },
  { id: 'quick-start', ns: 'quickStart', group: 'gettingStarted' },
  { id: 'first-training', ns: 'firstTraining', group: 'gettingStarted' },
  { id: 'model-manager', ns: 'modelManager', group: 'appFeatures' },
  { id: 'training-panel', ns: 'trainingPanel', group: 'appFeatures' },
  { id: 'dataset-upload', ns: 'datasetUpload', group: 'appFeatures' },
  { id: 'analysis', ns: 'analysis', group: 'appFeatures' },
  { id: 'testing', ns: 'testing', group: 'appFeatures' },
  { id: 'versioning', ns: 'versioning', group: 'appFeatures' },
  { id: 'training-basics', ns: 'trainingBasics', group: 'training' },
  { id: 'hyperparameters', ns: 'hyperparameters', group: 'training' },
  { id: 'lora-training', ns: 'lora', group: 'training' },
  { id: 'datasets-format', ns: 'datasetsFormat', group: 'training' },
  { id: 'monitoring', ns: 'monitoring', group: 'training' },
  { id: 'optimization', ns: 'optimization', group: 'advanced' },
  { id: 'gpu-setup', ns: 'gpuSetup', group: 'advanced' },
  { id: 'export', ns: 'export', group: 'advanced' },
  { id: 'troubleshooting', ns: 'troubleshooting', group: 'advanced' },
  { id: 'settings', ns: 'settings', group: 'advanced' },
  { id: 'themes', ns: 'themes', group: 'resources' },
  { id: 'presets', ns: 'presets', group: 'resources' },
  { id: 'updates', ns: 'updates', group: 'resources' },
]

interface Result {
  title: string
  desc: string
  section: string
  chapter: string
}

interface AppDocSearchProps {
  onNavigate: (section: string) => void
}

export function AppDocSearch({ onNavigate }: AppDocSearchProps) {
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const wrapperRef = useRef<HTMLDivElement>(null)
  const t = useTranslations('Docs')
  const tSearch = useTranslations('AppDocSearch')

  // Suchindex zur Laufzeit aus den Docs-Übersetzungen bauen (DE/EN automatisch korrekt)
  const searchIndex = useMemo<Result[]>(() => {
    return SECTIONS.map(s => {
      let desc = ''
      try {
        desc = t(`${s.ns}.subtitle`)
      } catch {
        desc = ''
      }
      return {
        title: t(`${s.ns}.heading`),
        desc,
        section: s.id,
        chapter: t(`navigation.${s.group}.title`),
      }
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const results = useMemo<Result[]>(() => {
    if (!query.trim()) return []
    const q = query.toLowerCase()
    return searchIndex
      .filter(item =>
        item.title.toLowerCase().includes(q) ||
        item.desc.toLowerCase().includes(q) ||
        item.chapter.toLowerCase().includes(q)
      )
      .slice(0, 8)
  }, [query, searchIndex])

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  function handleSelect(result: Result) {
    setOpen(false)
    setQuery('')
    onNavigate(result.section)
    // Scroll to top of content smoothly
    window.scrollTo({ top: 400, behavior: 'smooth' })
  }

  const popular = tSearch.raw('popularTags') as string[]

  return (
    <div ref={wrapperRef} className="relative w-full">
      {/* Trigger */}
      <button
        onClick={() => { setOpen(true); setTimeout(() => inputRef.current?.focus(), 50) }}
        className="w-full flex items-center gap-3 px-4 py-3 glass border border-white/10 rounded-xl text-gray-400 hover:border-purple-400/30 hover:text-gray-300 transition-all text-sm"
      >
        <Search className="w-4 h-4 flex-shrink-0" />
        <span className="flex-1 text-left">{tSearch('triggerPlaceholder')}</span>
        <kbd className="hidden md:inline-flex items-center px-2 py-0.5 text-xs bg-white/5 border border-white/10 rounded text-gray-500">⌘K</kbd>
      </button>

      {open && (
        <div className="absolute top-full mt-2 left-0 right-0 z-50 glass-strong border border-white/15 rounded-2xl shadow-2xl shadow-black/50 overflow-hidden">
          {/* Input row */}
          <div className="flex items-center gap-3 px-4 py-3 border-b border-white/10">
            <Search className="w-4 h-4 text-purple-400 flex-shrink-0" />
            <input
              ref={inputRef}
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder={tSearch('inputPlaceholder')}
              className="flex-1 bg-transparent text-white placeholder-gray-500 outline-none text-sm"
            />
            {query ? (
              <button onClick={() => setQuery('')} className="text-gray-500 hover:text-gray-300">
                <X className="w-4 h-4" />
              </button>
            ) : (
              <button onClick={() => setOpen(false)} className="text-gray-500 hover:text-gray-300">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto">
            {/* Empty state – show popular */}
            {!query.trim() && (
              <div className="px-4 py-4">
                <p className="text-gray-600 text-xs uppercase tracking-wider mb-3">{tSearch('popularTopics')}</p>
                <div className="flex flex-wrap gap-2">
                  {popular.map(tag => (
                    <button key={tag} onClick={() => setQuery(tag)}
                      className="px-3 py-1.5 bg-purple-500/10 border border-purple-400/20 rounded-lg text-purple-300 text-xs hover:bg-purple-500/20 transition-colors">
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* No results */}
            {query.trim() && results.length === 0 && (
              <p className="text-gray-500 text-sm text-center py-8">{tSearch('noResultsFor')} „{query}"</p>
            )}

            {/* Results */}
            {results.map((result, i) => (
              <button
                key={i}
                onClick={() => handleSelect(result)}
                className="w-full text-left flex items-start gap-3 px-4 py-3 hover:bg-white/5 transition-colors border-b border-white/5 last:border-0"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-gray-500 text-xs mb-0.5">{result.chapter}</p>
                  <p className="text-white text-sm font-semibold">{result.title}</p>
                  <p className="text-gray-500 text-xs truncate">{result.desc}</p>
                </div>
                <ArrowRight className="w-4 h-4 text-gray-600 flex-shrink-0 mt-1" />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
