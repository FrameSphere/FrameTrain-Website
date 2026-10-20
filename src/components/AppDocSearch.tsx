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
  { id: 'home-panel', ns: 'homePanel', group: 'appFeatures' },
  { id: 'model-manager', ns: 'modelManager', group: 'appFeatures' },
  { id: 'training-panel', ns: 'trainingPanel', group: 'appFeatures' },
  { id: 'dataset-upload', ns: 'datasetUpload', group: 'appFeatures' },
  { id: 'dataset-builder', ns: 'datasetBuilder', group: 'appFeatures' },
  { id: 'analysis', ns: 'analysis', group: 'appFeatures' },
  { id: 'testing', ns: 'testing', group: 'appFeatures' },
  { id: 'versioning', ns: 'versioning', group: 'appFeatures' },
  { id: 'ai-assistant', ns: 'aiAssistant', group: 'appFeatures' },
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
        className="press w-full flex items-center gap-3 px-4 py-3 bg-surface border border-line border border-line rounded-md text-ink-muted hover:border-line hover:text-ink transition-colors duration-200 ease-out text-sm"
      >
        <Search className="w-4 h-4 flex-shrink-0" />
        <span className="flex-1 text-left">{tSearch('triggerPlaceholder')}</span>
        <kbd className="hidden md:inline-flex items-center px-2 py-0.5 text-xs bg-ghost-fill border border-line rounded text-ink-faint">⌘K</kbd>
      </button>

      {open && (
        <div className="absolute top-full mt-2 left-0 right-0 z-50 bg-surface border border-line border border-line-strong rounded-lg overflow-hidden">
          {/* Input row */}
          <div className="flex items-center gap-3 px-4 py-3 border-b border-line">
            <Search className="w-4 h-4 text-indigo-text flex-shrink-0" />
            <input
              ref={inputRef}
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder={tSearch('inputPlaceholder')}
              className="flex-1 bg-transparent text-ink placeholder-ink-faint outline-none text-sm"
            />
            {query ? (
              <button onClick={() => setQuery('')} className="text-ink-faint hover:text-ink">
                <X className="w-4 h-4" />
              </button>
            ) : (
              <button onClick={() => setOpen(false)} className="text-ink-faint hover:text-ink">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto">
            {/* Empty state – show popular */}
            {!query.trim() && (
              <div className="px-4 py-4">
                <p className="text-ink-faint text-xs uppercase tracking-wider mb-3">{tSearch('popularTopics')}</p>
                <div className="flex flex-wrap gap-2">
                  {popular.map(tag => (
                    <button key={tag} onClick={() => setQuery(tag)}
                      className="px-3 py-1.5 bg-indigo-soft border border-line rounded-sm text-indigo-text text-xs hover:bg-indigo-soft transition-colors">
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* No results */}
            {query.trim() && results.length === 0 && (
              <p className="text-ink-faint text-sm text-center py-8">{tSearch('noResultsFor')} „{query}"</p>
            )}

            {/* Results */}
            {results.map((result, i) => (
              <button
                key={i}
                onClick={() => handleSelect(result)}
                className="w-full text-left flex items-start gap-3 px-4 py-3 hover:bg-ghost-fill transition-colors border-b border-line last:border-0"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-ink-faint text-xs mb-0.5">{result.chapter}</p>
                  <p className="text-ink text-sm font-semibold">{result.title}</p>
                  <p className="text-ink-faint text-xs truncate">{result.desc}</p>
                </div>
                <ArrowRight className="w-4 h-4 text-ink-faint flex-shrink-0 mt-1" />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
