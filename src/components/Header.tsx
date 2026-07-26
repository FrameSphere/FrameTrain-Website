'use client'

import { Home, Sparkles, Bell, Menu, X } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { useEffect, useState, useCallback } from 'react'
import { useTranslations, useLocale } from 'next-intl'
import { Link, usePathname, useRouter } from '@/i18n/navigation'
import { ChangelogModal, useChangelogBadge } from '@/components/ChangelogModal'

function LangSwitcher({ size = 'sm' }: { size?: 'sm' | 'lg' }) {
  const locale = useLocale()
  const pathname = usePathname()
  const router = useRouter()

  const toggle = (l: 'de' | 'en') => {
    router.replace(pathname, { locale: l })
  }

  return (
    <div className="flex items-center gap-0.5 p-1 rounded-xl"
      style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
      {(['de', 'en'] as const).map(l => (
        <button
          key={l}
          onClick={() => toggle(l)}
          className={`press rounded-lg font-semibold uppercase tracking-wide transition-colors duration-[180ms] ease-out ${
            size === 'lg'
              ? 'flex-1 px-4 py-2.5 text-sm min-h-[44px]'
              : 'px-2.5 py-2 text-xs min-h-[36px]'
          } ${
            locale === l
              ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-sm'
              : 'text-gray-500 hover:text-gray-300'
          }`}
        >
          {l}
        </button>
      ))}
    </div>
  )
}

/**
 * Desktop-Navigationslink.
 *
 * Vorher stand die Klassenkette zwölfmal wörtlich im JSX – eine Änderung
 * hätte zwölf Stellen gebraucht, und genau so entstehen Nav-Punkte, die
 * sich minimal unterschiedlich verhalten.
 *
 * transition-all → transition-colors: `all` animiert auch Eigenschaften,
 * die man nie animieren wollte (u. a. das Border-Erbe aus dem globalen
 * `*`-Selektor). 300ms → 180ms, weil ein Nav-Hover die häufigste
 * Interaktion der Seite ist und bei 300ms spürbar hinterherhinkt.
 */
const navLink =
  'px-3.5 py-2 text-[15px] text-gray-400 hover:text-white hover:bg-white/[0.06] rounded-xl transition-colors duration-[180ms] ease-out'

/** Link style inside the mobile drawer – full width, 48px tap target. */
const drawerLink =
  'flex items-center gap-3 w-full px-4 min-h-[48px] py-3 text-gray-200 hover:text-white hover:bg-white/5 rounded-xl transition-colors duration-[180ms]'

