/* Temporäre UI Anfang, bald herausnehmen */
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { Package, Zap, Brain, Code2, ArrowRight } from 'lucide-react'
import { Link } from '@/i18n/navigation'
import { useTranslations } from 'next-intl'

const previewIcons = [Brain, Zap, Code2]
const previewColors = ['from-purple-600 to-pink-600', 'from-blue-600 to-cyan-600', 'from-green-600 to-emerald-600']

export default function ExtensionsPage() {
  const t = useTranslations('Extensions')
  const previewCards = t.raw('previewCards') as { label: string }[]

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 flex items-center justify-center px-4 py-24">
        <div className="max-w-2xl w-full text-center">

          {/* Icon */}
          <div className="relative inline-flex mb-8">
            <div className="w-24 h-24 bg-gradient-to-br from-purple-600 via-pink-600 to-blue-600 rounded-3xl flex items-center justify-center shadow-2xl shadow-purple-500/40">
              <Package className="w-12 h-12 text-white" />
            </div>
            <div className="absolute -top-1 -right-1 w-6 h-6 bg-amber-500 rounded-full flex items-center justify-center shadow-lg shadow-amber-500/50">
              <span className="text-white text-xs font-black">!</span>
            </div>
          </div>

          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-sm font-bold mb-6">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500" />
            </span>
            {t('comingSoon')}
          </div>

          {/* Headline */}
          <h1 className="text-5xl md:text-6xl font-black mb-6">
            <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
              {t('heading')}
            </span>
          </h1>

          <p className="text-xl text-gray-400 mb-4 leading-relaxed">
            {t('notOpenYet')}
          </p>
          <p className="text-gray-500 mb-12 max-w-lg mx-auto">
            {t('description')}
          </p>

          {/* Preview Cards */}
          <div className="grid grid-cols-3 gap-4 mb-12 opacity-40 select-none pointer-events-none">
            {previewCards.map((card, i) => {
              const Icon = previewIcons[i]
              return (
                <div key={card.label} className="glass-strong rounded-2xl p-5 border border-white/10">
                  <div className={`w-10 h-10 bg-gradient-to-br ${previewColors[i]} rounded-xl flex items-center justify-center mb-3 mx-auto`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <div className="text-white text-sm font-semibold">{card.label}</div>
                  <div className="text-gray-600 text-xs mt-1">{t('availableSoon')}</div>
                </div>
              )
            })}
          </div>

          {/* Back to Dashboard */}
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 px-8 py-4 glass-strong border border-white/15 text-gray-300 font-semibold rounded-2xl hover:border-purple-500/40 hover:text-white transition-all group"
          >
            <ArrowRight className="w-5 h-5 rotate-180" />
            {t('backToDashboard')}
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  )
}
/* Temporäre UI Ende */
