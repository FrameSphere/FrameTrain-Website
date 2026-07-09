'use client'

import { useState, useMemo } from 'react'
import { Link } from '@/i18n/navigation'
import { useTranslations } from 'next-intl'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import {
  HelpCircle, Search, Cpu, Shield, DollarSign, Download,
  Brain, Code2, Zap, Settings, Package, BarChart3,
  ChevronDown, ArrowRight, Sparkles, Database, Cloud
} from 'lucide-react'

type RawFaq = { q: string; a: string; tags?: string[] }
type Category = {
  id: string
  label: string
  icon: React.ReactNode
  color: string
  faqs: RawFaq[]
}

const CATEGORY_META: { id: string; icon: React.ReactNode; color: string }[] = [
  { id: 'general', icon: <HelpCircle className="w-5 h-5" />, color: 'purple' },
  { id: 'pricing', icon: <DollarSign className="w-5 h-5" />, color: 'green' },
  { id: 'hardware', icon: <Cpu className="w-5 h-5" />, color: 'orange' },
  { id: 'training', icon: <Brain className="w-5 h-5" />, color: 'pink' },
  { id: 'privacy', icon: <Shield className="w-5 h-5" />, color: 'blue' },
  { id: 'models', icon: <Package className="w-5 h-5" />, color: 'cyan' },
  { id: 'monitoring', icon: <BarChart3 className="w-5 h-5" />, color: 'yellow' },
  { id: 'install', icon: <Download className="w-5 h-5" />, color: 'teal' },
]

