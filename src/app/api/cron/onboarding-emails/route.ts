import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendEmail } from '@/lib/resend'
import { ONBOARDING_STEPS, onboardingMail, type Locale } from '@/lib/onboarding-emails'
import { unsubscribeApiUrl, unsubscribePageUrl } from '@/lib/email-unsubscribe'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

const DAY = 24 * 60 * 60 * 1000
// Nie zwei Mails kurz hintereinander, auch wenn ein Lauf ausgefallen ist
const MIN_GAP = 40 * 60 * 60 * 1000
const MAX_PER_RUN = 100

// Täglicher Cron (siehe vercel.json): verschickt die nächste fällige
// Onboarding-Mail. Pro Nutzer und Lauf höchstens eine Mail.
//
// Erfasst nur Konten, die ab ONBOARDING_SINCE (ISO-Datum) angelegt wurden.
// Ohne diese Env-Var verschickt der Cron nichts – Bestandsnutzer bekommen
// die Serie so nicht nachträglich.
export async function GET(req: NextRequest) {
  const cronSecret = process.env.CRON_SECRET
  if (!cronSecret) return NextResponse.json({ error: 'CRON_SECRET nicht konfiguriert' }, { status: 503 })
  if (req.headers.get('authorization') !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const since = process.env.ONBOARDING_SINCE ? new Date(process.env.ONBOARDING_SINCE) : null
  if (!since || isNaN(since.getTime())) return NextResponse.json({ skipped: 'ONBOARDING_SINCE nicht gesetzt' })

  const now = new Date()
  const lastStep = ONBOARDING_STEPS[ONBOARDING_STEPS.length - 1]
  const oldest = new Date(Math.max(since.getTime(), now.getTime() - (lastStep.afterDays + 4) * DAY))

  const users = await prisma.user.findMany({
    where: {
      createdAt: { gte: oldest },
      emailVerified: true,
      onboardingEmails: true,
      onboardingStep: { lt: lastStep.step },
    },
    select: {
      id: true,
      email: true,
      createdAt: true,
      emailLocale: true,
      onboardingStep: true,
      onboardingLastSentAt: true,
      promoAccessUntil: true,
      stripeSubscriptionId: true,
      lifetimeAccess: true,
      apiKeys: { where: { lastUsedAt: { not: null } }, select: { id: true }, take: 1 },
    },
    orderBy: { createdAt: 'asc' },
    take: MAX_PER_RUN,
  })

  let sent = 0
  for (const u of users) {
    if (u.onboardingLastSentAt && now.getTime() - u.onboardingLastSentAt.getTime() < MIN_GAP) continue

    const ageDays = (now.getTime() - u.createdAt.getTime()) / DAY
    const inTrial = !!u.promoAccessUntil && u.promoAccessUntil > now && !u.stripeSubscriptionId && !u.lifetimeAccess
    // Fällig ist die späteste Mail, deren Zeitpunkt erreicht ist. Verpasste
    // frühere Mails werden übersprungen statt nachgeholt – lieber eine Mail
    // weniger als mehrere auf einmal.
    const due = ONBOARDING_STEPS.filter(
      (s) => s.step > u.onboardingStep && ageDays >= s.afterDays && (!s.trialOnly || inTrial)
    ).pop()
    if (!due) continue

    const locale: Locale = u.emailLocale === 'en' ? 'en' : 'de'
    const mail = onboardingMail(due.step, {
      locale,
      appConnected: u.apiKeys.length > 0,
      trialEndsAt: u.promoAccessUntil,
      registeredAt: u.createdAt,
      unsubscribeUrl: unsubscribePageUrl(u.id, locale),
    })

    // Erst den Fortschritt sichern, dann senden: schlägt der Versand fehl,
    // fehlt dem Nutzer eine Mail – besser als dieselbe Mail doppelt.
    await prisma.user.update({
      where: { id: u.id },
      data: { onboardingStep: due.step, onboardingLastSentAt: now },
    })
    const res = await sendEmail({
      to: u.email,
      ...mail,
      headers: {
        'List-Unsubscribe': `<${unsubscribeApiUrl(u.id)}>`,
        'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
      },
    })
    if (res.sent) sent++
    // Resend erlaubt standardmäßig 2 Anfragen pro Sekunde
    await new Promise((r) => setTimeout(r, 600))
  }

  return NextResponse.json({ checked: users.length, sent })
}
