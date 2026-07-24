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
          className={`rounded-lg font-bold uppercase tracking-wide transition-all duration-200 ${
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

/** Link style inside the mobile drawer – full width, 48px tap target. */
const drawerLink =
  'flex items-center gap-3 w-full px-4 min-h-[48px] py-3 text-gray-200 hover:text-white hover:bg-white/5 rounded-xl transition-colors'

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
      className="relative flex items-center justify-center min-w-[44px] min-h-[44px] text-gray-400 hover:text-white hover:bg-white/5 rounded-xl transition-all duration-300"
    >
      <Bell className="w-5 h-5" />
      {badgeCount > 0 && (
        <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-purple-500 text-[10px] font-black text-white shadow-lg shadow-purple-500/50 animate-pulse">
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
          className="xl:hidden fixed inset-0 z-40 bg-black/60"
          onClick={closeMenu}
          aria-hidden="true"
        />
      )}

      {/* Dynamic Island Header */}
      <header
        className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 transition-all duration-500 ${
          scrolled ? 'scale-95' : 'scale-100'
        }`}
      >
        <div
          className={`
            glass-strong rounded-[2rem] px-4 sm:px-6 py-3
            transition-all duration-500
            border border-white/10
            shadow-2xl shadow-purple-500/20
            ${scrolled ? 'w-[95vw] max-w-7xl' : 'w-[92vw] max-w-6xl'}
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
              <span className="text-lg sm:text-xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
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
                        className="flex items-center gap-2 px-4 py-2 text-gray-300 hover:text-white hover:bg-white/5 rounded-xl transition-all duration-300"
                        title={t('homeTitle')}
                      >
                        <Home className="w-4 h-4" />
                        <span>{t('home')}</span>
                      </Link>
                      <Link
                        href="/dashboard"
                        className="px-4 py-2 text-gray-300 hover:text-white hover:bg-white/5 rounded-xl transition-all duration-300"
                      >
                        {t('dashboard')}
                      </Link>
                      <Link
                        href="/library"
                        className="px-4 py-2 text-gray-300 hover:text-white hover:bg-white/5 rounded-xl transition-all duration-300"
                      >
                        {t('library')}
                      </Link>
                      <Link
                        href="/extensions"
                        className="px-4 py-2 text-gray-300 hover:text-white hover:bg-white/5 rounded-xl transition-all duration-300"
                      >
                        {t('extensions')}
                      </Link>
                      <Link
                        href="/docs"
                        className="px-4 py-2 text-gray-300 hover:text-white hover:bg-white/5 rounded-xl transition-all duration-300"
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
                        className="px-4 py-2 text-gray-300 hover:text-white hover:bg-white/5 rounded-xl transition-all duration-300"
                      >
                        {t('logout')}
                      </button>
                    </>
                  ) : (
                    <>
                      <Link
                        href="/#features"
                        className="px-4 py-2 text-gray-300 hover:text-white hover:bg-white/5 rounded-xl transition-all duration-300"
                      >
                        {t('features')}
                      </Link>
                      <Link
                        href="/extensions"
                        className="px-4 py-2 text-gray-300 hover:text-white hover:bg-white/5 rounded-xl transition-all duration-300"
                      >
                        {t('extensions')}
                      </Link>
                      <Link
                        href="/library"
                        className="px-4 py-2 text-gray-300 hover:text-white hover:bg-white/5 rounded-xl transition-all duration-300"
                      >
                        {t('library')}
                      </Link>
                      <Link
                        href="/guides"
                        className="px-4 py-2 text-gray-300 hover:text-white hover:bg-white/5 rounded-xl transition-all duration-300"
                      >
                        {t('guides')}
                      </Link>
                      <Link
                        href="/about"
                        className="px-4 py-2 text-gray-300 hover:text-white hover:bg-white/5 rounded-xl transition-all duration-300"
                      >
                        {t('about')}
                      </Link>
                      <Link
                        href="/#pricing"
                        className="px-4 py-2 text-gray-300 hover:text-white hover:bg-white/5 rounded-xl transition-all duration-300"
                      >
                        {t('pricing')}
                      </Link>

                      <LangSwitcher />
                      {bell}

                      <Link href="/login" className="px-4 py-2 text-gray-300 hover:text-white hover:bg-white/5 rounded-xl transition-all duration-300">
                        {t('login')}
                      </Link>
                      <Link href="/register" className="relative group px-5 py-2 rounded-xl overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 animate-gradient" />
                        <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 opacity-0 group-hover:opacity-100 blur transition-opacity" />
                        <span className="relative text-white font-semibold">{t('start')}</span>
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
                className="flex items-center justify-center min-w-[44px] min-h-[44px] text-gray-300 hover:text-white hover:bg-white/5 rounded-xl transition-all duration-300"
              >
                {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>

          {/* ── Mobile-Menü (aufklappend, innerhalb der Pille) ──
              dvh statt vh: iOS rechnet 100vh inkl. ein-/ausfahrender Toolbars */}
          {menuOpen && (
            <div className="xl:hidden mt-3 pt-3 border-t border-white/10 max-h-[calc(100dvh-9rem)] overflow-y-auto overscroll-contain">
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
                          className="flex items-center justify-center w-full px-4 min-h-[48px] rounded-xl glass text-gray-200 font-semibold hover:bg-white/10 transition-colors"
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
