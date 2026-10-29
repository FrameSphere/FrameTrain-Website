import { siteUrl } from '@/lib/seo'
import { VIDEOS, youtubeWatchUrl } from '@/lib/videos'

/**
 * Onboarding-Serie: höchstens vier kurze Mails in den ersten zwei Wochen.
 *
 * Grundsätze (bewusst, nicht wieder aufweichen):
 * - Jede Mail hilft bei genau einem Schritt in der App. Keine Rabatte, keine
 *   Werbung für andere Produkte – das hält die Serie auf der Seite der
 *   Service-Kommunikation zum Konto (Art. 6 Abs. 1 lit. b/f DSGVO).
 * - Abmelden mit einem Klick in jeder Mail, dazu List-Unsubscribe-Header.
 * - Kein Tracking: keine Pixel, keine umgeleiteten Links. Klick- und
 *   Öffnungs-Tracking muss auch in Resend für die Domain aus bleiben.
 * - Mail 4 geht nur an Nutzer in der Testphase und sagt sachlich, wann sie
 *   endet und was danach passiert.
 */
export type Locale = 'de' | 'en'

export type OnboardingStep = {
  step: 1 | 2 | 3 | 4
  /** Frühester Versand: Tage nach der Registrierung */
  afterDays: number
  trialOnly?: boolean
}

export const ONBOARDING_STEPS: OnboardingStep[] = [
  { step: 1, afterDays: 1 },
  { step: 2, afterDays: 3 },
  { step: 3, afterDays: 6 },
  { step: 4, afterDays: 11, trialOnly: true },
]

export type OnboardingContext = {
  locale: Locale
  /** Hat sich die App schon einmal mit dem Konto angemeldet? */
  appConnected: boolean
  /** Ende der Testphase, nur für Mail 4 */
  trialEndsAt?: Date | null
  registeredAt: Date
  unsubscribeUrl: string
}

const C = {
  ink: '#14141f',
  muted: '#5b5b6e',
  line: '#e6e6ee',
  indigo: '#4f53f0',
}

const url = (locale: Locale, path: string, step: number) =>
  `${siteUrl}/${locale}${path}${path.includes('?') ? '&' : '?'}utm_source=onboarding&utm_medium=email&utm_campaign=step${step}`

function layout(locale: Locale, ctx: OnboardingContext, body: string) {
  const date = ctx.registeredAt.toLocaleDateString(locale === 'en' ? 'en-GB' : 'de-DE', { day: 'numeric', month: 'long', year: 'numeric' })
  const footer =
    locale === 'en'
      ? `You're getting this because you created a FrameTrain account on ${date}. It's at most four short tips in your first two weeks, then it stops on its own.<br><a href="${ctx.unsubscribeUrl}" style="color:${C.muted};">Unsubscribe from these tips</a> · <a href="${siteUrl}/en/imprint" style="color:${C.muted};">Imprint</a> · <a href="${siteUrl}/en/privacy" style="color:${C.muted};">Privacy</a><br>Karol Paschek · FrameTrain · Universitätsstraße 8, 55270 Zornheim, Germany`
      : `Du bekommst diese Mail, weil du am ${date} ein FrameTrain-Konto angelegt hast. Es sind höchstens vier kurze Tipps in deinen ersten zwei Wochen, danach hört es von selbst auf.<br><a href="${ctx.unsubscribeUrl}" style="color:${C.muted};">Diese Tipps abbestellen</a> · <a href="${siteUrl}/de/imprint" style="color:${C.muted};">Impressum</a> · <a href="${siteUrl}/de/privacy" style="color:${C.muted};">Datenschutz</a><br>Karol Paschek · FrameTrain · Universitätsstraße 8, 55270 Zornheim`
  return `<!doctype html>
<html lang="${locale}"><body style="margin:0;padding:0;background:#ffffff;">
  <div style="font-family:-apple-system,'Segoe UI',Helvetica,Arial,sans-serif;max-width:520px;margin:0 auto;padding:32px 20px;color:${C.ink};font-size:16px;line-height:1.6;">
    <p style="margin:0 0 24px;font-weight:700;font-size:15px;letter-spacing:-0.01em;">FrameTrain</p>
    ${body}
    <p style="margin:28px 0 0;">${locale === 'en' ? 'Karol, who builds FrameTrain' : 'Karol, der FrameTrain baut'}</p>
    <div style="margin-top:36px;padding-top:16px;border-top:1px solid ${C.line};font-size:12px;line-height:1.6;color:${C.muted};">${footer}</div>
  </div>
</body></html>`
}

