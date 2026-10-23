import { Resend } from 'resend'
import { siteUrl } from '@/lib/seo'
import { VIDEOS, youtubeWatchUrl, youtubeThumbnail } from '@/lib/videos'

// KEIN Fallback-Key: ein hartcodierter Default gäbe es hier zwar nicht,
// aber ohne Key würde Resend erst beim Versand mit einer kryptischen
// Fehlermeldung scheitern. Lieber früh und klar fehlschlagen.
const RESEND_API_KEY = process.env.RESEND_API_KEY
const resend = RESEND_API_KEY ? new Resend(RESEND_API_KEY) : null

// Muss eine auf frame-train.com verifizierte Absenderadresse sein (Resend Domain-Verifizierung).
const EMAIL_FROM = process.env.EMAIL_FROM ?? 'FrameTrain <no-reply@frame-train.com>'

type Locale = 'de' | 'en'

// Install-Tutorial als verlinktes Thumbnail. In E-Mails lässt sich kein Player
// einbetten, deshalb führt der Klick direkt auf YouTube. Der Setup-Link geht so
// gleich in der ERSTEN Mail mit raus – genau die Lücke, an der neue Nutzer sonst
// nach dem Download hängenbleiben.
const installVideoUrl = youtubeWatchUrl(VIDEOS.install)
const installVideoThumb = youtubeThumbnail(VIDEOS.install)

function installVideoBlock(locale: Locale) {
  const heading = locale === 'en' ? 'Already got your account? Install in 2 minutes.' : 'Account bestätigt? In 2 Minuten installiert.'
  const cta = locale === 'en' ? '▶ Watch the install tutorial' : '▶ Installations-Tutorial ansehen'
  const alt = locale === 'en' ? 'How to install FrameTrain – video' : 'FrameTrain installieren – Video'
  return `
        <div style="margin-top: 28px; padding-top: 20px; border-top: 1px solid #eee;">
          <p style="margin: 0 0 12px; font-weight: 600; color: #111;">${heading}</p>
          <a href="${installVideoUrl}" style="text-decoration: none; color: inherit; display: block;">
            <img src="${installVideoThumb}" width="456" alt="${alt}" style="width: 100%; max-width: 456px; border-radius: 10px; display: block; border: 1px solid #eee;" />
            <span style="display: inline-block; margin-top: 10px; color: #3b3ed6; font-weight: 600;">${cta}</span>
          </a>
        </div>`
}

function verificationCopy(locale: Locale, verifyUrl: string) {
  if (locale === 'en') {
    return {
      subject: 'Confirm your FrameTrain email address',
      html: `
        <div style="font-family: -apple-system, Helvetica, Arial, sans-serif; max-width: 480px; margin: 0 auto; color: #111;">
          <h2 style="margin-bottom: 8px;">Confirm your email address</h2>
          <p>Thanks for signing up for FrameTrain! Please confirm your email address to activate your account.</p>
          <p style="margin: 24px 0;">
            <a href="${verifyUrl}" style="background: #3b3ed6; color: #fff; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; display: inline-block;">
              Confirm email
            </a>
          </p>
          <p style="color: #666; font-size: 13px;">Or copy this link into your browser:<br>${verifyUrl}</p>
          <p style="color: #666; font-size: 13px;">This link expires in 24 hours. If you didn't create a FrameTrain account, you can ignore this email.</p>
          ${installVideoBlock('en')}
        </div>
      `,
      text: `Confirm your FrameTrain email address: ${verifyUrl}\n\nThis link expires in 24 hours. If you didn't create a FrameTrain account, you can ignore this email.\n\nInstall in 2 minutes – watch the tutorial: ${installVideoUrl}`,
    }
  }
  return {
    subject: 'Bestätige deine FrameTrain E-Mail-Adresse',
    html: `
      <div style="font-family: -apple-system, Helvetica, Arial, sans-serif; max-width: 480px; margin: 0 auto; color: #111;">
        <h2 style="margin-bottom: 8px;">Bestätige deine E-Mail-Adresse</h2>
        <p>Danke für deine Registrierung bei FrameTrain! Bitte bestätige deine E-Mail-Adresse, um deinen Account zu aktivieren.</p>
        <p style="margin: 24px 0;">
          <a href="${verifyUrl}" style="background: #3b3ed6; color: #fff; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; display: inline-block;">
            E-Mail bestätigen
          </a>
        </p>
        <p style="color: #666; font-size: 13px;">Oder kopiere diesen Link in deinen Browser:<br>${verifyUrl}</p>
        <p style="color: #666; font-size: 13px;">Der Link ist 24 Stunden gültig. Falls du keinen FrameTrain-Account erstellt hast, kannst du diese Mail ignorieren.</p>
        ${installVideoBlock('de')}
      </div>
    `,
    text: `Bestätige deine FrameTrain E-Mail-Adresse: ${verifyUrl}\n\nDer Link ist 24 Stunden gültig. Falls du keinen FrameTrain-Account erstellt hast, kannst du diese Mail ignorieren.\n\nIn 2 Minuten installiert – Tutorial ansehen: ${installVideoUrl}`,
  }
}

