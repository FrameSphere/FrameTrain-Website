/* Temporäre UI Anfang, bald herausnehmen */
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { Package, Zap, Brain, Code2, ArrowRight } from 'lucide-react'
import { Link } from '@/i18n/navigation'
import { useTranslations } from 'next-intl'

const previewIcons = [Brain, Zap, Code2]
const previewColors = [' ', ' ', ' ']

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
            <div className="w-24 h-24 bg-ghost-fill border border-line rounded-xl flex items-center justify-center  ">
              <Package className="w-12 h-12 text-ink" />
            </div>
            <div className="absolute -top-1 -right-1 w-6 h-6 bg-warning rounded-full flex items-center justify-center ">
              <span className="text-ink text-xs font-semibold">!</span>
            </div>
          </div>

          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-ghost-fill border border-warning text-warning text-sm font-semibold mb-6">
            <span className="inline-flex rounded-full h-1.5 w-1.5 bg-warning" />
            {t('comingSoon')}
          </div>

          {/* Headline */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-semibold mb-6">
            <span className="text-ink">
              {t('heading')}
            </span>
          </h1>

          <p className="text-xl text-ink-muted mb-4 leading-relaxed">
            {t('notOpenYet')}
          </p>
          <p className="text-ink-faint mb-12 max-w-lg mx-auto">
            {t('description')}
          </p>

          {/* Preview Cards */}
          <div className="grid grid-cols-3 gap-4 mb-12 opacity-40 select-none pointer-events-none">
            {previewCards.map((card, i) => {
              const Icon = previewIcons[i]
              return (
                <div key={card.label} className="bg-surface border border-line rounded-lg p-5 border border-line">
                  <div className={`w-10 h-10 ${previewColors[i]} rounded-md flex items-center justify-center mb-3 mx-auto`}>
                    <Icon className="w-5 h-5 text-ink" />
                  </div>
                  <div className="text-ink text-sm font-semibold">{card.label}</div>
                  <div className="text-ink-faint text-xs mt-1">{t('availableSoon')}</div>
                </div>
              )
            })}
          </div>

          {/* Back to Dashboard */}
          <Link
            href="/dashboard"
            className="card-lift inline-flex items-center gap-2 px-8 py-4 bg-surface border border-line border border-line-strong text-ink font-semibold rounded-lg hover:border-line-strong hover:text-ink transition duration-200 ease-out group"
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