const h = (text: string) => `<h1 style="margin:0 0 16px;font-size:22px;line-height:1.3;letter-spacing:-0.01em;">${text}</h1>`
const p = (text: string) => `<p style="margin:0 0 14px;">${text}</p>`
const list = (items: string[]) =>
  `<ol style="margin:0 0 18px;padding-left:20px;">${items.map((i) => `<li style="margin:0 0 8px;">${i}</li>`).join('')}</ol>`
const button = (href: string, label: string) =>
  `<p style="margin:22px 0;"><a href="${href}" style="background:${C.indigo};color:#ffffff;padding:12px 22px;border-radius:999px;text-decoration:none;font-weight:600;display:inline-block;">${label}</a></p>`

type Mail = { subject: string; html: string; text: string }

function step1(ctx: OnboardingContext): Mail {
  const { locale } = ctx
  const video = youtubeWatchUrl(VIDEOS.install)
  if (locale === 'en') {
    const items = ctx.appConnected
      ? [
          'Pick a small base model in the Model Manager – small models train in minutes and are perfect for a first run.',
          'Load a dataset or build one in the Dataset Builder (step 2 tomorrow is all about that).',
          'Start training with the default settings. Change one thing at a time later.',
        ]
      : [
          `Install Python 3.10 to 3.13 if you don't have it yet – FrameTrain checks this on first launch.`,
          'Download FrameTrain and sign in with your account (or the API key from your dashboard).',
          'Pick a small base model and start a training run with the default settings.',
        ]
    const intro = ctx.appConnected
      ? 'FrameTrain is already connected to your account – nice. Here is the shortest path to your first trained model:'
      : 'The shortest path to your first trained model takes about 15 minutes:'
    return {
      subject: 'Your first model in 15 minutes',
      html: layout(locale, ctx, `${h('Your first model in 15 minutes')}${p(intro)}${list(items)}${
        ctx.appConnected ? button(url(locale, '/docs#first-training', 1), 'First training, step by step') : button(url(locale, '/download', 1), 'Download FrameTrain')
      }${p(`Stuck during setup? The <a href="${video}" style="color:${C.indigo};">2-minute install video</a> covers the usual pitfalls.`)}`),
      text: `Your first model in 15 minutes\n\n${intro}\n\n${items.map((t, i) => `${i + 1}. ${t}`).join('\n')}\n\n${
        ctx.appConnected ? url(locale, '/docs#first-training', 1) : url(locale, '/download', 1)
      }\n\nInstall video: ${video}\n\nKarol\n\nUnsubscribe: ${ctx.unsubscribeUrl}`,
    }
  }
  const items = ctx.appConnected
    ? [
        'Wähl im Model Manager ein kleines Basismodell – kleine Modelle trainieren in Minuten und sind ideal für den ersten Lauf.',
        'Lade einen Datensatz oder bau dir einen im Dataset Builder (darum geht es übermorgen).',
        'Starte das Training mit den Standardwerten. Später immer nur eine Sache auf einmal ändern.',
      ]
    : [
        'Installiere Python 3.10 bis 3.13, falls noch nicht vorhanden – FrameTrain prüft das beim ersten Start.',
        'Lade FrameTrain herunter und melde dich mit deinem Konto an (oder mit dem API-Key aus dem Dashboard).',
        'Wähl ein kleines Basismodell und starte ein Training mit den Standardwerten.',
      ]
  const intro = ctx.appConnected
    ? 'FrameTrain ist schon mit deinem Konto verbunden – schön. Hier der kürzeste Weg zum ersten trainierten Modell:'
    : 'Der kürzeste Weg zu deinem ersten trainierten Modell dauert etwa 15 Minuten:'
  return {
    subject: 'Dein erstes Modell in 15 Minuten',
    html: layout(locale, ctx, `${h('Dein erstes Modell in 15 Minuten')}${p(intro)}${list(items)}${
      ctx.appConnected ? button(url(locale, '/docs#first-training', 1), 'Erstes Training Schritt für Schritt') : button(url(locale, '/download', 1), 'FrameTrain herunterladen')
    }${p(`Hängst du bei der Installation? Das <a href="${video}" style="color:${C.indigo};">2-Minuten-Video</a> zeigt die üblichen Stolperstellen.`)}`),
    text: `Dein erstes Modell in 15 Minuten\n\n${intro}\n\n${items.map((t, i) => `${i + 1}. ${t}`).join('\n')}\n\n${
      ctx.appConnected ? url(locale, '/docs#first-training', 1) : url(locale, '/download', 1)
    }\n\nInstallations-Video: ${video}\n\nKarol\n\nAbbestellen: ${ctx.unsubscribeUrl}`,
  }
}

