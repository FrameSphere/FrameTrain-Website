'use client'

import { useState, useRef, useEffect, useMemo } from 'react'
import { useRouter } from '@/i18n/navigation'
import { useTranslations } from 'next-intl'
import { Search, X, ArrowRight } from 'lucide-react'

// ─── Chapter/Section-Struktur (statisch, IDs & Hrefs nicht übersetzbar) ───────
// Titel/Beschreibung werden zur Laufzeit aus den AICoach-Übersetzungen gezogen,
// damit der Suchindex automatisch DE/EN korrekt ist und nicht dupliziert wird.
const CHAPTERS: { key: string; emoji: string; href: string; items: { id: string; key: string }[] }[] = [
  { key: 'mlGrundlagen', emoji: '', href: '/docs/ai-training-guide/ml-grundlagen', items: [
    { id: 'was-ist-ml', key: 'wasIstMl' }, { id: 'neuronale-netze', key: 'neuronaleNetze' }, { id: 'transformer', key: 'transformer' }, { id: 'wie-ki-lernt', key: 'wieKiLernt' },
  ]},
  { key: 'trainingVerstehen', emoji: '', href: '/docs/ai-training-guide/training-verstehen', items: [
    { id: 'training-loop', key: 'trainingLoop' }, { id: 'loss-funktionen', key: 'lossFunktionen' }, { id: 'metriken', key: 'metriken' }, { id: 'train-val-test', key: 'trainValTest' },
  ]},
  { key: 'trainingsverlauf', emoji: '', href: '/docs/ai-training-guide/trainingsverlauf', items: [
    { id: 'loss-kurven', key: 'lossKurven' }, { id: 'gutes-training', key: 'gutesTraining' }, { id: 'overfitting', key: 'overfitting' }, { id: 'underfitting', key: 'underfitting' }, { id: 'instabiles-training', key: 'instabilesTraining' },
  ]},
  { key: 'diagnose', emoji: '', href: '/docs/ai-training-guide/diagnose', items: [
    { id: 'overfitting-fix', key: 'overfittingFix' }, { id: 'underfitting-fix', key: 'underfittingFix' }, { id: 'lr-probleme', key: 'lrProbleme' }, { id: 'loss-spike', key: 'lossSpike' },
  ]},
  { key: 'hyperparameter', emoji: '', href: '/docs/ai-training-guide/hyperparameter', items: [
    { id: 'learning-rate-deep', key: 'learningRateDeep' }, { id: 'lr-scheduler', key: 'lrScheduler' }, { id: 'batch-size-deep', key: 'batchSizeDeep' }, { id: 'optimizer-vergleich', key: 'optimizerVergleich' }, { id: 'regularisierung', key: 'regularisierung' },
  ]},
  { key: 'fineTuning', emoji: '', href: '/docs/ai-training-guide/fine-tuning', items: [
    { id: 'full-finetuning', key: 'fullFinetuning' }, { id: 'lora-deep', key: 'loraDeep' }, { id: 'qlora', key: 'qlora' }, { id: 'peft-methoden', key: 'peftMethoden' }, { id: 'wann-was', key: 'wannWas' },
  ]},
  { key: 'datasetMastery', emoji: '', href: '/docs/ai-training-guide/dataset-mastery', items: [
    { id: 'daten-qualitaet', key: 'datenQualitaet' }, { id: 'preprocessing', key: 'preprocessing' }, { id: 'augmentation', key: 'augmentation' }, { id: 'balancing', key: 'balancing' },
  ]},
  { key: 'fortgeschrittene', emoji: '', href: '/docs/ai-training-guide/fortgeschrittene', items: [
    { id: 'mixed-precision', key: 'mixedPrecision' }, { id: 'gradient-checkpointing', key: 'gradientCheckpointing' }, { id: 'early-stopping', key: 'earlyStopping' }, { id: 'ensembles', key: 'ensembles' },
  ]},
]

