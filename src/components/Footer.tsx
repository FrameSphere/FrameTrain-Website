import { Heart } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'

export function Footer() {
  const t = useTranslations('Footer')

  return (
    <footer className="relative mt-20 md:mt-32 border-t border-white/5">
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-purple-900/10 to-transparent pointer-events-none" />

      <div className="relative max-w-6xl mx-auto px-4 py-12 md:py-16">
        <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-8 md:gap-12 mb-12">
          {/* Brand */}
          <div className="md:col-span-2">
            <h3 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-4">
              FrameTrain
            </h3>
            <p className="text-gray-400 text-sm leading-relaxed max-w-md">
              {t('tagline')}
            </p>

            {/* Social badges */}
            <div className="flex gap-3 mt-6">
              <a href="https://github.com/FrameSphere/FrameTrain-Website" target="_blank" rel="noopener noreferrer">
              <div className="glass px-4 min-h-[44px] flex items-center rounded-lg text-sm text-gray-400 hover:text-purple-400 transition cursor-pointer">
                GitHub
              </div>
              </a>
              <a href="https://www.reddit.com/r/FrameTrain/" target="_blank" rel="noopener noreferrer">
              <div className="glass px-4 min-h-[44px] flex items-center rounded-lg text-sm text-gray-400 hover:text-blue-400 transition cursor-pointer">
                Reddit
              </div>
              </a>
              <div className="glass px-4 min-h-[44px] flex items-center rounded-lg text-sm text-gray-400 hover:text-pink-400 transition cursor-pointer">
                {t('discord')}
              </div>
            </div>
          </div>

          {/* Product */}
          <div>
            <h4 className="font-semibold text-white mb-4">{t('productHeading')}</h4>
            <ul className="text-sm text-gray-400">
              <li>
                <Link href="/#features" className="inline-flex items-center min-h-[44px] hover:text-purple-400 transition">
                  {t('features')}
                </Link>
              </li>
              <li>
                <Link href="/#pricing" className="inline-flex items-center min-h-[44px] hover:text-purple-400 transition">
                  {t('pricing')}
                </Link>
              </li>
              <li>
                <Link href="/docs" className="inline-flex items-center min-h-[44px] hover:text-purple-400 transition">
                  {t('docs')}
                </Link>
              </li>
              <li>
                <Link href="/changelog" className="inline-flex items-center min-h-[44px] hover:text-purple-400 transition">
                  {t('changelog')}
                </Link>
              </li>
              <li>
                <Link href="/faq" className="inline-flex items-center min-h-[44px] hover:text-purple-400 transition">
                  {t('faq')}
                </Link>
              </li>
              <li>
                <Link href="/guides" className="inline-flex items-center min-h-[44px] hover:text-purple-400 transition">
                  {t('guides')}
                </Link>
              </li>
              <li>
                <Link href="/library" className="inline-flex items-center min-h-[44px] hover:text-purple-400 transition">
                  {t('library')}
                </Link>
              </li>
              <li>
                <Link href="/about" className="inline-flex items-center min-h-[44px] hover:text-purple-400 transition">
                  {t('about')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-semibold text-white mb-4">{t('legalHeading')}</h4>
            <ul className="text-sm text-gray-400">
              <li>
                <Link href="/privacy" className="inline-flex items-center min-h-[44px] hover:text-purple-400 transition">
                  {t('privacy')}
                </Link>
              </li>
              <li>
                <Link href="/terms" className="inline-flex items-center min-h-[44px] hover:text-purple-400 transition">
                  {t('terms')}
                </Link>
              </li>
              <li>
                <Link href="/imprint" className="inline-flex items-center min-h-[44px] hover:text-purple-400 transition">
                  {t('imprint')}
                </Link>
              </li>
              <li>
                <Link href="/cookies" className="inline-flex items-center min-h-[44px] hover:text-purple-400 transition">
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
            <Heart className="w-4 h-4 text-pink-500 fill-pink-500 animate-pulse" />
            <span>{t('madeWithPost')}</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
