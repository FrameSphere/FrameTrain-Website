import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'
import { CookieSettingsButton } from '@/components/CookieSettingsButton'
import { FeedbackButton } from '@/components/FeedbackButton'
import { GITHUB_URL, SOCIAL_PROFILES } from '@/lib/channels'

/**
 * Fußzeile im Design-System „Neuron": ruhig, 1px-Linie oben, Mono-Labels
 * als Spaltenköpfe. Keine Verläufe, keine Kacheln.
 *
 * 44px-Tap-Targets auf dem Handy, ab sm ein kompakteres Raster.
 */
const footerLink =
  'inline-flex items-center min-h-[44px] sm:min-h-0 sm:py-[5px] text-[15px] text-ink-muted hover:text-ink transition-colors duration-150 ease-out'

export function Footer() {
  const t = useTranslations('Footer')

  const product = [
    { href: '/download', label: t('download') },
    { href: '/install', label: t('install') },
    { href: '/screenshots', label: t('screenshots') },
    { href: '/#pricing', label: t('pricing') },
    { href: '/changelog', label: t('changelog') },
    { href: '/compare', label: t('compare') },
  ]
  const learn = [
    { href: '/docs/ai-training-guide', label: t('coach') },
    { href: '/guides', label: t('guides') },
    { href: '/docs', label: t('docs') },
    { href: '/faq', label: t('faq') },
    { href: '/library', label: t('library') },
    { href: '/about', label: t('about') },
  ]
  const audience = [
    { href: '/computer-vision', label: t('computerVision') },
    { href: '/apple-silicon', label: t('mac') },
    { href: '/gdpr', label: t('gdpr') },
    { href: '/compare/unsloth', label: t('vsUnsloth') },
    { href: '/compare/mlx-lora-studio', label: t('vsMlxLoraStudio') },
    { href: '/compare/google-colab', label: t('vsColab') },
    { href: '/guides/mlx-vs-pytorch', label: t('mlxVsPytorch') },
  ]
  const legal = [
    { href: '/privacy', label: t('privacy') },
    { href: '/terms', label: t('terms') },
    { href: '/imprint', label: t('imprint') },
    { href: '/cookies', label: t('cookies') },
    { href: '/withdrawal', label: t('withdrawal') },
    { href: '/cancel', label: t('cancel') },
  ]

  return (
    <footer className="border-t border-line mt-16">
      <div className="ft-container pt-16 pb-10">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.3fr_1fr_1fr_1fr_1fr]">
          <div>
            <Link href="/" className="inline-flex items-center gap-2.5 text-ink">
              {/* eslint-disable-next-line @next/next/no-img-element -- SVG-Logo */}
              <img src="/brand/frametrain-icon-indigo.svg" alt="" width={30} height={30} className="w-[30px] h-[30px]" />
              <span className="font-semibold text-[16px] tracking-[-0.01em]">FrameTrain</span>
            </Link>
            <p className="mt-4 ft-small max-w-[300px]">{t('taglineNeuron')}</p>
            <div className="mt-6 flex flex-wrap gap-2">
              {[{ label: 'GitHub', url: GITHUB_URL }, ...SOCIAL_PROFILES].map((p) => (
                <a
                  key={p.url}
                  href={p.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ft-btn ft-btn--ghost ft-btn--sm"
                >
                  {p.label}
                </a>
              ))}
            </div>
          </div>

          {[
            { heading: t('productHeading'), items: product },
            { heading: t('audienceHeading'), items: audience },
            { heading: t('learnHeading'), items: learn },
            { heading: t('legalHeading'), items: legal },
          ].map((col, i) => (
            <div key={col.heading}>
              <h2 className="ft-label mb-3">{col.heading}</h2>
              <ul>
                {col.items.map((l) => (
                  <li key={l.href}>
                    <Link href={l.href} className={footerLink}>
                      {l.label}
                    </Link>
                  </li>
                ))}
                {i === 2 && (
                  <li>
                    <FeedbackButton label={t('feedback')} className={`${footerLink} text-left`} />
                  </li>
                )}
                {i === 3 && (
                  <li>
                    {/* Widerruf der Analyse-Einwilligung – erscheint nur, wenn ein Tag konfiguriert ist */}
                    <CookieSettingsButton className={`${footerLink} text-left`} />
                  </li>
                )}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-14 pt-6 border-t border-line flex flex-col sm:flex-row sm:items-center justify-between gap-3 ft-data text-ink-faint">
          <span>
            {t.rich('copyright', {
              year: new Date().getFullYear(),
              link: (chunks) => (
                <a
                  href="https://frame-sphere.vercel.app/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-ink transition-colors duration-150"
                >
                  {chunks}
                </a>
              ),
            })}
          </span>
          <span>{t('madeIn')}</span>
        </div>
      </div>
    </footer>
  )
}