export function Header() {
  const { user, logout, isAuthenticated, loading } = useAuth()
  const [scrolled, setScrolled] = useState(false)
  const [changelogOpen, setChangelogOpen] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const { count: badgeCount, refresh: refreshBadge } = useChangelogBadge()
  const t = useTranslations('Nav')
  const pathname = usePathname()

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Menü bei Navigation schließen
  useEffect(() => {
    setMenuOpen(false)
  }, [pathname])

  // Scroll-Lock + ESC, solange das Menü offen ist
  useEffect(() => {
    if (!menuOpen) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMenuOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = prev
      window.removeEventListener('keydown', onKey)
    }
  }, [menuOpen])

  const handleBellClick = useCallback(() => {
    setMenuOpen(false)
    setChangelogOpen(true)
  }, [])
  const handleModalClose = useCallback(() => setChangelogOpen(false), [])
  const handleRead = useCallback(() => refreshBadge(), [refreshBadge])
  const closeMenu = useCallback(() => setMenuOpen(false), [])

  const bell = (
    <button
      onClick={handleBellClick}
      title={t('whatsNew')}
      aria-label={t('whatsNew')}
      className="press relative flex items-center justify-center min-w-[44px] min-h-[44px] text-gray-400 hover:text-white hover:bg-white/[0.06] rounded-xl transition-colors duration-[180ms] ease-out"
    >
      <Bell className="w-[18px] h-[18px]" />
      {badgeCount > 0 && (
        // animate-pulse entfernt: ein dauerhaft pulsierender roter Punkt in
        // der obersten Leiste zieht auf jeder Unterseite permanent Blick ab.
        // Die Farbe allein reicht als Signal – der Zähler blendet einmal ein.
        <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-purple-500 text-[10px] font-bold text-white shadow-sm shadow-purple-500/40 animate-enter">
          {badgeCount > 9 ? '9+' : badgeCount}
        </span>
      )}
    </button>
  )

  return (
    <>
      {/* Spacer for fixed header */}
      <div className="h-20" />

      {/* Abdunklung hinter dem offenen Mobile-Menü */}
      {menuOpen && (
        <div
          className="xl:hidden fixed inset-0 z-40 bg-black/60 animate-enter"
          onClick={closeMenu}
          aria-hidden="true"
        />
      )}

      {/* Dynamic Island Header
          Vorher wurde beim Scrollen gleichzeitig die ganze Leiste auf 95 %
          skaliert UND ihre Breite verändert – zwei gegenläufige Bewegungen
          über 500ms, die sich beim Scrollen gegenseitig aufgehoben haben und
          den Text in der Pille kurz unscharf machten. Jetzt bleibt die Größe
          stabil; auf Scroll ändern sich nur Rand und Schatten, also genau
          das, was "ich liege jetzt über dem Inhalt" kommuniziert. */}
      <header className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[92vw] max-w-6xl">
        <div
          className={`
            glass-strong rounded-[2rem] px-4 sm:px-6 py-3 border
            transition-[border-color,box-shadow,background-color] duration-300 ease-out
            ${scrolled
              ? 'border-white/[0.14] shadow-[0_8px_32px_-8px_rgba(0,0,0,0.9)]'
              : 'border-white/[0.08] shadow-[0_4px_24px_-12px_rgba(0,0,0,0.6)]'}
          `}
          // Offenes Menü braucht einen deckenden Hintergrund, sonst scheint
          // der Hero-Glow durch das Glas und die Links werden unruhig.
          style={menuOpen ? { background: 'rgba(10, 10, 16, 0.97)' } : undefined}
        >
          <div className="flex items-center justify-between gap-2">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 sm:gap-3 group shrink-0" onClick={closeMenu}>
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl blur-md opacity-75 group-hover:opacity-100 transition" />
                <div className="relative bg-gradient-to-br from-purple-600 to-pink-600 p-2 rounded-xl">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
              </div>
              <span className="text-lg sm:text-xl font-bold text-gradient-brand">
                FrameTrain
              </span>
            </Link>

            {/* ── Desktop-Navigation (ab xl, davor passt sie nicht in die Pille) ── */}
            <nav className="hidden xl:flex items-center gap-2">
              {!loading && (
                <>
                  {isAuthenticated ? (
                    <>
                      <Link
                        href="/"
                        className={`flex items-center gap-2 ${navLink}`}
                        title={t('homeTitle')}
                      >
                        <Home className="w-4 h-4" />
                        <span>{t('home')}</span>
                      </Link>
                      <Link
                        href="/dashboard"
                        className={navLink}
                      >
                        {t('dashboard')}
                      </Link>
                      <Link
                        href="/library"
                        className={navLink}
                      >
                        {t('library')}
                      </Link>
                      <Link
                        href="/extensions"
                        className={navLink}
                      >
                        {t('extensions')}
                      </Link>
                      <Link
                        href="/docs"
                        className={navLink}
                      >
                        {t('docs')}
                      </Link>

                      <LangSwitcher />
                      {bell}

                      <div className="flex items-center px-3 py-1.5 glass rounded-lg text-sm text-gray-400 ml-2 max-w-[180px] truncate">
                        {user?.email}
                      </div>
                      <button
                        onClick={logout}
                        className={navLink}
                      >
                        {t('logout')}
                      </button>
                    </>
                  ) : (
                    <>
                      <Link
                        href="/#features"
                        className={navLink}
                      >
                        {t('features')}
                      </Link>
                      <Link
                        href="/extensions"
                        className={navLink}
                      >
                        {t('extensions')}
                      </Link>
                      <Link
                        href="/library"
                        className={navLink}
                      >
                        {t('library')}
                      </Link>
                      <Link
                        href="/guides"
                        className={navLink}
                      >
                        {t('guides')}
                      </Link>
                      <Link
                        href="/about"
                        className={navLink}
                      >
                        {t('about')}
                      </Link>
                      <Link
                        href="/#pricing"
                        className={navLink}
                      >
                        {t('pricing')}
                      </Link>

                      <LangSwitcher />
                      {bell}

                      <Link href="/login" className={navLink}>
                        {t('login')}
                      </Link>
                      <Link href="/register" className="press relative group px-4 py-2 ml-1 rounded-xl overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 animate-gradient" />
                        <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 opacity-0 group-hover:opacity-100 blur transition-opacity duration-300" />
                        <span className="relative text-white font-semibold text-[15px]">{t('start')}</span>
                      </Link>
                    </>
                  )}
                </>
              )}
            </nav>

            {/* ── Mobile-Steuerung (bis xl) ── */}
            <div className="flex xl:hidden items-center gap-1 shrink-0">
              {bell}
              <button
                onClick={() => setMenuOpen(o => !o)}
                aria-label={menuOpen ? t('closeMenu') : t('openMenu')}
                aria-expanded={menuOpen}
                className="press flex items-center justify-center min-w-[44px] min-h-[44px] text-gray-300 hover:text-white hover:bg-white/[0.06] rounded-xl transition-colors duration-[180ms] ease-out"
              >
                {menuOpen ? <X className="w-[22px] h-[22px]" /> : <Menu className="w-[22px] h-[22px]" />}
              </button>
            </div>
          </div>

          {/* ── Mobile-Menü (aufklappend, innerhalb der Pille) ──
              dvh statt vh: iOS rechnet 100vh inkl. ein-/ausfahrender Toolbars
              animate-enter: das Menü erschien vorher schlagartig – bei einem
              Panel, das den halben Bildschirm einnimmt, liest sich das als
              Ruckler, nicht als Reaktion. */}
          {menuOpen && (
            <div className="xl:hidden mt-3 pt-3 border-t border-white/10 max-h-[calc(100dvh-9rem)] overflow-y-auto overscroll-contain animate-enter">
              {!loading && (
                <nav className="flex flex-col gap-1 pb-2">
                  {isAuthenticated ? (
                    <>
                      <Link href="/" className={drawerLink}>
                        <Home className="w-4 h-4 shrink-0" />
                        {t('home')}
                      </Link>
                      <Link href="/dashboard" className={drawerLink}>{t('dashboard')}</Link>
                      <Link href="/library" className={drawerLink}>{t('library')}</Link>
                      <Link href="/extensions" className={drawerLink}>{t('extensions')}</Link>
                      <Link href="/docs" className={drawerLink}>{t('docs')}</Link>
                      <Link href="/guides" className={drawerLink}>{t('guides')}</Link>

                      <div className="mt-2 pt-3 border-t border-white/10">
                        {user?.email && (
                          <div className="px-4 pb-2 text-sm text-gray-500 break-all">{user.email}</div>
                        )}
                        <button
                          onClick={() => { setMenuOpen(false); logout() }}
                          className={drawerLink}
                        >
                          {t('logout')}
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      <Link href="/#features" className={drawerLink}>{t('features')}</Link>
                      <Link href="/extensions" className={drawerLink}>{t('extensions')}</Link>
                      <Link href="/library" className={drawerLink}>{t('library')}</Link>
                      <Link href="/guides" className={drawerLink}>{t('guides')}</Link>
                      <Link href="/docs" className={drawerLink}>{t('docs')}</Link>
                      <Link href="/about" className={drawerLink}>{t('about')}</Link>
                      <Link href="/#pricing" className={drawerLink}>{t('pricing')}</Link>

                      <div className="mt-2 pt-3 border-t border-white/10 flex flex-col gap-2">
                        <Link
                          href="/login"
                          className="card-lift flex items-center justify-center w-full px-4 min-h-[48px] rounded-xl glass text-gray-200 font-semibold hover:bg-white/10 transition-colors"
                        >
                          {t('login')}
                        </Link>
                        <Link
                          href="/register"
                          className="relative flex items-center justify-center w-full px-4 min-h-[48px] rounded-xl overflow-hidden"
                        >
                          <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 animate-gradient" />
                          <span className="relative text-white font-bold">{t('start')}</span>
                        </Link>
                      </div>
                    </>
                  )}

                  <div className="mt-3 pt-3 border-t border-white/10">
                    <div className="px-1 pb-2 text-xs uppercase tracking-widest text-gray-500 font-bold">
                      {t('language')}
                    </div>
                    <LangSwitcher size="lg" />
                  </div>
                </nav>
              )}
            </div>
          )}
        </div>
      </header>

      {/* Changelog Modal */}
      <ChangelogModal
        open={changelogOpen}
        onClose={handleModalClose}
        onRead={handleRead}
      />
    </>
  )
}