function step2(ctx: OnboardingContext): Mail {
  const { locale } = ctx
  if (locale === 'en') {
    const items = [
      '<strong>Fewer, cleaner examples beat many messy ones.</strong> 50 to 100 well-labelled examples per class are a solid start.',
      '<strong>Keep classes balanced.</strong> If one class has ten times more examples, the model learns to just guess it.',
      '<strong>Hold back a test set.</strong> The Dataset Builder splits it for you – never train on the data you test with.',
    ]
    return {
      subject: 'Good data beats big models',
      html: layout(locale, ctx, `${h('Good data beats big models')}${p('Most disappointing training runs are not a model problem, they are a data problem. Three rules that fix most of it:')}${list(items)}${button(url(locale, '/docs#dataset-builder', 2), 'How the Dataset Builder works')}`),
      text: `Good data beats big models\n\n1. Fewer, cleaner examples beat many messy ones. 50 to 100 per class are a solid start.\n2. Keep classes balanced.\n3. Hold back a test set – never train on the data you test with.\n\n${url(locale, '/docs#dataset-builder', 2)}\n\nKarol\n\nUnsubscribe: ${ctx.unsubscribeUrl}`,
    }
  }
  const items = [
    '<strong>Wenige saubere Beispiele schlagen viele unsaubere.</strong> 50 bis 100 gut gelabelte Beispiele pro Klasse sind ein guter Start.',
    '<strong>Klassen ausgewogen halten.</strong> Hat eine Klasse zehnmal mehr Beispiele, lernt das Modell einfach, sie zu raten.',
    '<strong>Einen Testsatz zurückhalten.</strong> Der Dataset Builder teilt ihn für dich ab – trainiere nie auf den Daten, mit denen du testest.',
  ]
  return {
    subject: 'Gute Daten schlagen große Modelle',
    html: layout(locale, ctx, `${h('Gute Daten schlagen große Modelle')}${p('Die meisten enttäuschenden Trainings sind kein Modell-, sondern ein Datenproblem. Drei Regeln, die das meiste davon lösen:')}${list(items)}${button(url(locale, '/docs#dataset-builder', 2), 'So funktioniert der Dataset Builder')}`),
    text: `Gute Daten schlagen große Modelle\n\n1. Wenige saubere Beispiele schlagen viele unsaubere. 50 bis 100 pro Klasse sind ein guter Start.\n2. Klassen ausgewogen halten.\n3. Einen Testsatz zurückhalten – nie auf den Testdaten trainieren.\n\n${url(locale, '/docs#dataset-builder', 2)}\n\nKarol\n\nAbbestellen: ${ctx.unsubscribeUrl}`,
  }
}

