import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { ArrowRight, Check } from 'lucide-react'
import { Link } from '@/i18n/navigation'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { TrialButton } from '@/components/landing/Ctas'
import { AppShot } from '@/components/landing/AppShot'
import { NeuronDiagram } from '@/components/landing/NeuronDiagram'
import { CHANNELS, type ChannelKey } from '@/lib/channels'
import { pageAlternates } from '@/lib/seo'
import { ChannelVisit } from './ChannelVisit'

/**
 * Kurze Begrüßungsseite pro Social-Kanal. Bewusst noindex: Inhaltlich ist
 * es eine Variante der Startseite – sie soll Besucher aus Bio-Links
 * abholen, nicht mit der Startseite um Rankings konkurrieren.
 */
export async function channelMetadata(locale: string, channel: ChannelKey): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: 'Channel' })
  return {
    title: `${t(`channels.${channel}.title`)} · FrameTrain`,
    description: t('metaDescription'),
    alternates: pageAlternates(locale, `/${channel}`),
    robots: { index: false, follow: true },
  }
}

export async function ChannelPage({ locale, channel }: { locale: string; channel: ChannelKey }) {
  const t = await getTranslations({ locale, namespace: 'Channel' })
  const tM = await getTranslations({ locale, namespace: 'Marketing' })
  const tL = await getTranslations({ locale, namespace: 'Landing' })
  const { code, backUrl } = CHANNELS[channel]
  const points = t.raw('points') as string[]
  const back = t(`channels.${channel}.back`)

  return (
    <div className="min-h-screen flex flex-col bg-bg text-ink">
      <ChannelVisit channel={channel} code={code} />
      <Header />
      <main className="flex-1">
        <section className="ft-container pt-12 md:pt-20 grid gap-12 lg:grid-cols-[1.1fr_1fr] items-center">
          <div>
            <p className="ft-label m-0">{t('eyebrow')}</p>
            <h1 className="ft-display-l mt-5 mb-0 !text-[40px] md:!text-[60px]">
              {t(`channels.${channel}.title`)} <span className="text-ink-muted">{tL('hero.titleA')}</span>
            </h1>
            <p className="ft-lead mt-6 mb-0 max-w-[560px]">{t('lead')}</p>

            {code && (
              <div className="mt-8 inline-flex flex-col gap-1.5 rounded-md border border-line bg-surface px-5 py-4">
                <span className="ft-label">{t('codeLabel')}</span>
                <span className="font-mono text-[22px] tracking-[0.06em] text-ink">{code}</span>
                <span className="text-[13px] text-ink-muted">{t('codeSaved')}</span>
              </div>
            )}

            <ul className="mt-8 p-0 list-none flex flex-col gap-3">
              {points.map((p) => (
                <li key={p} className="flex items-center gap-3 text-[16px] text-ink">
                  <Check className="w-[18px] h-[18px] text-ink-muted flex-none" strokeWidth={1.5} aria-hidden="true" />
                  {p}
                </li>
              ))}
            </ul>

            <div className="mt-9 flex flex-col sm:flex-row gap-3">
              <TrialButton label={tM('trial')} dashboardLabel={tM('dashboard')} from={`channel_${channel}`} />
              <Link href="/" className="ft-btn ft-btn--ghost">
                {t('more')}
                <ArrowRight className="w-4 h-4" strokeWidth={1.5} aria-hidden="true" />
              </Link>
            </div>
            <p className="mt-4 ft-data text-ink-faint">{tM('trialNote')}</p>
            {back && backUrl && (
              <a
                href={backUrl}
                {...(backUrl.startsWith('http') ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                className="ft-link mt-6 inline-block text-[15px] font-medium"
              >
                {back}
              </a>
            )}
          </div>
          <div className="ft-window">
            <AppShot locale={locale} slug="studio-boxes" alt={tL('loop.steps.1.alt')} priority sizes="(min-width: 1120px) 520px, 100vw" />
          </div>
        </section>

        <section className="ft-container py-20 md:py-28">
          <NeuronDiagram
            aria={tL('neuron.aria')}
            inputs={tL.raw('neuron.inputs')}
            outputLabel={tL('neuron.outputLabel')}
            outputTitle={tL('neuron.outputTitle')}
            outputFile={tL('neuron.outputFile')}
            exportLabel={tL('neuron.export')}
          />
        </section>
      </main>
      <Footer />
    </div>
  )
}
