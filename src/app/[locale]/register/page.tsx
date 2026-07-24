'use client'

import { useState } from 'react'
import { Link } from '@/i18n/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { UserPlus, Mail, Lock, CheckCircle } from 'lucide-react'
import { useTranslations, useLocale } from 'next-intl'

function OAuthButtons() {
  const t = useTranslations('Auth.oauth')
  const tRegister = useTranslations('Auth.register')
  return (
    <div className="mb-6">
      <div className="space-y-3">
      {/* Google */}
      <a
        href="/api/auth/oauth/google"
        className="w-full flex items-center gap-3 px-4 py-3 glass border border-white/10 rounded-xl text-gray-300 hover:border-white/25 hover:text-white hover:bg-white/5 transition-all"
      >
        <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
        </svg>
        <span className="font-medium text-sm">{t('googleRegister')}</span>
      </a>

      {/* GitHub */}
      <a
        href="/api/auth/oauth/github"
        className="w-full flex items-center gap-3 px-4 py-3 glass border border-white/10 rounded-xl text-gray-300 hover:border-white/25 hover:text-white hover:bg-white/5 transition-all"
      >
        <svg className="w-5 h-5 flex-shrink-0 text-white" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
        </svg>
        <span className="font-medium text-sm">{t('githubRegister')}</span>
      </a>

      {/* FrameSphere SSO – identisch mit Login-Seite */}
      <a
        href="/api/auth/framesphere"
        className="w-full flex items-center gap-3 px-4 py-3 glass border border-violet-400/30 rounded-xl text-gray-300 hover:border-violet-400/60 hover:text-white hover:bg-violet-500/5 transition-all group"
      >
        <div className="w-5 h-5 flex-shrink-0 rounded-md bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center shadow-lg shadow-violet-500/25">
          <span className="text-white font-black text-[10px]">FS</span>
        </div>
        <span className="font-medium text-sm group-hover:text-violet-300 transition-colors">
          {t('frameSphereRegister')}
        </span>
        <span className="ml-auto text-[10px] font-semibold text-violet-400 border border-violet-500/40 px-1.5 py-0.5 rounded bg-violet-500/10">
          {t('ssoBadge')}
        </span>
      </a>
      </div>
      <p className="mt-3 text-center text-xs text-gray-500 leading-relaxed">
        {tRegister.rich('oauthConsentNotice', {
          terms: (chunks) => <Link href="/terms" target="_blank" className="text-violet-400 hover:text-violet-300">{chunks}</Link>,
          privacy: (chunks) => <Link href="/privacy" target="_blank" className="text-violet-400 hover:text-violet-300">{chunks}</Link>,
        })}
      </p>
    </div>
  )
}

export default function RegisterPage() {
  const { login } = useAuth()
  const locale = useLocale()
  const t = useTranslations('Auth.register')
  const tFields = useTranslations('Auth.fields')
  const tOauth = useTranslations('Auth.oauth')
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
  })
  const [acceptedTerms, setAcceptedTerms] = useState(false)
  const [diagnosticsConsent, setDiagnosticsConsent] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (formData.password !== formData.confirmPassword) {
      setError(t('errors.passwordMismatch'))
      return
    }

    if (!acceptedTerms) {
      setError(t('consentRequired'))
      return
    }

    setLoading(true)

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          acceptedTerms,
          diagnosticsConsent,
          locale,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || t('errors.registrationFailed'))
      window.location.href = '/payment'
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="glass-strong rounded-2xl shadow-2xl p-8 border border-white/10">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl mb-4">
                <UserPlus className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-white mb-2">{t('heading')}</h1>
              <p className="text-gray-400">{t('subtitle')}</p>
            </div>

            {/* OAuth */}
            <OAuthButtons />

            {/* Divider */}
            <div className="flex items-center gap-3 mb-6">
              <div className="flex-1 h-px bg-white/10" />
              <span className="text-gray-600 text-xs font-medium">{tOauth('divider')}</span>
              <div className="flex-1 h-px bg-white/10" />
            </div>
            
            {error && (
              <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                  {tFields('emailLabel')}
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                  <input
                    id="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full pl-11 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                    placeholder={tFields('emailPlaceholder')}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                  {tFields('passwordLabel')}
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                  <input
                    id="password"
                    type="password"
                    required
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full pl-11 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                    placeholder={t('passwordPlaceholder')}
                    minLength={8}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300 mb-2">
                  {t('confirmPasswordLabel')}
                </label>
                <div className="relative">
                  <CheckCircle className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                  <input
                    id="confirmPassword"
                    type="password"
                    required
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    className="w-full pl-11 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                    placeholder={t('confirmPasswordPlaceholder')}
                  />
                </div>
              </div>

              <div className="space-y-3 pt-1">
                <label className="flex items-start gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    required
                    checked={acceptedTerms}
                    onChange={(e) => setAcceptedTerms(e.target.checked)}
                    className="mt-0.5 w-5 h-5 rounded border-white/20 bg-white/5 text-purple-500 focus:ring-purple-500 focus:ring-offset-0 flex-shrink-0"
                  />
                  <span className="text-sm text-gray-400 leading-relaxed group-hover:text-gray-300 transition">
                    {t.rich('consentLabel', {
                      terms: (chunks) => <Link href="/terms" target="_blank" className="text-violet-400 hover:text-violet-300 underline">{chunks}</Link>,
                      privacy: (chunks) => <Link href="/privacy" target="_blank" className="text-violet-400 hover:text-violet-300 underline">{chunks}</Link>,
                    })}
                  </span>
                </label>

                <label className="flex items-start gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={diagnosticsConsent}
                    onChange={(e) => setDiagnosticsConsent(e.target.checked)}
                    className="mt-0.5 w-5 h-5 rounded border-white/20 bg-white/5 text-purple-500 focus:ring-purple-500 focus:ring-offset-0 flex-shrink-0"
                  />
                  <span className="text-sm text-gray-500 leading-relaxed group-hover:text-gray-400 transition">
                    {t('diagnosticsLabel')}
                  </span>
                </label>
              </div>

              <button
                type="submit"
                disabled={loading || !acceptedTerms}
                className="w-full py-3 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-purple-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? t('submitLoading') : t('submit')}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-gray-400">
              {t('haveAccount')}{' '}
              <Link href="/login" className="text-purple-400 hover:text-purple-300 font-medium transition">
                {t('loginLink')}
              </Link>
            </p>

            <p className="mt-3 text-center text-xs text-gray-600">
              {t('frameSphereHint')}{' '}
              <a href="https://frame-sphere.vercel.app/register" target="_blank" rel="noopener noreferrer"
                className="text-violet-500 hover:text-violet-400 transition">
                {t('frameSphereCta')}
              </a>
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