const colorAccents: Record<string, { border: string; badge: string; dot: string }> = {
  purple: { border: 'border-purple-500/20', badge: 'text-purple-400 bg-purple-500/10 border-purple-500/20', dot: 'bg-purple-500' },
  green: { border: 'border-green-500/20', badge: 'text-green-400 bg-green-500/10 border-green-500/20', dot: 'bg-green-500' },
  orange: { border: 'border-orange-500/20', badge: 'text-orange-400 bg-orange-500/10 border-orange-500/20', dot: 'bg-orange-500' },
  pink: { border: 'border-pink-500/20', badge: 'text-pink-400 bg-pink-500/10 border-pink-500/20', dot: 'bg-pink-500' },
  blue: { border: 'border-blue-500/20', badge: 'text-blue-400 bg-blue-500/10 border-blue-500/20', dot: 'bg-blue-500' },
  cyan: { border: 'border-cyan-500/20', badge: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20', dot: 'bg-cyan-500' },
  yellow: { border: 'border-yellow-500/20', badge: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20', dot: 'bg-yellow-500' },
  teal: { border: 'border-teal-500/20', badge: 'text-teal-400 bg-teal-500/10 border-teal-500/20', dot: 'bg-teal-500' },
}

// ── Spezial-Antworten mit JSX (Tabellen / Code-Block) statt reinem Text ──────
function useSpecialAnswers() {
  const t = useTranslations('FAQ.categories.hardware.vramTable')
  const tHp = useTranslations('FAQ.categories.training.hyperparamsCode')
  const tDur = useTranslations('FAQ.categories.training.durationTable')
  const tLoss = useTranslations('FAQ.categories.monitoring.lossProblems')

  const vramRows = t.raw('rows') as string[][]
  const vramHeaders = t.raw('headers') as string[]
  const durRows = tDur.raw('rows') as string[][]
  const durHeaders = tDur.raw('headers') as string[]
  const lossItems = tLoss.raw('items') as string[][]

  const VRAM_TABLE = (
    <div className="space-y-3">
      <p>{t('intro')}</p>
      <div className="overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="border-b border-white/10">
              {vramHeaders.map((h) => <th key={h} className="text-left py-2 pr-4 text-gray-400 font-semibold">{h}</th>)}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {vramRows.map(([s, v], i) => (
              <tr key={i}>
                <td className="py-2 pr-4 text-gray-300" dangerouslySetInnerHTML={{ __html: s }} />
                <td className="py-2 text-green-400 font-semibold">{v}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-gray-400 text-sm">{t('footnote')}</p>
    </div>
  )

  const HYPERPARAMS_CODE = (
    <div className="space-y-3">
      <p>{tHp('intro')}</p>
      <div className="bg-gray-900/60 rounded-xl p-4 font-mono text-sm space-y-1">
        <div><span className="text-gray-500">{tHp('codeComments.training')}</span></div>
        <div><span className="text-blue-400">learning_rate</span>: <span className="text-green-400">2e-4</span></div>
        <div><span className="text-blue-400">num_epochs</span>: <span className="text-green-400">3</span></div>
        <div><span className="text-blue-400">batch_size</span>: <span className="text-green-400">4</span> <span className="text-gray-500">{tHp('codeComments.batchSizeNote')}</span></div>
        <div><span className="text-blue-400">max_seq_length</span>: <span className="text-green-400">2048</span></div>
        <div className="mt-2"><span className="text-gray-500">{tHp('codeComments.lora')}</span></div>
        <div><span className="text-blue-400">lora_r</span>: <span className="text-green-400">16</span></div>
        <div><span className="text-blue-400">lora_alpha</span>: <span className="text-green-400">32</span></div>
        <div><span className="text-blue-400">lora_dropout</span>: <span className="text-green-400">0.05</span></div>
        <div><span className="text-blue-400">target_modules</span>: <span className="text-green-400">q_proj, v_proj, k_proj, o_proj</span></div>
      </div>
      <p className="text-gray-400 text-sm">{tHp('footnote')}</p>
    </div>
  )

  const DURATION_TABLE = (
    <div className="space-y-3">
      <p>{tDur('intro')}</p>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/10">
              {durHeaders.map((h) => <th key={h} className="text-left py-2 pr-4 text-gray-400 font-semibold">{h}</th>)}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {durRows.map(([s, time], i) => (
              <tr key={i}>
                <td className="py-2 pr-4 text-gray-300">{s}</td>
                <td className="py-2 text-yellow-400 font-semibold">{time}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )

  const LOSS_PROBLEMS = (
    <div className="space-y-2">
      <p>{tLoss('intro')}</p>
      <ul className="space-y-2 mt-2">
        {lossItems.map(([prob, sol]) => (
          <li key={prob} className="glass rounded-lg px-4 py-3 border border-white/10">
            <div className="text-white font-semibold text-sm mb-1">{prob}</div>
            <div className="text-gray-400 text-sm">{sol}</div>
          </li>
        ))}
      </ul>
    </div>
  )

  return {
    __VRAM_TABLE__: VRAM_TABLE,
    __HYPERPARAMS_CODE__: HYPERPARAMS_CODE,
    __DURATION_TABLE__: DURATION_TABLE,
    __LOSS_PROBLEMS__: LOSS_PROBLEMS,
  } as Record<string, React.ReactNode>
}

function FAQAccordion({ faq, accent, special }: { faq: RawFaq; accent: typeof colorAccents[string]; special: Record<string, React.ReactNode> }) {
  const [open, setOpen] = useState(false)
  const content = special[faq.a] ?? faq.a
  return (
    <div className={`glass-strong rounded-2xl overflow-hidden border ${open ? accent.border : 'border-white/10'} transition-colors duration-300`}>
      <button
        className="w-full text-left px-7 py-5 flex items-start justify-between gap-4 hover:bg-white/3 transition-colors group"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
      >
        <span className="text-white font-semibold text-base leading-snug group-hover:text-purple-200 transition-colors pr-2">
          {faq.q}
        </span>
        <ChevronDown
          className={`w-5 h-5 flex-shrink-0 mt-0.5 transition-transform duration-300 ${open ? 'rotate-180 text-purple-400' : 'text-gray-500'}`}
        />
      </button>
      <div className={`overflow-hidden transition-all duration-300 ${open ? 'max-h-[600px]' : 'max-h-0'}`}>
        <div className="px-7 pb-6 text-gray-300 leading-relaxed text-sm border-t border-white/5 pt-4">
          {typeof content === 'string' ? <p>{content}</p> : content}
        </div>
      </div>
    </div>
  )
}

export default function FAQPage() {
  const t = useTranslations('FAQ')
  const special = useSpecialAnswers()
  const [activeCategory, setActiveCategory] = useState('general')
  const [search, setSearch] = useState('')

  const categories: Category[] = useMemo(() => {
    return CATEGORY_META.map((meta) => ({
      id: meta.id,
      icon: meta.icon,
      color: meta.color,
      label: t(`categories.${meta.id}.label`),
      faqs: t.raw(`categories.${meta.id}.faqs`) as RawFaq[],
    }))
  }, [t])

  const totalFAQs = categories.reduce((acc, c) => acc + c.faqs.length, 0)

  const searchResults = useMemo(() => {
    if (!search.trim()) return null
    const q = search.toLowerCase()
    const results: { category: Category; faq: RawFaq }[] = []
    for (const cat of categories) {
      for (const faq of cat.faqs) {
        const inQ = faq.q.toLowerCase().includes(q)
        const inA = typeof faq.a === 'string' && faq.a.toLowerCase().includes(q)
        const inTags = faq.tags?.some((tag) => tag.toLowerCase().includes(q))
        if (inQ || inA || inTags) results.push({ category: cat, faq })
      }
    }
    return results
  }, [search, categories])

  const activecat = categories.find((c) => c.id === activeCategory) ?? categories[0]

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1">

        {/* ─── HERO ─── */}
        <section className="relative py-24 px-4 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-900/10 to-blue-900/10 pointer-events-none" />
          <div className="absolute top-20 left-1/3 w-80 h-80 bg-purple-600 rounded-full blur-[150px] opacity-10 pointer-events-none" />
          <div className="max-w-3xl mx-auto text-center relative">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-3xl mb-8">
              <HelpCircle className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-5xl md:text-6xl font-black text-white mb-6">
              {t('heading')}
            </h1>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-3">
              {t('subtitle', { count: totalFAQs })}
            </p>
            <p className="text-gray-600 text-sm">
              {t('noAnswerFound')}{' '}
              <a href="https://github.com/FrameSphere/FrameTrain-Website" target="_blank" className="text-purple-400 hover:text-purple-300 transition">
                {t('openGithub')}
              </a>{' '}
              {t('orAskDiscord')}
            </p>
          </div>
        </section>

        {/* ─── SEARCH ─── */}
        <section className="px-4 pb-6">
          <div className="max-w-3xl mx-auto">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 pointer-events-none" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={t('searchPlaceholder')}
                className="w-full glass-strong border border-white/10 rounded-2xl pl-12 pr-5 py-4 text-white placeholder-gray-600 focus:outline-none focus:border-purple-500/50 transition-colors text-sm"
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition"
                >
                  ✕
                </button>
              )}
            </div>
          </div>
        </section>

        {/* ─── SEARCH RESULTS ─── */}
        {search && searchResults !== null && (
          <section className="px-4 py-4">
            <div className="max-w-3xl mx-auto">
              {searchResults.length === 0 ? (
                <div className="glass-strong rounded-2xl p-8 border border-white/10 text-center">
                  <p className="text-gray-400 mb-2">{t('noResultsFor')} <span className="text-white">„{search}"</span></p>
                  <p className="text-gray-600 text-sm">{t('tryDifferentTerm')}</p>
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-gray-500 text-sm px-1 mb-4">
                    {t('resultsFor', { count: searchResults.length })} „{search}"
                  </p>
                  {searchResults.map(({ category, faq }, i) => (
                    <div key={i}>
                      <div className="flex items-center gap-2 mb-1 px-1">
                        <span className={`text-xs font-bold px-2 py-0.5 rounded border ${colorAccents[category.color].badge}`}>
                          {category.label}
                        </span>
                      </div>
                      <FAQAccordion faq={faq} accent={colorAccents[category.color]} special={special} />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        )}

        {/* ─── CATEGORY + FAQS ─── */}
        {!search && (
          <section className="py-4 px-4 pb-24">
            <div className="max-w-5xl mx-auto flex flex-col lg:flex-row gap-8">

              {/* Sidebar */}
              <aside className="lg:w-56 flex-shrink-0">
                <div className="glass-strong rounded-2xl p-4 border border-white/10 sticky top-24">
                  <p className="text-xs text-gray-600 uppercase tracking-wider font-bold px-2 mb-3">{t('categoriesLabel')}</p>
                  <nav className="space-y-1">
                    {categories.map((cat) => {
                      const a = colorAccents[cat.color]
                      const isActive = activeCategory === cat.id
                      return (
                        <button
                          key={cat.id}
                          onClick={() => setActiveCategory(cat.id)}
                          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all text-sm ${
                            isActive
                              ? `${a.badge} font-semibold`
                              : 'text-gray-400 hover:text-white hover:bg-white/5'
                          }`}
                        >
                          <div className={`flex-shrink-0 ${isActive ? '' : 'text-gray-600'}`}>{cat.icon}</div>
                          <span className="flex-1">{cat.label}</span>
                          <span className={`text-xs px-1.5 py-0.5 rounded font-mono ${isActive ? 'bg-white/20' : 'bg-white/5 text-gray-600'}`}>
                            {cat.faqs.length}
                          </span>
                        </button>
                      )
                    })}
                  </nav>
                  <div className="mt-4 pt-4 border-t border-white/10">
                    <p className="text-xs text-gray-600 px-2">{t('totalQuestions', { count: totalFAQs })}</p>
                  </div>
                </div>
              </aside>

              {/* FAQ List – SEO: ALLE Kategorien bleiben im DOM, nur die inaktive wird per CSS
                  (hidden) ausgeblendet. So sieht Googlebot alle ~50 FAQs, nicht nur die 6
                  der aktuell ausgewählten Kategorie. */}
              <div className="flex-1 min-w-0">
                {categories.map((cat, catIdx) => (
                  <div key={cat.id} className={cat.id === activeCategory ? '' : 'hidden'}>
                    <div className="flex items-center gap-3 mb-6 pb-5 border-b border-white/10">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${colorAccents[cat.color].badge}`}>
                        {cat.icon}
                      </div>
                      <div>
                        <h2 className="text-2xl font-black text-white">{cat.label}</h2>
                        <p className="text-gray-500 text-sm">{t('questionsCount', { count: cat.faqs.length })}</p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      {cat.faqs.map((faq, i) => (
                        <FAQAccordion key={i} faq={faq} accent={colorAccents[cat.color]} special={special} />
                      ))}
                    </div>

                    {catIdx < categories.length - 1 && (
                      <div className="mt-8 flex justify-end">
                        <button
                          onClick={() => {
                            setActiveCategory(categories[catIdx + 1].id)
                            window.scrollTo({ top: 0, behavior: 'smooth' })
                          }}
                          className="flex items-center gap-2 text-sm text-gray-500 hover:text-purple-400 transition"
                        >
                          <span>{t('nextCategory', { name: categories[catIdx + 1].label })}</span>
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ─── STILL QUESTIONS ─── */}
        <section className="py-16 px-4 border-t border-white/5">
          <div className="max-w-3xl mx-auto text-center">
            <div className="glass-strong rounded-3xl p-10 border border-white/10">
              <Sparkles className="w-10 h-10 text-purple-400 mx-auto mb-5" />
              <h3 className="text-2xl font-black text-white mb-4">{t('stillQuestions.heading')}</h3>
              <p className="text-gray-400 mb-7 max-w-lg mx-auto">
                {t('stillQuestions.text')}
              </p>
              <div className="flex gap-4 justify-center flex-wrap">
                <a
                  href="https://github.com/FrameSphere/FrameTrain-Website"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="glass-strong px-6 py-3 rounded-xl text-gray-300 hover:text-white transition font-semibold border border-white/10 flex items-center gap-2"
                >
                  <Code2 className="w-4 h-4" />
                  {t('stillQuestions.githubIssues')}
                </a>
                <Link href="/register" className="relative group inline-block px-6 py-3 rounded-xl overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600" />
                  <div className="relative flex items-center gap-2 text-white font-semibold">
                    <Sparkles className="w-4 h-4" />
                    <span>{t('stillQuestions.ctaStart')}</span>
                  </div>
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
