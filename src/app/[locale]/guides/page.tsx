import type { Metadata } from 'next'
import { Link } from '@/i18n/navigation'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { Brain, Laptop, Cpu, Shield, ArrowRight } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { getTranslations } from 'next-intl/server'

type Props = { params: Promise<{ locale: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'GuidesHub' })
  return {
    title: t('metaTitle'),
    description: t('metaDescription'),
    openGraph: {
      title: t('ogTitle'),
      description: t('ogDescription'),
      images: ['/og-image.svg'],
    },
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
        <section className="py-20 px-4 border-b border-white/10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-3xl mb-6">
              <Shield className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-5xl md:text-6xl font-black text-white mb-6">{t('heading')}</h1>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              {t('subtitle')}
            </p>
          </div>
        </section>

        <section className="py-16 px-4">
          <div className="max-w-4xl mx-auto grid gap-6">
            {guides.map((guide, i) => (
              <Link key={guide.href} href={guide.href} className="group">
                <div className="glass-strong rounded-2xl p-8 border border-white/10 hover:border-white/20 transition-all duration-300 hover:scale-[1.01]">
                  <div className="flex items-start gap-6">
                    <div className={`w-16 h-16 bg-gradient-to-br ${colorMap[colors[i]]} rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform`}>
                      {icons[i]}
                    </div>
                    <div className="flex-1">
                      <h2 className="text-2xl font-black text-white mb-3 group-hover:text-purple-300 transition-colors">
                        {guide.title}
                      </h2>
                      <p className="text-gray-400 leading-relaxed mb-4">{guide.description}</p>
                      <div className="flex items-center gap-4">
                        <div className="flex gap-2 flex-wrap">
                          {guide.tags.map((tag) => (
                            <span key={tag} className="text-xs px-2 py-1 rounded bg-white/5 text-gray-500 font-mono border border-white/10">
                              {tag}
                            </span>
                          ))}
                        </div>
                        <div className="ml-auto flex items-center gap-1 text-purple-400 text-sm font-semibold group-hover:gap-2 transition-all">
                          <span>{t('readLabel')}</span>
                          <ArrowRight className="w-4 h-4" />
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
