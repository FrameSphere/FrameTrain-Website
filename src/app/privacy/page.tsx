import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { Shield } from 'lucide-react'

export const metadata = {
  title: 'Datenschutzerklärung – FrameTrain',
  description: 'Datenschutzerklärung für FrameTrain',
}

export default function PrivacyPage() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-950 via-purple-950/20 to-gray-950">
      <Header />

      <main className="flex-1 px-4 py-16">
        <div className="max-w-3xl mx-auto">
          {/* Hero */}
          <div className="flex items-center gap-4 mb-10">
            <div className="w-14 h-14 bg-gradient-to-br from-violet-500 to-fuchsia-500 rounded-2xl flex items-center justify-center flex-shrink-0">
              <Shield className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-black text-white">Datenschutzerklärung</h1>
              <p className="text-gray-400 text-sm mt-1">Zuletzt aktualisiert: Januar 2025</p>
            </div>
          </div>

          <div className="glass-strong rounded-2xl p-8 md:p-12 border border-white/10 space-y-10 text-gray-300 leading-relaxed">

            <section>
              <h2 className="text-xl font-bold text-white mb-3">1. Verantwortlicher</h2>
              <p>
                Verantwortlicher im Sinne der DSGVO für den Betrieb von FrameTrain ist:
              </p>
              <div className="mt-3 glass border border-white/10 rounded-xl px-5 py-4 text-sm">
                <p className="text-white font-semibold">Karol Paschek</p>
                <p>Mainz, Deutschland</p>
                <p>E-Mail: <a href="mailto:support@frametrain.app" className="text-violet-400 hover:text-violet-300">support@frametrain.app</a></p>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white mb-3">2. Erhobene Daten</h2>
              <p className="mb-4">Wir erheben folgende personenbezogene Daten:</p>
              <ul className="space-y-2 text-sm list-none">
                {[
                  ['E-Mail-Adresse', 'Für Account-Erstellung, Authentifizierung und Support'],
                  ['Passwort (gehasht)', 'Zur sicheren Authentifizierung, niemals im Klartext gespeichert'],
                  ['Zahlungsdaten', 'Werden direkt von Stripe verarbeitet – wir speichern keine Kreditkartendaten'],
                  ['API-Key-Nutzung', 'Anonymisierte Logs zur Missbrauchserkennung und Lizenzprüfung'],
                  ['Support-Tickets', 'Freiwillig übermittelte Nachrichten im Support-System'],
                ].map(([name, desc]) => (
                  <li key={name} className="flex gap-3">
                    <span className="text-violet-400 mt-0.5">•</span>
                    <span><span className="text-white font-semibold">{name}:</span> {desc}</span>
                  </li>
                ))}
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white mb-3">3. Zweck der Datenverarbeitung</h2>
              <p className="mb-3">Deine Daten werden ausschließlich für folgende Zwecke verarbeitet:</p>
              <ul className="space-y-1 text-sm list-disc list-inside text-gray-400">
                <li>Bereitstellung des FrameTrain-Dienstes und der Desktop-App</li>
                <li>Lizenzprüfung über API-Key</li>
                <li>Abwicklung von Zahlungen (über Stripe)</li>
                <li>Bearbeitung von Support-Anfragen</li>
                <li>Versendung wichtiger Service-E-Mails (keine Werbung ohne Einwilligung)</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white mb-3">4. Drittanbieter</h2>
              <div className="space-y-3 text-sm">
                {[
                  { name: 'Stripe', role: 'Zahlungsabwicklung', privacy: 'https://stripe.com/de/privacy' },
                  { name: 'Vercel', role: 'Website-Hosting', privacy: 'https://vercel.com/legal/privacy-policy' },
                  { name: 'Cloudflare', role: 'API-Infrastruktur / CDN', privacy: 'https://www.cloudflare.com/de-de/privacypolicy/' },
                ].map(({ name, role, privacy }) => (
                  <div key={name} className="flex items-center justify-between glass border border-white/10 rounded-xl px-4 py-3">
                    <span><span className="text-white font-semibold">{name}</span> – {role}</span>
                    <a href={privacy} target="_blank" rel="noopener noreferrer" className="text-violet-400 hover:text-violet-300 text-xs">
                      Datenschutz →
                    </a>
                  </div>
                ))}
              </div>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white mb-3">5. Deine Rechte (DSGVO)</h2>
              <p className="mb-3">Du hast folgende Rechte bezüglich deiner personenbezogenen Daten:</p>
              <ul className="space-y-1 text-sm list-disc list-inside text-gray-400">
                <li>Recht auf Auskunft (Art. 15 DSGVO)</li>
                <li>Recht auf Berichtigung (Art. 16 DSGVO)</li>
                <li>Recht auf Löschung („Recht auf Vergessenwerden", Art. 17 DSGVO)</li>
                <li>Recht auf Einschränkung der Verarbeitung (Art. 18 DSGVO)</li>
                <li>Recht auf Datenübertragbarkeit (Art. 20 DSGVO)</li>
                <li>Widerspruchsrecht (Art. 21 DSGVO)</li>
              </ul>
              <p className="mt-3 text-sm">
                Zur Ausübung deiner Rechte wende dich an: <a href="mailto:support@frametrain.app" className="text-violet-400 hover:text-violet-300">support@frametrain.app</a>
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white mb-3">6. Cookies</h2>
              <p className="text-sm">
                FrameTrain verwendet ausschließlich technisch notwendige Cookies (Session-Cookie für die Authentifizierung).
                Es werden keine Tracking- oder Marketing-Cookies eingesetzt.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white mb-3">7. Datensicherheit</h2>
              <p className="text-sm">
                Alle Datenübertragungen erfolgen verschlüsselt über HTTPS/TLS. Passwörter werden mit bcrypt gehasht und niemals im Klartext gespeichert.
                Zahlungsdaten werden ausschließlich von Stripe (PCI-DSS Level 1 zertifiziert) verarbeitet.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white mb-3">8. Kontakt & Beschwerden</h2>
              <p className="text-sm">
                Bei Fragen oder Beschwerden zu dieser Datenschutzerklärung wende dich an{' '}
                <a href="mailto:support@frametrain.app" className="text-violet-400 hover:text-violet-300">support@frametrain.app</a>.
                Du hast außerdem das Recht, dich bei deiner zuständigen Datenschutzbehörde zu beschweren.
              </p>
            </section>

          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
