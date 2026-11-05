import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { AlertTriangle, Check, ExternalLink, Lock, ShieldCheck } from 'lucide-react'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { Link } from '@/i18n/navigation'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'
import { utilityMetadata } from '@/lib/seo'
import { onlyLoopbackRedirects, resolveClient } from '@/lib/mcp/clients'
import { checkAuthorizeRequest, signConsentTicket } from '@/lib/mcp/authorize'
import { PartnerLogos, partnerOf } from '@/components/mcp/PartnerLogos'

// OAuth-2.1-Authorize-Endpunkt fuer Claude.ai / ChatGPT (Vertrag Abschnitt 6).
// Nutzt die normale Website-Anmeldung (auth-token-Cookie) und zeigt die Zustimmung.
export const dynamic = 'force-dynamic'

type Props = {
  params: Promise<{ locale: string }>
  searchParams: Record<string, string | string[] | undefined>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  return utilityMetadata(locale, 'oauthAuthorize', '/oauth/authorize', false)
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-lg ft-card">{children}</div>
      </main>
      <Footer />
    </div>
  )
}

function hostOf(uri: string): string {
  try {
    return new URL(uri).host
  } catch {
    return uri
  }
}

export default async function OAuthAuthorizePage({ params, searchParams }: Props) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations({ locale, namespace: 'OAuthConsent' })

  const client = await resolveClient(searchParams.client_id, { refresh: true })
  const check = checkAuthorizeRequest(searchParams, client)

  if (check.kind === 'fatal') {
    return (
      <Shell>
        <div className="flex items-center gap-3 mb-4">
          <AlertTriangle className="w-6 h-6 text-danger" />
          <h1 className="text-xl font-semibold text-ink">{t('errorTitle')}</h1>
        </div>
        <p className="text-sm text-ink-muted">{t(`errors.${check.reason}`)}</p>
      </Shell>
    )
  }
  if (check.kind === 'redirect_error') redirect(check.url)
  const p = check.params

  const user = await getCurrentUser()
  if (!user) {
    const qs = new URLSearchParams()
    for (const [k, v] of Object.entries(searchParams)) if (typeof v === 'string') qs.set(k, v)
    redirect(`/${locale}/login?next=${encodeURIComponent(`/oauth/authorize?${qs.toString()}`)}`)
  }

  const dbUser = await prisma.user.findUnique({
    where: { id: user.userId },
    select: { email: true, hasPaid: true },
  })
  if (!dbUser) redirect(`/${locale}/login`)

  const ticket = signConsentTicket(user.userId, p)
  const clientName = client!.clientName
  const redirectHost = hostOf(p.redirectUri)
  const loopbackOnly = onlyLoopbackRedirects(client!.redirectUris)

  const denyForm = (label: string, primary = false) => (
    <form method="post" action="/api/oauth/authorize" className="flex-1">
      <input type="hidden" name="ticket" value={ticket} />
      <input type="hidden" name="decision" value="deny" />
      <button
        type="submit"
        className={
          primary
            ? 'ft-btn ft-btn--primary w-full'
            : 'ft-btn ft-btn--ghost w-full'
        }
      >
        {label}
      </button>
    </form>
  )

  return (
    <Shell>
      <div className="mb-6">
        <PartnerLogos partner={partnerOf(client!.clientId, clientName, redirectHost)} />
      </div>
      <h1 className="text-2xl font-semibold text-ink text-center mb-2">{t('title', { client: clientName })}</h1>
      <p className="text-sm text-ink-muted text-center mb-6">{t('signedInAs', { email: dbUser.email })}</p>

      <div className="mb-5 px-4 py-3 rounded-md bg-surface-raised border border-line text-sm">
        <div className="flex items-center gap-2 text-ink">
          <ExternalLink className="w-4 h-4 text-ink-muted" />
          <span>{t('redirectTo')}</span>
          <span className="font-mono font-semibold break-all">{redirectHost}</span>
        </div>
        {client!.registrationType === 'cimd' && (
          <p className="mt-1 text-xs text-ink-faint">{t('verifiedBy', { host: hostOf(client!.clientId) })}</p>
        )}
      </div>

      {loopbackOnly && (
        <div className="mb-5 px-4 py-3 rounded-md border border-warning text-warning text-sm flex gap-2">
          <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <span>{t('loopbackWarning')}</span>
        </div>
      )}

      {!dbUser.hasPaid ? (
        <>
          <div className="mb-6 px-4 py-3 rounded-md border border-danger text-sm text-ink flex gap-2">
            <Lock className="w-4 h-4 flex-shrink-0 mt-0.5 text-danger" />
            <span>{t('noSubscription')}</span>
          </div>
          <div className="flex gap-3">
            {denyForm(t('cancel'))}
            <Link
              href="/payment"
              className="ft-btn ft-btn--primary flex-1"
            >
              {t('getLicense')}
            </Link>
          </div>
        </>
      ) : (
        <>
          <h2 className="text-sm font-semibold text-ink mb-3">{t('allowsHeading')}</h2>
          <ul className="space-y-2 mb-6 text-sm text-ink-muted">
            {(['tools', 'approval', 'appRequired', 'revoke'] as const).map((k) => (
              <li key={k} className="flex gap-2">
                {k === 'approval' ? (
                  <ShieldCheck className="w-4 h-4 flex-shrink-0 mt-0.5 text-ink-muted" strokeWidth={1.5} />
                ) : (
                  <Check className="w-4 h-4 flex-shrink-0 mt-0.5 text-ink-muted" strokeWidth={1.5} />
                )}
                <span>{t(`allows.${k}`)}</span>
              </li>
            ))}
          </ul>
          <div className="flex gap-3">
            {denyForm(t('deny'))}
            <form method="post" action="/api/oauth/authorize" className="flex-1">
              <input type="hidden" name="ticket" value={ticket} />
              <input type="hidden" name="decision" value="approve" />
              <button
                type="submit"
                className="ft-btn ft-btn--primary w-full"
              >
                {t('approve')}
              </button>
            </form>
          </div>
          <p className="mt-5 text-xs text-ink-faint text-center">
            {t.rich('privacyNote', {
              privacy: (chunks) => (
                <Link href="/privacy" className="text-indigo-text underline">
                  {chunks}
                </Link>
              ),
            })}
          </p>
        </>
      )}
    </Shell>
  )
}
