import type { Metadata } from 'next'
import Link from 'next/link'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { Shield, DollarSign, Zap, Lock, Cloud, Laptop, ChevronRight, ArrowRight, Check, X } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Lokales ML Training vs Cloud – Kosten, Datenschutz, Geschwindigkeit | FrameTrain',
  description: 'Lokales GPU-Training vs Google Colab, AWS SageMaker und Paperspace im direkten Vergleich. Kosten, Datenschutz, Geschwindigkeit und wann welcher Ansatz sinnvoll ist.',
  keywords: [
    'lokales ML Training', 'Google Colab Alternative', 'AWS SageMaker Alternative',
    'GPU Training lokal vs Cloud', 'ML Training DSGVO', 'Paperspace Alternative',
    'Machine Learning ohne Cloud', 'lokales LLM Training'
  ],
  openGraph: {
    title: 'Lokales ML Training vs Cloud – der große Vergleich',
    description: 'Kosten, Datenschutz, Geschwindigkeit: Wann lohnt sich lokales Training?',
    images: ['/og-image.svg'],
  },
}

export default function LocalVsCloudPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1">
        {/* Breadcrumb */}
        <div className="px-4 py-4 border-b border-white/5">
          <div className="max-w-4xl mx-auto flex items-center gap-2 text-sm text-gray-500">
            <Link href="/" className="hover:text-purple-400 transition">Home</Link>
            <ChevronRight className="w-4 h-4" />
            <Link href="/guides" className="hover:text-purple-400 transition">Guides</Link>
            <ChevronRight className="w-4 h-4" />
            <span className="text-gray-300">Lokal vs Cloud</span>
          </div>
        </div>

        {/* Hero */}
        <section className="py-16 px-4 border-b border-white/10">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-green-500/20 text-green-400 border border-green-500/30">Vergleich</span>
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30">Guide</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-white mb-6 leading-tight">
              Lokales ML Training<br />
              <span className="bg-gradient-to-r from-green-400 to-cyan-400 bg-clip-text text-transparent">
                vs Cloud – der ehrliche Vergleich
              </span>
            </h1>
            <p className="text-xl text-gray-400 leading-relaxed max-w-3xl">
              Google Colab, AWS SageMaker, Paperspace – oder deine eigene GPU? Wir vergleichen 
              Kosten, Datenschutz, Flexibilität und Performance für typische ML-Workloads.
            </p>
          </div>
        </section>

        <section className="py-12 px-4">
          <div className="max-w-4xl mx-auto space-y-12">

            {/* Cost Comparison */}
            <div className="glass-strong rounded-2xl p-8 border border-white/10">
              <h2 className="text-3xl font-black text-white mb-6 flex items-center gap-3">
                <DollarSign className="w-8 h-8 text-yellow-400" />
                Kostenvergleich: Cloud vs Lokal
              </h2>
              <p className="text-gray-400 mb-6 leading-relaxed">
                Cloud-GPUs werden nach Stunden abgerechnet. Für intensive ML-Projekte summieren sich die Kosten schnell.
                Lokales Training hat hingegen einmalige Hardware-Kosten – danach entstehen keine weiteren Kosten.
              </p>

              <div className="overflow-x-auto mb-6">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="text-left py-3 px-4 text-gray-400 font-semibold">Anbieter / Lösung</th>
                      <th className="text-left py-3 px-4 text-gray-400 font-semibold">GPU</th>
                      <th className="text-left py-3 px-4 text-gray-400 font-semibold">Preis/Stunde</th>
                      <th className="text-left py-3 px-4 text-gray-400 font-semibold">100h Training</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {[
                      ['Google Colab Pro+', 'A100 40GB', '~1,20 €/h', '~120 €'],
                      ['AWS SageMaker', 'ml.g4dn.xlarge (T4)', '~0,90 €/h', '~90 €'],
                      ['Paperspace Gradient', 'A100', '~2,30 €/h', '~230 €'],
                      ['Lambda Cloud', 'RTX A6000', '~1,10 €/h', '~110 €'],
                      ['FrameTrain (lokal)', 'RTX 4070 (eigene HW)', '0,00 €/h', '0 € ¹'],
                    ].map(([provider, gpu, hour, total], i) => (
                      <tr key={i} className={`hover:bg-white/2 transition-colors ${i === 4 ? 'text-green-400' : ''}`}>
                        <td className="py-3 px-4 font-medium">{provider}</td>
                        <td className="py-3 px-4 text-gray-400">{gpu}</td>
                        <td className="py-3 px-4">{hour}</td>
                        <td className={`py-3 px-4 font-bold ${i === 4 ? 'text-green-400' : 'text-red-400'}`}>{total}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="text-xs text-gray-600">¹ Nach einmaliger Hardware-Investition. Stromkosten ca. 0,03–0,08 € pro Stunde (RTX 4070: ~200W).</p>
            </div>

            {/* Feature Comparison Table */}
            <div className="glass-strong rounded-2xl p-8 border border-white/10">
              <h2 className="text-3xl font-black text-white mb-6">Funktionsvergleich</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="text-left py-3 px-4 text-gray-400 font-semibold">Feature</th>
                      <th className="text-center py-3 px-4 text-gray-400 font-semibold">Cloud</th>
                      <th className="text-center py-3 px-4 text-green-400 font-semibold">FrameTrain (Lokal)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {[
                      ['Laufende Kosten', false, true],
                      ['DSGVO-Konformität', false, true],
                      ['Daten verlassen Gerät', true, false],
                      ['Offline-Betrieb möglich', false, true],
                      ['Volle GPU-Kontrolle', false, true],
                      ['Kein Vendor Lock-in', false, true],
                      ['Schneller Trainingsstart', false, true],
                      ['Skalierung auf 100+ GPUs', true, false],
                      ['Keine Hardware-Investition', true, false],
                    ].map(([feature, cloud, local], i) => (
                      <tr key={i} className="hover:bg-white/2 transition-colors">
                        <td className="py-3 px-4 text-gray-300">{feature}</td>
                        <td className="py-3 px-4 text-center">
                          {cloud
                            ? <Check className="w-5 h-5 text-green-400 mx-auto" />
                            : <X className="w-5 h-5 text-red-400 mx-auto" />}
                        </td>
                        <td className="py-3 px-4 text-center">
                          {local
                            ? <Check className="w-5 h-5 text-green-400 mx-auto" />
                            : <X className="w-5 h-5 text-red-400 mx-auto" />}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Datenschutz */}
            <div className="glass-strong rounded-2xl p-8 border border-white/10">
              <h2 className="text-3xl font-black text-white mb-6 flex items-center gap-3">
                <Shield className="w-8 h-8 text-green-400" />
                Datenschutz & DSGVO – warum lokal besser ist
              </h2>
              <div className="text-gray-300 space-y-4 leading-relaxed">
                <p>
                  Bei Cloud-Diensten werden deine Trainingsdaten auf fremde Server hochgeladen – in den USA, Europa oder anderswo.
                  Das ist für viele Anwendungsfälle problematisch oder schlicht illegal:
                </p>
              </div>
              <div className="mt-6 grid md:grid-cols-2 gap-4">
                {[
                  { title: 'Kundenproblematik', text: 'Kundendaten dürfen nach DSGVO nicht ohne explizite Einwilligung auf US-Server übertragen werden.' },
                  { title: 'Medizinische Daten', text: 'Patientendaten unterliegen besonderen Schutzanforderungen (§ 22 BDSG), die Cloud-Training ausschließen.' },
                  { title: 'Unternehmensdaten', text: 'Proprietäre Unternehmensdaten und Betriebsgeheimnisse sollten niemals externe Server verlassen.' },
                  { title: 'Forschungsdaten', text: 'Nicht-veröffentlichte Forschungsergebnisse können durch Cloud-Upload unbeabsichtigt zugänglich werden.' },
                ].map(({ title, text }) => (
                  <div key={title} className="glass rounded-xl p-4 border border-green-500/10">
                    <h4 className="font-bold text-green-400 mb-2 text-sm">{title}</h4>
                    <p className="text-gray-400 text-sm">{text}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Wann Cloud sinnvoll ist */}
            <div className="glass-strong rounded-2xl p-8 border border-white/10">
              <h2 className="text-3xl font-black text-white mb-6 flex items-center gap-3">
                <Cloud className="w-8 h-8 text-blue-400" />
                Wann ist Cloud sinnvoll?
              </h2>
              <p className="text-gray-400 mb-4">
                Lokales Training ist nicht immer die beste Wahl. Cloud macht Sinn bei:
              </p>
              <ul className="space-y-3">
                {[
                  'Training von sehr großen Modellen (70B+ Parameter) die mehr VRAM brauchen als verfügbar',
                  'Horizontale Skalierung auf hunderte GPUs für schnelle Experimente',
                  'Keine eigene Hardware vorhanden und Trainingsaufwand ist einmalig/niedrig',
                  'Team-Workflows bei denen mehrere Personen gleichzeitig auf dieselben Ressourcen zugreifen müssen',
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-gray-300">
                    <div className="w-6 h-6 bg-blue-500/20 border border-blue-500/30 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 text-xs text-blue-400 font-bold">{i + 1}</div>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* CTA */}
            <div className="glass-strong rounded-2xl p-8 border border-purple-500/20 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-green-500 to-cyan-500 rounded-2xl mb-6">
                <Laptop className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-black text-white mb-4">
                Lokales Training mit FrameTrain starten
              </h3>
              <p className="text-gray-400 mb-6 max-w-lg mx-auto">
                Einmalig 1,99€ – dann kein Cloud-Abo, keine laufenden Kosten, volle Datenkontrolle.
              </p>
              <div className="flex gap-4 justify-center flex-wrap">
                <Link
                  href="/register"
                  className="relative group inline-block px-8 py-3 rounded-xl overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-green-600 to-cyan-600" />
                  <div className="relative flex items-center gap-2 text-white font-semibold">
                    <span>Kostenlos vergleichen</span>
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </Link>
                <Link href="/guides/lora-finetuning" className="glass-strong px-8 py-3 rounded-xl text-gray-300 hover:text-white transition font-semibold">
                  LoRA Guide lesen
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