interface Result {
  title: string
  desc: string
  href: string
  section: string
  chapter: string
}

export function DocSearch() {
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)
  const wrapperRef = useRef<HTMLDivElement>(null)
  const t = useTranslations('AICoach')
  const tSearch = useTranslations('DocSearch')

  // Suchindex zur Laufzeit aus den Übersetzungen bauen (DE/EN automatisch korrekt)
  const searchIndex = useMemo<Result[]>(() => {
    const items: Result[] = []
    for (const ch of CHAPTERS) {
      const chapterTitle = `${ch.emoji} ${t(`chapters.${ch.key}.title`)}`
      for (const it of ch.items) {
        let desc = ''
        try {
          desc = t(`chapters.${ch.key}.content.${it.key}.subtitle`)
        } catch {
          desc = ''
        }
        items.push({
          title: t(`chapters.${ch.key}.items.${it.key}`),
          desc,
          href: ch.href,
          section: it.id,
          chapter: chapterTitle,
        })
      }
    }
    return items
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

  // Keyboard shortcut Ctrl+K / Cmd+K
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault()
        setOpen(true)
        setTimeout(() => inputRef.current?.focus(), 50)
      }
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [])

  function navigate(result: Result) {
    setOpen(false)
    setQuery('')
    router.push(`${result.href}?section=${result.section}`)
  }

  const popularTags = tSearch.raw('popularTags') as string[]

  return (
    <div ref={wrapperRef} className="relative w-full max-w-xl mx-auto">
      {/* Search trigger */}
      <button
        onClick={() => { setOpen(true); setTimeout(() => inputRef.current?.focus(), 50) }}
        className="card-lift w-full flex items-center gap-3 px-4 py-3 bg-surface border border-line border border-line rounded-md text-ink-muted hover:border-line hover:text-ink transition duration-200 ease-out text-sm"
      >
        <Search className="w-4 h-4 flex-shrink-0" />
        <span className="flex-1 text-left">{tSearch('triggerPlaceholder')}</span>
        <kbd className="hidden md:inline-flex items-center gap-1 px-2 py-0.5 text-xs bg-ghost-fill border border-line rounded text-ink-faint">⌘K</kbd>
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute top-full mt-2 left-0 right-0 z-50 bg-surface border border-line border border-line-strong rounded-lg overflow-hidden">
          {/* Input */}
          <div className="flex items-center gap-3 px-4 py-3 border-b border-line">
            <Search className="w-4 h-4 text-indigo-text flex-shrink-0" />
            <input
              ref={inputRef}
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder={tSearch('inputPlaceholder')}
              className="flex-1 bg-transparent text-ink placeholder-ink-faint outline-none text-sm"
            />
            {query && (
              <button onClick={() => setQuery('')} className="text-ink-faint hover:text-ink">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Results */}
          <div className="max-h-80 overflow-y-auto">
            {results.length === 0 && query.trim() && (
              <p className="text-ink-faint text-sm text-center py-8">{tSearch('noResultsFor')} „{query}"</p>
            )}
            {results.length === 0 && !query.trim() && (
              <div className="px-4 py-4">
                <p className="text-ink-faint text-xs uppercase tracking-wider mb-3">{tSearch('popularTopics')}</p>
                <div className="flex flex-wrap gap-2">
                  {popularTags.map(tag => (
                    <button key={tag} onClick={() => setQuery(tag)}
                      className="px-3 py-1.5 bg-indigo-soft border border-line rounded-sm text-indigo-text text-xs hover:bg-indigo-soft transition-colors">
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {results.map((result, i) => (
              <button
                key={i}
                onClick={() => navigate(result)}
                className="w-full text-left flex items-start gap-3 px-4 py-3 hover:bg-ghost-fill transition-colors border-b border-line last:border-0"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-ink-faint text-xs">{result.chapter}</span>
                  </div>
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
