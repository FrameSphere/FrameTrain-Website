import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { FileText } from 'lucide-react'

export const metadata = {
  title: 'AGB – FrameTrain',
  description: 'Allgemeine Geschäftsbedingungen für FrameTrain',
}

export default function TermsPage() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-950 via-purple-950/20 to-gray-950">
      <Header />

      <main className="flex-1 px-4 py-16">
        <div className="max-w-3xl mx-auto">
          {/* Hero */}
          <div className="flex items-center gap-4 mb-10">
            <div className="w-14 h-14 bg-gradient-to-br from-violet-500 to-fuchsia-500 rounded-2xl flex items-center justify-center flex-shrink-0">
              <FileText className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-black text-white">Allgemeine Geschäftsbedingungen</h1>
              <p className="text-gray-400 text-sm mt-1">Zuletzt aktualisiert: Januar 2025</p>
            </div>
          </div>

          <div className="glass-strong rounded-2xl p-8 md:p-12 border border-white/10 space-y-10 text-gray-300 leading-relaxed">

            <section>
              <h2 className="text-xl font-bold text-white mb-3">1. Geltungsbereich</h2>
              <p className="text-sm">
                Diese Allgemeinen Geschäftsbedingungen (AGB) gelten für die Nutzung des Dienstes FrameTrain
                (Website und Desktop-Applikation), betrieben von Karol Paschek, Mainz, Deutschland.
                Mit der Nutzung des Dienstes erkennst du diese AGB an.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white mb-3">2. Leistungsbeschreibung</h2>
              <p className="text-sm mb-3">
                FrameTrain ist eine Desktop-Anwendung für lokales Machine-Learning-Training.
                Der Dienst umfasst:
              </p>
              <ul className="space-y-1 text-sm list-disc list-inside text-gray-400">
                <li>Zugang im Abo-Modell: 4,99€/Monat oder 39,99€/Jahr (Early-Access-Preis, steigt auf 9,99€ nach den ersten 100 Nutzern)</li>
                <li>Zugang zur Desktop-App (Windows, macOS, Linux) für die Dauer des aktiven Abos</li>
                <li>Kostenloses Empfangen aller Updates während der Abo-Laufzeit</li>
                <li>Zugang zur Online-Dokumentation</li>
                <li>E-Mail-Support</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white mb-3">3. Vertragsschluss, Zahlung & Laufzeit</h2>
              <p className="text-sm mb-3">
                Ein Vertrag kommt zustande, wenn du dich registrierst und ein Zahlungsmittel für das gewählte
                Abo (monatlich oder jährlich) hinterlegst. Die Zahlung wird von Stripe verarbeitet und zu Beginn
                jeder Abrechnungsperiode automatisch eingezogen. Nach erfolgreicher Zahlung wird dir ein API-Key
                zur Verfügung gestellt, der als Lizenzschlüssel für die Dauer des aktiven Abos dient.
              </p>
              <p className="text-sm">
                Das Abo verlängert sich automatisch um die jeweils gewählte Abrechnungsperiode (Monat bzw. Jahr),
                sofern es nicht vor Ablauf der laufenden Periode gekündigt wird.
              </p>
            </section>

            <section>
              {/* TODO/ANWALT PRÜFEN: Als laufendes Abo-Verhältnis unterliegt FrameTrain seit Juli 2022 dem
                  Kuendigungsbutton-Erfordernis nach § 312k BGB – ein jederzeit leicht auffindbarer,
                  eindeutig beschrifteter Kuendigungs-Button (z.B. im Dashboard) ist gesetzlich vorgeschrieben.
                  Bitte rechtlich pruefen lassen, ob das aktuell so umgesetzt ist. */}
              <h2 className="text-xl font-bold text-white mb-3">4. Kündigung</h2>
              <p className="text-sm">
                Das Abo ist jederzeit zum Ende der laufenden Abrechnungsperiode kündbar, ohne Angabe von Gründen.
                Die Kündigung kann über das Dashboard oder per E-Mail an{' '}
                <a href="mailto:framesphere@gmx.net" className="text-violet-400 hover:text-violet-300">framesphere@gmx.net</a>{' '}
                erfolgen. Mit Wirksamwerden der Kündigung endet der Zugang zur Desktop-App zum Ende der bereits
                bezahlten Abrechnungsperiode.
              </p>
            </section>

            <section>
              {/* TODO/ANWALT PRUEFEN: Das Widerrufsrecht bei Abos/Dauerschuldverhaeltnissen unterscheidet sich
                  von dem bei einmaligen digitalen Inhalten. Diese Klausel sollte juristisch an das neue
                  Abo-Modell angepasst werden. */}
              <h2 className="text-xl font-bold text-white mb-3">5. Widerrufsrecht</h2>
              <p className="text-sm mb-3">
                Da es sich um digitale Inhalte handelt, die nach Vertragsschluss sofort bereitgestellt werden,
                erlischt das Widerrufsrecht gemäß § 356 Abs. 5 BGB mit Beginn der Vertragserfüllung,
                sofern du ausdrücklich zugestimmt hast, dass mit der Ausführung des Vertrags vor Ablauf der Widerrufsfrist begonnen wird.
              </p>
              <p className="text-sm">
                Kontaktiere uns bei Fragen: <a href="mailto:framesphere@gmx.net" className="text-violet-400 hover:text-violet-300">framesphere@gmx.net</a>
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white mb-3">6. Nutzungslizenz</h2>
              <p className="text-sm mb-3">
                Mit dem Kauf erhältst du eine nicht-exklusive, nicht-übertragbare Lizenz zur privaten und kommerziellen Nutzung
                der FrameTrain Desktop-Applikation auf deinen eigenen Geräten.
              </p>
              <p className="text-sm font-semibold text-red-400">Folgendes ist ausdrücklich untersagt:</p>
              <ul className="space-y-1 text-sm list-disc list-inside text-gray-400 mt-2">
                <li>Weitergabe, Verkauf oder Sublizenzierung deines API-Keys</li>
                <li>Reverse-Engineering oder Dekompilierung der App</li>
                <li>Nutzung der API für automatisierten Missbrauch</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white mb-3">7. Verfügbarkeit</h2>
              <p className="text-sm">
                Wir bemühen uns um eine hohe Verfügbarkeit des Dienstes, können jedoch keine 100%ige Uptime garantieren.
                Die Desktop-App funktioniert vollständig lokal – ein Internetausfall beeinflusst das Training nicht.
                Nur die Lizenzvalidierung beim Start erfordert eine Internetverbindung.
              </p>
            </section>

            <section>
              {/* TODO/ANWALT PRUEFEN: Haftungsobergrenze an das Abo-Modell angepasst (gezahlte Gebuehren der
                  letzten 12 Monate statt fixer 1,99 Euro). Bitte rechtlich gegenpruefen. */}
              <h2 className="text-xl font-bold text-white mb-3">8. Haftungsbeschränkung</h2>
              <p className="text-sm">
                Der Betreiber haftet nicht für mittelbare Schäden, entgangene Gewinne oder Datenverluste,
                die durch die Nutzung von FrameTrain entstehen. Die Haftung ist auf die Summe der in den
                letzten 12 Monaten gezahlten Abo-Gebühren begrenzt, soweit gesetzlich zulässig.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white mb-3">9. Änderungen der AGB</h2>
              <p className="text-sm">
                Wir behalten uns vor, diese AGB zu ändern. Wesentliche Änderungen werden dir per E-Mail mitgeteilt.
                Die fortgesetzte Nutzung des Dienstes nach Inkrafttreten geänderter AGB gilt als Zustimmung.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white mb-3">10. Anwendbares Recht</h2>
              <p className="text-sm">
                Es gilt deutsches Recht unter Ausschluss des UN-Kaufrechts.
                Gerichtsstand ist Mainz, soweit gesetzlich zulässig.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white mb-3">11. Kontakt</h2>
              <p className="text-sm">
                Karol Paschek, Mainz · <a href="mailto:framesphere@gmx.net" className="text-violet-400 hover:text-violet-300">framesphere@gmx.net</a>
              </p>
            </section>

          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
