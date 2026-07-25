import { Heart } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'

/**
 * Fußzeilen-Link.
 *
 * Die 44px-Tap-Targets aus der Mobile-Überarbeitung bleiben – auf dem Handy
 * sind sie nötig. Ab sm greift ein kompakteres Raster: mit Maus braucht ein
 * Textlink keine 44px Höhe, und die Fußzeile war dadurch über 600px hoch,
 * mit so viel Luft zwischen den Einträgen, dass die Spalten nicht mehr als
 * Gruppen lesbar waren.
 */
const footerLink =
  'inline-flex items-center min-h-[44px] sm:min-h-0 sm:py-[5px] text-gray-400 hover:text-white transition-colors duration-[180ms] ease-out'

export function Footer() {
  const t = useTranslations('Footer')

  return (
    <footer className="relative mt-20 md:mt-32 border-t border-white/5">
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-purple-900/10 to-transparent pointer-events-none" />

      <div className="relative max-w-6xl mx-auto px-4 py-12 md:py-16">
        <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-8 md:gap-12 mb-10">
          {/* Brand */}
          <div className="md:col-span-2">
            <h3 className="text-gradient-brand text-xl font-semibold mb-3">
              FrameTrain
            </h3>
            <p className="text-gray-500 text-sm leading-relaxed max-w-sm">
              {t('tagline')}
            </p>

            {/* Social badges
                Vorher hatten die drei Kacheln drei verschiedene Hover-Farben
                (lila/blau/pink) – bei nebeneinanderliegenden, gleichrangigen
                Elementen liest sich das als Bedeutungsunterschied, den es
                nicht gibt. Jetzt eine gemeinsame Hover-Sprache. */}
            <div className="flex gap-2 mt-6">
              <a
                href="https://github.com/FrameSphere/FrameTrain-Website"
                target="_blank"
                rel="noopener noreferrer"
                className="press glass px-4 min-h-[44px] flex items-center rounded-lg text-sm text-gray-400 hover:text-white hover:bg-white/[0.09] transition-colors duration-[180ms] ease-out"
              >
                GitHub
              </a>
              <a
                href="https://www.reddit.com/r/FrameTrain/"
                target="_blank"
                rel="noopener noreferrer"
                className="press glass px-4 min-h-[44px] flex items-center rounded-lg text-sm text-gray-400 hover:text-white hover:bg-white/[0.09] transition-colors duration-[180ms] ease-out"
              >
                Reddit
              </a>
              {/* Discord ist (noch) nicht verlinkt. Vorher sah die Kachel
                  identisch aus wie die beiden echten Links inklusive
                  cursor-pointer und Hover – sie hat einen Klick versprochen,
                  den es nicht gibt. Jetzt klar als inaktiv erkennbar. */}
              <div className="glass px-4 min-h-[44px] flex items-center rounded-lg text-sm text-gray-600 select-none">
                {t('discord')}
              </div>
            </div>
          </div>

          {/* Product */}
          <div>
            <h4 className="text-[11px] font-semibold uppercase tracking-[0.12em] text-gray-500 mb-3">{t('productHeading')}</h4>
            <ul className="text-sm text-gray-400">
              <li>
                <Link href="/#features" className={footerLink}>
                  {t('features')}
                </Link>
              </li>
              <li>
                <Link href="/#pricing" className={footerLink}>
                  {t('pricing')}
                </Link>
              </li>
              <li>
                <Link href="/docs" className={footerLink}>
                  {t('docs')}
                </Link>
              </li>
              <li>
                <Link href="/changelog" className={footerLink}>
                  {t('changelog')}
                </Link>
              </li>
              <li>
                <Link href="/faq" className={footerLink}>
                  {t('faq')}
                </Link>
              </li>
              <li>
                <Link href="/guides" className={footerLink}>
                  {t('guides')}
                </Link>
              </li>
              <li>
                <Link href="/library" className={footerLink}>
                  {t('library')}
                </Link>
              </li>
              <li>
                <Link href="/about" className={footerLink}>
                  {t('about')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-[11px] font-semibold uppercase tracking-[0.12em] text-gray-500 mb-3">{t('legalHeading')}</h4>
            <ul className="text-sm text-gray-400">
              <li>
                <Link href="/privacy" className={footerLink}>
                  {t('privacy')}
                </Link>
              </li>
              <li>
                <Link href="/terms" className={footerLink}>
                  {t('terms')}
                </Link>
              </li>
              <li>
                <Link href="/imprint" className={footerLink}>
                  {t('imprint')}
                </Link>
              </li>
              <li>
                <Link href="/cookies" className={footerLink}>
                  {t('cookies')}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-sm text-gray-500">
            {t.rich('copyright', {
              year: new Date().getFullYear(),
              link: (chunks) => (
                <a
                  href="https://frame-sphere.vercel.app/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-500 no-underline hover:text-gray-300 transition-colors"
                >
                  {chunks}
                </a>
              ),
            })}
          </div>

          <div className="flex items-center gap-2 text-xs text-gray-600">
            <span>{t('madeWithPre')}</span>
            {/* animate-pulse entfernt: ein pulsierendes Herz ganz unten auf
                jeder einzelnen Seite ist Dauerbewegung ohne jede Funktion. */}
            <Heart className="w-3.5 h-3.5 text-pink-500/80 fill-pink-500/80" />
            <span>{t('madeWithPost')}</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
