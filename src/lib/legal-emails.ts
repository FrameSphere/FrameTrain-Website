import { sendEmail } from '@/lib/resend'
import { siteUrl } from '@/lib/seo'

// ─── Pflicht-Mails aus dem Vertragsrecht ───────────────────────────────────────
//
// Alle drei Mails sind die Bestätigung „auf einem dauerhaften Datenträger“, die
// das Gesetz verlangt:
//   - Vertragsbestätigung inkl. Widerrufsverzicht   § 312f Abs. 2, § 356 Abs. 5 BGB
//   - Eingangsbestätigung Kündigung                 § 312k Abs. 4 BGB
//   - Eingangsbestätigung Widerruf                  § 356a BGB
// Kündigung und Widerruf gehen zusätzlich in Kopie an den Betreiber, weil die
// Erklärung auch dann wirksam ist, wenn sie sich keinem Konto zuordnen lässt.

type Locale = 'de' | 'en'

export const LEGAL_INBOX = process.env.LEGAL_INBOX_EMAIL ?? 'framesphere@gmx.net'

function esc(v: string) {
  return v.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!))
}

function formatDate(d: Date, locale: Locale) {
  return d.toLocaleString(locale === 'en' ? 'en-GB' : 'de-DE', {
    dateStyle: 'long',
    timeStyle: 'short',
    timeZone: 'Europe/Berlin',
  })
}

function layout(body: string) {
  return `<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 520px; margin: 0 auto; color: #222; line-height: 1.55;">${body}
    <p style="margin-top: 28px; font-size: 12px; color: #888;">Karol Paschek · FrameTrain · Universitätsstraße 8, 55270 Zornheim · <a href="${siteUrl}/de/imprint" style="color:#888;">Impressum</a></p>
  </div>`
}

function rows(items: [string, string][]) {
  return `<table style="border-collapse: collapse; font-size: 14px; margin: 12px 0;">${items
    .map(([k, v]) => `<tr><td style="padding: 3px 14px 3px 0; color: #666; vertical-align: top;">${esc(k)}</td><td style="padding: 3px 0;">${esc(v)}</td></tr>`)
    .join('')}</table>`
}

