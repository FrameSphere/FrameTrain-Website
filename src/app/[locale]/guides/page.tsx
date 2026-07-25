import type { Metadata } from 'next'
import { Link } from '@/i18n/navigation'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { Brain, Laptop, Cpu, Shield, ArrowRight } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { getTranslations } from 'next-intl/server'
import { pageAlternates, pageOpenGraph } from '@/lib/seo'

type Props = { params: Promise<{ locale: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'GuidesHub' })
  return {
    title: t('metaTitle'),
    description: t('metaDescription'),
    alternates: pageAlternates(locale, '/guides'),
    openGraph: pageOpenGraph({
      locale,
      path: '/guides',
      title: t('ogTitle'),
      description: t('ogDescription'),
    }),
  }
}

const icons = [<Brain key="0" className="w-8 h-8 text-purple-400" />, <Laptop key="1" className="w-8 h-8 text-green-400" />, <Cpu key="2" className="w-8 h-8 text-orange-400" />]
const colors = ['purple', 'green', 'orange']
const colorMap: Record<string, string> = {
  purple: 'from-purple-500 to-pink-500',
  green: 'from-green-500 to-cyan-500',
  orange: 'from-orange-500 to-red-500',
}

type GuideItem = { title: string; description: string; tags: string[]; href: string }

export default function GuidesPage() {
  const t = useTranslations('GuidesHub')
  const guides = t.raw('items') as GuideItem[]

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1">
        <section className="py-16 sm:py-20 px-4 border-b border-white/10">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl mb-6">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4 leading-[1.1]">{t('heading')}</h1>
            <p className="text-base sm:text-lg text-gray-500 max-w-xl mx-auto leading-relaxed">
              {t('subtitle')}
            </p>
          </div>
        </section>

        <section className="py-14 px-4">
          <div className="max-w-3xl mx-auto grid gap-4">
            {guides.map((guide, i) => (
              <Link key={guide.href} href={guide.href} className="group">
                <div className="card-lift glass-strong rounded-2xl p-6 sm:p-7 border border-white/10">
                  <div className="flex items-start gap-5">
                    <div className={`w-12 h-12 bg-gradient-to-br ${colorMap[colors[i]]} rounded-2xl flex items-center justify-center flex-shrink-0 transition-transform duration-200 ease-out group-hover:scale-[1.06] [&>svg]:w-5 [&>svg]:h-5 [&>svg]:text-white`}>
                      {icons[i]}
                    </div>
                    <div className="flex-1">
                      <h2 className="text-lg font-semibold text-white mb-2 group-hover:text-purple-200 transition-colors duration-200">
                        {guide.title}
                      </h2>
                      <p className="text-[15px] text-gray-400 leading-[1.65] mb-4">{guide.description}</p>
                      <div className="flex items-center gap-4">
                        <div className="flex gap-1.5 flex-wrap">
                          {guide.tags.map((tag) => (
                            <span key={tag} className="text-[11px] px-2 py-0.5 rounded bg-white/[0.04] text-gray-500 font-mono border border-white/10">
                              {tag}
                            </span>
                          ))}
                        </div>
                        {/* group-hover:gap-2 animierte vorher gap – eine Layout-
                            Eigenschaft, die pro Frame ein Reflow auslöst. Der
                            Pfeil verschiebt sich jetzt per transform. */}
                        <div className="ml-auto flex items-center gap-1.5 text-purple-400/80 text-[13px] font-medium group-hover:text-purple-300 transition-colors duration-200">
                          <span>{t('readLabel')}</span>
                          <ArrowRight className="w-3.5 h-3.5 transition-transform duration-200 ease-out group-hover:translate-x-0.5" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
