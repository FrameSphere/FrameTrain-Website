import type { Metadata } from 'next'
import { Link } from '@/i18n/navigation'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { Shield, DollarSign, Cloud, Laptop, ChevronRight, ArrowRight, Check, X } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { getTranslations } from 'next-intl/server'

type Props = { params: Promise<{ locale: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'CloudGuide' })
  return {
    title: t('metaTitle'),
    description: t('metaDescription'),
    keywords: t.raw('keywords') as string[],
    openGraph: {
      title: t('ogTitle'),
      description: t('ogDescription'),
      images: ['/og-image.svg'],
    },
  }
}

type PrivacyItem = { title: string; text: string }

export default function LocalVsCloudPage() {
  const t = useTranslations('CloudGuide')

  const badges = t.raw('badges') as string[]
  const costHeaders = t.raw('cost.tableHeaders') as string[]
  const costRows = t.raw('cost.tableRows') as string[][]
  const featHeaders = t.raw('features.tableHeaders') as string[]
  const featRows = t.raw('features.rows') as [string, boolean, boolean][]
  const privacyItems = t.raw('privacy.items') as PrivacyItem[]
  const whenCloudItems = t.raw('whenCloud.items') as string[]

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1">
        {/* Breadcrumb */}
        <div className="px-4 py-4 border-b border-white/5">
          <div className="max-w-4xl mx-auto flex items-center gap-2 text-sm text-gray-500">
            <Link href="/" className="hover:text-purple-400 transition">Home</Link>
            <ChevronRight className="w-4 h-4" />
            <Link href="/guides" className="hover:text-purple-400 transition">Guides</Link>
            <ChevronRight className="w-4 h-4" />
            <span className="text-gray-300">{t('breadcrumb')}</span>
          </div>
        </div>

        {/* Hero */}
        <section className="py-16 px-4 border-b border-white/10">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-green-500/20 text-green-400 border border-green-500/30">{badges[0]}</span>
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30">{badges[1]}</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-white mb-6 leading-tight">
              {t('heroTitleLine1')}<br />
              <span className="bg-gradient-to-r from-green-400 to-cyan-400 bg-clip-text text-transparent">
                {t('heroTitleLine2')}
              </span>
            </h1>
            <p className="text-xl text-gray-400 leading-relaxed max-w-3xl">
              {t('heroSubtitle')}
            </p>
          </div>
        </section>

        <section className="py-12 px-4">
          <div className="max-w-4xl mx-auto space-y-12">

            {/* Cost Comparison */}
            <div className="glass-strong rounded-2xl p-8 border border-white/10">
              <h2 className="text-3xl font-black text-white mb-6 flex items-center gap-3">
                <DollarSign className="w-8 h-8 text-yellow-400" />
                {t('cost.heading')}
              </h2>
              <p className="text-gray-400 mb-6 leading-relaxed">
                {t('cost.intro')}
              </p>

              <div className="overflow-x-auto mb-6">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/10">
                      {costHeaders.map((h) => (
                        <th key={h} className="text-left py-3 px-4 text-gray-400 font-semibold">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {costRows.map((row, i) => (
                      <tr key={i} className={`hover:bg-white/2 transition-colors ${i === 4 ? 'text-green-400' : ''}`}>
                        <td className="py-3 px-4 font-medium">{row[0]}</td>
                        <td className="py-3 px-4 text-gray-400">{row[1]}</td>
                        <td className="py-3 px-4">{row[2]}</td>
                        <td className={`py-3 px-4 font-bold ${i === 4 ? 'text-green-400' : 'text-red-400'}`}>{row[3]}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="text-xs text-gray-600">{t('cost.footnote')}</p>
            </div>

            {/* Feature Comparison Table */}
            <div className="glass-strong rounded-2xl p-8 border border-white/10">
              <h2 className="text-3xl font-black text-white mb-6">{t('features.heading')}</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="text-left py-3 px-4 text-gray-400 font-semibold">{featHeaders[0]}</th>
                      <th className="text-center py-3 px-4 text-gray-400 font-semibold">{featHeaders[1]}</th>
                      <th className="text-center py-3 px-4 text-green-400 font-semibold">{featHeaders[2]}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {featRows.map(([feature, cloud, local], i) => (
                      <tr key={i} className="hover:bg-white/2 transition-colors">
                        <td className="py-3 px-4 text-gray-300">{feature}</td>
                        <td className="py-3 px-4 text-center">
                          {cloud
                            ? <Check className="w-5 h-5 text-green-400 mx-auto" />
                            : <X className="w-5 h-5 text-red-400 mx-auto" />}
                        </td>
                        <td className="py-3 px-4 text-center">
                          {local
                            ? <Check className="w-5 h-5 text-green-400 mx-auto" />
                            : <X className="w-5 h-5 text-red-400 mx-auto" />}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Datenschutz */}
            <div className="glass-strong rounded-2xl p-8 border border-white/10">
              <h2 className="text-3xl font-black text-white mb-6 flex items-center gap-3">
                <Shield className="w-8 h-8 text-green-400" />
                {t('privacy.heading')}
              </h2>
              <div className="text-gray-300 space-y-4 leading-relaxed">
                <p>{t('privacy.intro')}</p>
              </div>
              <div className="mt-6 grid md:grid-cols-2 gap-4">
                {privacyItems.map(({ title, text }) => (
                  <div key={title} className="glass rounded-xl p-4 border border-green-500/10">
                    <h4 className="font-bold text-green-400 mb-2 text-sm">{title}</h4>
                    <p className="text-gray-400 text-sm">{text}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Wann Cloud sinnvoll ist */}
            <div className="glass-strong rounded-2xl p-8 border border-white/10">
              <h2 className="text-3xl font-black text-white mb-6 flex items-center gap-3">
                <Cloud className="w-8 h-8 text-blue-400" />
                {t('whenCloud.heading')}
              </h2>
              <p className="text-gray-400 mb-4">
                {t('whenCloud.intro')}
              </p>
              <ul className="space-y-3">
                {whenCloudItems.map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-gray-300">
                    <div className="w-6 h-6 bg-blue-500/20 border border-blue-500/30 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 text-xs text-blue-400 font-bold">{i + 1}</div>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* CTA */}
            <div className="glass-strong rounded-2xl p-8 border border-purple-500/20 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-green-500 to-cyan-500 rounded-2xl mb-6">
                <Laptop className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-black text-white mb-4">
                {t('cta.heading')}
              </h3>
              <p className="text-gray-400 mb-6 max-w-lg mx-auto">
                {t('cta.text')}
              </p>
              <div className="flex gap-4 justify-center flex-wrap">
                <Link
                  href="/register"
                  className="relative group inline-block px-8 py-3 rounded-xl overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-green-600 to-cyan-600" />
                  <div className="relative flex items-center gap-2 text-white font-semibold">
                    <span>{t('cta.ctaStart')}</span>
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </Link>
                <Link href="/guides/lora-finetuning" className="glass-strong px-8 py-3 rounded-xl text-gray-300 hover:text-white transition font-semibold">
                  {t('cta.ctaLora')}
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