export async function sendVerificationEmail(to: string, token: string, locale: Locale = 'de') {
  if (!resend) {
    console.error('RESEND_API_KEY ist nicht gesetzt – Verifikations-Mail wurde NICHT versendet.')
    return { sent: false as const }
  }

  const verifyUrl = `${siteUrl}/${locale}/verify-email?token=${token}`
  const copy = verificationCopy(locale, verifyUrl)

  const { error } = await resend.emails.send({
    from: EMAIL_FROM,
    to,
    subject: copy.subject,
    html: copy.html,
    text: copy.text,
  })

  if (error) {
    console.error('Resend: Verifikations-Mail konnte nicht gesendet werden:', error)
    return { sent: false as const }
  }

  return { sent: true as const }
}

/**
 * Download-Link für den Rechner – angefordert vom Handy aus (Download-Seite).
 * Geht ausschließlich an die Adresse des angemeldeten Kontos, siehe
 * /api/download-link.
 */
function downloadLinkCopy(locale: Locale, downloadUrl: string) {
  const button = (label: string) => `
          <p style="margin: 24px 0;">
            <a href="${downloadUrl}" style="background: #3b3ed6; color: #fff; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; display: inline-block;">
              ${label}
            </a>
          </p>`
  if (locale === 'en') {
    return {
      subject: 'Your FrameTrain download for your computer',
      html: `
        <div style="font-family: -apple-system, Helvetica, Arial, sans-serif; max-width: 480px; margin: 0 auto; color: #111;">
          <h2 style="margin-bottom: 8px;">Continue on your computer</h2>
          <p>You sent yourself this link from your phone. Open it on the computer you want to train on – the right installer is picked automatically.</p>
          ${button('Open the download page')}
          <p style="color: #666; font-size: 13px;">Requirements: macOS with Apple Silicon (M1–M4), Windows 10/11 or Linux, plus Python 3.10 to 3.13.</p>
          <p style="color: #666; font-size: 13px;">Or copy this link:<br>${downloadUrl}</p>
          ${installVideoBlock('en')}
        </div>
      `,
      text: `Continue on your computer: ${downloadUrl}\n\nRequirements: macOS with Apple Silicon (M1–M4), Windows 10/11 or Linux, plus Python 3.10 to 3.13.\n\nInstall tutorial: ${installVideoUrl}`,
    }
  }
  return {
    subject: 'Dein FrameTrain-Download für den Rechner',
    html: `
      <div style="font-family: -apple-system, Helvetica, Arial, sans-serif; max-width: 480px; margin: 0 auto; color: #111;">
        <h2 style="margin-bottom: 8px;">Am Rechner weitermachen</h2>
        <p>Du hast dir diesen Link vom Handy geschickt. Öffne ihn an dem Rechner, auf dem du trainieren willst – der passende Installer wird automatisch vorgewählt.</p>
        ${button('Zur Download-Seite')}
        <p style="color: #666; font-size: 13px;">Voraussetzungen: macOS mit Apple Silicon (M1–M4), Windows 10/11 oder Linux, dazu Python 3.10 bis 3.13.</p>
        <p style="color: #666; font-size: 13px;">Oder kopiere diesen Link:<br>${downloadUrl}</p>
        ${installVideoBlock('de')}
      </div>
    `,
    text: `Am Rechner weitermachen: ${downloadUrl}\n\nVoraussetzungen: macOS mit Apple Silicon (M1–M4), Windows 10/11 oder Linux, dazu Python 3.10 bis 3.13.\n\nInstallations-Tutorial: ${installVideoUrl}`,
  }
}

export async function sendDownloadLinkEmail(to: string, locale: Locale = 'de') {
  if (!resend) {
    console.error('RESEND_API_KEY ist nicht gesetzt – Download-Link-Mail wurde NICHT versendet.')
    return { sent: false as const }
  }
  const downloadUrl = `${siteUrl}/${locale}/download?utm_source=email&utm_medium=download_link`
  const copy = downloadLinkCopy(locale, downloadUrl)
  const { error } = await resend.emails.send({ from: EMAIL_FROM, to, subject: copy.subject, html: copy.html, text: copy.text })
  if (error) {
    console.error('Resend: Download-Link-Mail konnte nicht gesendet werden:', error)
    return { sent: false as const }
  }
  return { sent: true as const }
}

/** Generischer Versand für Mails mit eigenem Inhalt (z. B. Onboarding-Serie). */
export async function sendEmail(mail: { to: string; subject: string; html: string; text: string; headers?: Record<string, string> }) {
  if (!resend) {
    console.error('RESEND_API_KEY ist nicht gesetzt – Mail wurde NICHT versendet:', mail.subject)
    return { sent: false as const }
  }
  const { error } = await resend.emails.send({ from: EMAIL_FROM, ...mail })
  if (error) {
    console.error('Resend: Mail konnte nicht gesendet werden:', mail.subject, error)
    return { sent: false as const }
  }
  return { sent: true as const }
}