/** Vertragsbestätigung nach abgeschlossenem Checkout, inkl. Bestätigung des Widerrufsverzichts. */
export async function sendContractConfirmation(p: {
  to: string
  locale: Locale
  plan: string
  amount: string
  waiverAt: Date
  trialEnd: Date | null
}) {
  const en = p.locale === 'en'
  const planLabel = p.plan === 'yearly' ? (en ? 'Yearly subscription' : 'Jahresabo') : (en ? 'Monthly subscription' : 'Monatsabo')
  const terms = `${siteUrl}/${p.locale}/terms`
  const withdrawal = `${siteUrl}/${p.locale}/withdrawal`
  const cancel = `${siteUrl}/${p.locale}/cancel`

  const subject = en ? 'Your FrameTrain subscription – contract confirmation' : 'Dein FrameTrain-Abo – Vertragsbestätigung'
  const items: [string, string][] = [
    [en ? 'Product' : 'Produkt', `FrameTrain – ${planLabel}`],
    [en ? 'Price' : 'Preis', p.amount],
    ...(p.trialEnd ? [[en ? 'First charge' : 'Erste Abbuchung', formatDate(p.trialEnd, p.locale)] as [string, string]] : []),
    [en ? 'Renewal' : 'Verlängerung', en ? 'Automatic, cancellable at any time to the end of the billing period' : 'Automatisch, jederzeit zum Ende der Abrechnungsperiode kündbar'],
  ]
  const waiver = en
    ? `On ${formatDate(p.waiverAt, p.locale)} you expressly requested that we start performing the contract before the withdrawal period ends, and you confirmed that you are aware that you thereby lose your right of withdrawal once performance has begun (§ 356(5) BGB).`
    : `Am ${formatDate(p.waiverAt, p.locale)} hast du ausdrücklich verlangt, dass wir vor Ablauf der Widerrufsfrist mit der Vertragserfüllung beginnen, und bestätigt, dass dir bekannt ist, dass du dadurch dein Widerrufsrecht verlierst, sobald mit der Vertragserfüllung begonnen wurde (§ 356 Abs. 5 BGB).`

  // TODO/ANWALT PRÜFEN: Ob ein Link auf die AGB als „dauerhafter Datenträger“
  // genügt oder die AGB als PDF angehängt werden müssen.
  const html = layout(`
    <h2 style="margin-bottom: 4px;">${en ? 'Thanks for subscribing to FrameTrain' : 'Danke für dein FrameTrain-Abo'}</h2>
    <p>${en ? 'This email confirms your contract.' : 'Mit dieser Mail bestätigen wir deinen Vertrag.'}</p>
    ${rows(items)}
    <p style="font-size: 14px;"><strong>${en ? 'Right of withdrawal' : 'Widerrufsrecht'}:</strong> ${esc(waiver)}</p>
    <p style="font-size: 14px;">${en ? 'Terms' : 'AGB'}: <a href="${terms}">${terms}</a><br>
    ${en ? 'Withdrawal policy' : 'Widerrufsbelehrung'}: <a href="${withdrawal}">${withdrawal}</a><br>
    ${en ? 'Cancel contract' : 'Vertrag kündigen'}: <a href="${cancel}">${cancel}</a></p>`)
  const text = [
    subject,
    '',
    ...items.map(([k, v]) => `${k}: ${v}`),
    '',
    `${en ? 'Right of withdrawal' : 'Widerrufsrecht'}: ${waiver}`,
    '',
    `${en ? 'Terms' : 'AGB'}: ${terms}`,
    `${en ? 'Withdrawal policy' : 'Widerrufsbelehrung'}: ${withdrawal}`,
    `${en ? 'Cancel contract' : 'Vertrag kündigen'}: ${cancel}`,
  ].join('\n')

  return sendEmail({ to: p.to, subject, html, text })
}

export type DeclarationKind = 'cancel' | 'withdrawal'

/** Eingangsbestätigung für Kündigung (§ 312k) bzw. Widerruf (§ 356a) – an Kunde und Betreiber. */
export async function sendDeclarationReceipt(p: {
  kind: DeclarationKind
  locale: Locale
  receivedAt: Date
  fields: [string, string][]
  to: string
  outcome: string
}) {
  const en = p.locale === 'en'
  const what = p.kind === 'cancel' ? (en ? 'cancellation' : 'Kündigung') : (en ? 'withdrawal' : 'Widerruf')
  const subject = en ? `We have received your ${what}` : `Wir haben deine${p.kind === 'cancel' ? ' Kündigung' : 'n Widerruf'} erhalten`
  const items: [string, string][] = [...p.fields, [en ? 'Received' : 'Eingegangen am', formatDate(p.receivedAt, p.locale)]]

  const html = layout(`
    <h2 style="margin-bottom: 4px;">${esc(subject)}</h2>
    <p>${en ? `This confirms that your ${what} reached us with the following content:` : `Hiermit bestätigen wir den Eingang deine${p.kind === 'cancel' ? 'r Kündigung' : 's Widerrufs'} mit folgendem Inhalt:`}</p>
    ${rows(items)}
    <p style="font-size: 14px;">${esc(p.outcome)}</p>`)
  const text = [subject, '', ...items.map(([k, v]) => `${k}: ${v}`), '', p.outcome].join('\n')

  const customer = await sendEmail({ to: p.to, subject, html, text })
  await sendEmail({
    to: LEGAL_INBOX,
    subject: `[${p.kind === 'cancel' ? 'Kündigung' : 'Widerruf'}] ${p.to}`,
    html,
    text,
  })
  return customer
}