function step3(ctx: OnboardingContext): Mail {
  const { locale } = ctx
  if (locale === 'en') {
    return {
      subject: 'Reading your training curve in 2 minutes',
      html: layout(locale, ctx, `${h('Reading your training curve in 2 minutes')}${p('The loss curve tells you whether a run is worth waiting for. Two patterns are worth knowing:')}${list([
        '<strong>Both curves go down and flatten out:</strong> good. More epochs will barely help – test the model.',
        '<strong>Training loss keeps falling, validation loss rises again:</strong> overfitting. Stop earlier, or add more varied data.',
      ])}${p('The free training coach explains the rest with examples – no prior knowledge needed.')}${button(url(locale, '/docs/ai-training-guide/trainingsverlauf', 3), 'Open the training coach')}${p(`Something not working, or missing a feature? Use the feedback button on the website – it lands directly with me.`)}`),
      text: `Reading your training curve in 2 minutes\n\n- Both curves go down and flatten out: good, test the model.\n- Training loss falls, validation loss rises again: overfitting. Stop earlier or add more varied data.\n\nTraining coach: ${url(locale, '/docs/ai-training-guide/trainingsverlauf', 3)}\n\nKarol\n\nUnsubscribe: ${ctx.unsubscribeUrl}`,
    }
  }
  return {
    subject: 'Deine Trainingskurve in 2 Minuten lesen',
    html: layout(locale, ctx, `${h('Deine Trainingskurve in 2 Minuten lesen')}${p('Die Loss-Kurve verrät dir, ob sich das Warten lohnt. Zwei Muster solltest du kennen:')}${list([
      '<strong>Beide Kurven fallen und flachen ab:</strong> gut. Mehr Epochen bringen kaum noch etwas – teste das Modell.',
      '<strong>Training-Loss fällt weiter, Validierungs-Loss steigt wieder:</strong> Overfitting. Früher stoppen oder vielfältigere Daten ergänzen.',
    ])}${p('Den Rest erklärt der kostenlose Trainings-Coach mit Beispielen – ganz ohne Vorwissen.')}${button(url(locale, '/docs/ai-training-guide/trainingsverlauf', 3), 'Zum Trainings-Coach')}${p('Klappt etwas nicht oder fehlt dir eine Funktion? Nutz den Feedback-Button auf der Website – das landet direkt bei mir.')}`),
    text: `Deine Trainingskurve in 2 Minuten lesen\n\n- Beide Kurven fallen und flachen ab: gut, teste das Modell.\n- Training-Loss fällt, Validierungs-Loss steigt wieder: Overfitting. Früher stoppen oder vielfältigere Daten ergänzen.\n\nTrainings-Coach: ${url(locale, '/docs/ai-training-guide/trainingsverlauf', 3)}\n\nKarol\n\nAbbestellen: ${ctx.unsubscribeUrl}`,
  }
}

function step4(ctx: OnboardingContext): Mail {
  const { locale } = ctx
  const end = (ctx.trialEndsAt ?? new Date()).toLocaleDateString(locale === 'en' ? 'en-GB' : 'de-DE', { weekday: 'long', day: 'numeric', month: 'long' })
  if (locale === 'en') {
    return {
      subject: `Your FrameTrain trial ends on ${end}`,
      html: layout(locale, ctx, `${h('Your trial ends soon')}${p(`Just so it doesn't catch you by surprise: your 14-day trial ends on <strong>${end}</strong>.`)}${list([
        'Nothing is charged automatically – you never entered payment details.',
        'Your models and datasets stay on your computer. They are yours either way.',
        'After that, you need a plan to keep using the app.',
      ])}${p('If FrameTrain is useful to you, you can continue here. If not, no action is needed.')}${button(url(locale, '/payment', 4), 'See plans')}`),
      text: `Your FrameTrain trial ends on ${end}.\n\n- Nothing is charged automatically.\n- Your models and datasets stay on your computer.\n- After that, you need a plan to keep using the app.\n\nPlans: ${url(locale, '/payment', 4)}\n\nKarol\n\nUnsubscribe: ${ctx.unsubscribeUrl}`,
    }
  }
  return {
    subject: `Deine FrameTrain-Testphase endet am ${end}`,
    html: layout(locale, ctx, `${h('Deine Testphase endet bald')}${p(`Nur damit es dich nicht überrascht: Deine 14-tägige Testphase endet am <strong>${end}</strong>.`)}${list([
      'Es wird nichts automatisch abgebucht – du hast keine Zahlungsdaten hinterlegt.',
      'Deine Modelle und Datensätze bleiben auf deinem Rechner. Sie gehören dir so oder so.',
      'Danach brauchst du einen Tarif, um die App weiter zu nutzen.',
    ])}${p('Wenn FrameTrain dir hilft, kannst du hier weitermachen. Wenn nicht, musst du nichts tun.')}${button(url(locale, '/payment', 4), 'Tarife ansehen')}`),
    text: `Deine FrameTrain-Testphase endet am ${end}.\n\n- Es wird nichts automatisch abgebucht.\n- Deine Modelle und Datensätze bleiben auf deinem Rechner.\n- Danach brauchst du einen Tarif, um die App weiter zu nutzen.\n\nTarife: ${url(locale, '/payment', 4)}\n\nKarol\n\nAbbestellen: ${ctx.unsubscribeUrl}`,
  }
}

export function onboardingMail(step: OnboardingStep['step'], ctx: OnboardingContext): Mail {
  return [step1, step2, step3, step4][step - 1](ctx)
}
