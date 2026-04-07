import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { Info } from 'lucide-react'

export const metadata = {
  title: 'Impressum – FrameTrain',
  description: 'Impressum von FrameTrain',
}

export default function ImprintPage() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-950 via-purple-950/20 to-gray-950">
      <Header />

      <main className="flex-1 px-4 py-16">
        <div className="max-w-2xl mx-auto">
          {/* Hero */}
          <div className="flex items-center gap-4 mb-10">
            <div className="w-14 h-14 bg-gradient-to-br from-violet-500 to-fuchsia-500 rounded-2xl flex items-center justify-center flex-shrink-0">
              <Info className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-black text-white">Impressum</h1>
              <p className="text-gray-400 text-sm mt-1">Angaben gemäß § 5 TMG</p>
            </div>
          </div>

          <div className="glass-strong rounded-2xl p-8 md:p-12 border border-white/10 space-y-8 text-gray-300 leading-relaxed">

            <section>
              <h2 className="text-xl font-bold text-white mb-4">Anbieter</h2>
              <div className="glass border border-white/10 rounded-xl px-6 py-5 space-y-1 text-sm">
                <p className="text-white font-bold text-base">Karol Paschek</p>
                <p>Mainz, Rheinland-Pfalz</p>
                <p>Deutschland</p>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white mb-4">Kontakt</h2>
              <div className="glass border border-white/10 rounded-xl px-6 py-5 space-y-2 text-sm">
                <p>
                  E-Mail:{' '}
                  <a href="mailto:support@frametrain.app" className="text-violet-400 hover:text-violet-300">
                    support@frametrain.app
                  </a>
                </p>
                <p>
                  Website:{' '}
                  <a href="https://frametrain.app" className="text-violet-400 hover:text-violet-300">
                    frametrain.app
                  </a>
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white mb-4">Verantwortlich für den Inhalt</h2>
              <div className="text-sm">
                <p>Karol Paschek (Anschrift wie oben)</p>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white mb-4">Haftungsausschluss</h2>
              <div className="space-y-4 text-sm text-gray-400">
                <div>
                  <p className="text-white font-semibold mb-1">Haftung für Inhalte</p>
                  <p>
                    Als Diensteanbieter sind wir gemäß § 7 Abs.1 TMG für eigene Inhalte auf diesen Seiten nach den
                    allgemeinen Gesetzen verantwortlich. Nach §§ 8 bis 10 TMG sind wir als Diensteanbieter jedoch nicht
                    verpflichtet, übermittelte oder gespeicherte fremde Informationen zu überwachen.
                  </p>
                </div>
                <div>
                  <p className="text-white font-semibold mb-1">Haftung für Links</p>
                  <p>
                    Unser Angebot enthält Links zu externen Websites Dritter, auf deren Inhalte wir keinen Einfluss haben.
                    Deshalb können wir für diese fremden Inhalte auch keine Gewähr übernehmen. Für die Inhalte der verlinkten
                    Seiten ist stets der jeweilige Anbieter oder Betreiber der Seiten verantwortlich.
                  </p>
                </div>
                <div>
                  <p className="text-white font-semibold mb-1">Urheberrecht</p>
                  <p>
                    Die durch den Betreiber erstellten Inhalte und Werke auf diesen Seiten unterliegen dem deutschen Urheberrecht.
                    Die Vervielfältigung, Bearbeitung, Verbreitung und jede Art der Verwertung außerhalb der Grenzen des
                    Urheberrechts bedürfen der schriftlichen Zustimmung des jeweiligen Autors.
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white mb-4">Streitschlichtung</h2>
              <p className="text-sm text-gray-400">
                Die Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung (OS) bereit:{' '}
                <a
                  href="https://ec.europa.eu/consumers/odr/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-violet-400 hover:text-violet-300"
                >
                  https://ec.europa.eu/consumers/odr/
                </a>
                . Unsere E-Mail-Adresse finden Sie oben im Impressum. Wir sind nicht bereit oder verpflichtet,
                an Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teilzunehmen.
              </p>
            </section>

          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
