import type { Metadata } from 'next'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import {
  AlertTriangle, ArrowRight, Bot, CheckCircle2, Cpu, Laptop, Lock, MessageSquare, Plug, ShieldCheck, Wrench,
} from 'lucide-react'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { Link } from '@/i18n/navigation'
import { pageAlternates, pageOpenGraph } from '@/lib/seo'
import { ConnectorUrlCopy } from '@/components/mcp/ConnectorUrlCopy'

// Oeffentliche Doku fuer die KI-Verbindungen (MCP) – Doku-Link fuer die
// Einreichung bei Anthropic (Connectors Directory) und OpenAI (ChatGPT-Apps).
type Props = { params: Promise<{ locale: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'McpDocs' })
  const title = t('metaTitle')
  const description = t('metaDescription')
  return {
    title,
    description,
    alternates: pageAlternates(locale, '/docs/mcp'),
    openGraph: pageOpenGraph({ locale, path: '/docs/mcp', title, description }),
  }
}

function Card({ icon: Icon, title, children }: { icon: typeof Bot; title: string; children: React.ReactNode }) {
  return (
    <section className="bg-surface border border-line rounded-lg p-6 md:p-8">
      <h2 className="flex items-center gap-2 text-xl font-semibold text-ink mb-4">
        <Icon className="w-5 h-5 text-indigo-text" />
        {title}
      </h2>
      {children}
    </section>
  )
}

function Ordered({ items }: { items: string[] }) {
  return (
    <ol className="space-y-2 text-sm text-ink-muted list-decimal list-inside">
      {items.map((s) => (
        <li key={s}>{s}</li>
      ))}
    </ol>
  )
}

function Checks({ items, icon: Icon = CheckCircle2 }: { items: string[]; icon?: typeof Bot }) {
  return (
    <ul className="space-y-2 text-sm text-ink-muted">
      {items.map((s) => (
        <li key={s} className="flex gap-2">
          <Icon className="w-4 h-4 flex-shrink-0 mt-0.5 text-success" />
          <span>{s}</span>
        </li>
      ))}
    </ul>
  )
}

export default async function McpDocsPage({ params }: Props) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations({ locale, namespace: 'McpDocs' })
  const tools = t.raw('tools') as { name: string; desc: string }[]
  const trouble = t.raw('trouble') as { q: string; a: string }[]

  return (
    <div className="min-h-screen flex flex-col bg-bg">
      <Header />
      <main className="flex-1 px-4 py-16">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="mb-4">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-sm border border-line bg-ghost-fill text-xs font-semibold text-indigo-text mb-4">
              <Plug className="w-3.5 h-3.5" />
              {t('badge')}
            </span>
            <h1 className="text-3xl md:text-4xl font-semibold text-ink mb-4">{t('heading')}</h1>
            <p className="text-ink-muted leading-relaxed">{t('intro')}</p>
          </div>

          <section className="bg-surface border border-line rounded-lg p-6">
            <p className="text-sm font-medium text-ink mb-2">{t('urlLabel')}</p>
            <ConnectorUrlCopy />
          </section>

          <Card icon={Cpu} title={t('howHeading')}>
            <Ordered items={t.raw('how') as string[]} />
          </Card>

          <Card icon={CheckCircle2} title={t('requirementsHeading')}>
            <Checks items={t.raw('requirements') as string[]} />
          </Card>

          <div className="grid md:grid-cols-2 gap-6">
            <Card icon={Bot} title={t('claudeHeading')}>
              <Ordered items={t.raw('claudeSteps') as string[]} />
            </Card>
            <Card icon={MessageSquare} title={t('chatgptHeading')}>
              <Ordered items={t.raw('chatgptSteps') as string[]} />
            </Card>
          </div>

          <Card icon={Laptop} title={t('localHeading')}>
            <p className="text-sm text-ink-muted">{t('localText')}</p>
          </Card>

          <Card icon={Wrench} title={t('toolsHeading')}>
            <p className="text-sm text-ink-muted mb-4">{t('toolsIntro')}</p>
            <dl className="grid sm:grid-cols-2 gap-3">
              {tools.map((tool) => (
                <div key={tool.name} className="bg-surface-raised border border-line rounded-md p-4">
                  <dt className="font-semibold text-ink text-sm mb-1">{tool.name}</dt>
                  <dd className="text-sm text-ink-muted">{tool.desc}</dd>
                </div>
              ))}
            </dl>
          </Card>

          <Card icon={ShieldCheck} title={t('safetyHeading')}>
            <Checks items={t.raw('safety') as string[]} icon={ShieldCheck} />
          </Card>

          <Card icon={Lock} title={t('privacyHeading')}>
            <p className="text-sm text-ink-muted">
              {t.rich('privacyText', {
                privacy: (chunks) => (
                  <Link href="/privacy" className="text-indigo-text underline">
                    {chunks}
                  </Link>
                ),
              })}
            </p>
          </Card>

          <Card icon={AlertTriangle} title={t('troubleHeading')}>
            <dl className="space-y-4">
              {trouble.map((item) => (
                <div key={item.q}>
                  <dt className="font-semibold text-ink text-sm">{item.q}</dt>
                  <dd className="text-sm text-ink-muted mt-1">{item.a}</dd>
                </div>
              ))}
            </dl>
          </Card>

          <div className="flex flex-col sm:flex-row sm:items-center gap-4 pt-2">
            <Link
              href="/dashboard/ai-connections"
              className="press inline-flex items-center justify-center gap-2 px-5 py-3 bg-indigo-button hover:bg-indigo-hover text-on-indigo shadow-button-edge rounded-md font-semibold text-sm"
            >
              {t('dashboardCta')}
              <ArrowRight className="w-4 h-4" />
            </Link>
            <p className="text-sm text-ink-faint">{t('supportText')}</p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
