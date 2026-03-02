import type { Metadata } from 'next'
import Link from 'next/link'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { Brain, Zap, Check, ArrowRight, Code2, Cpu, ChevronRight } from 'lucide-react'

export const metadata: Metadata = {
  title: 'LoRA Fine-Tuning erklärt – LLMs effizient trainieren | FrameTrain',
  description: 'Was ist LoRA? Wie funktioniert Low-Rank Adaptation? Der vollständige Guide zu LoRA vs Full Fine-Tuning, QLoRA und wie du Sprachmodelle effizient auf eigene Daten anpasst.',
  keywords: [
    'LoRA Fine-Tuning', 'Low-Rank Adaptation', 'QLoRA', 'LLM Fine-Tuning', 
    'LoRA vs Full Fine-Tuning', 'HuggingFace LoRA', 'PEFT', 'Parameter Efficient Fine-Tuning'
  ],
  openGraph: {
    title: 'LoRA Fine-Tuning erklärt – LLMs effizient trainieren',
    description: 'Der vollständige Guide zu LoRA und QLoRA für LLM Fine-Tuning.',
    images: ['/og-image.svg'],
  },
}

export default function LoraGuidePage() {
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
            <span className="text-gray-300">LoRA Fine-Tuning</span>
          </div>
        </div>

        {/* Hero */}
        <section className="py-16 px-4 border-b border-white/10">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-purple-500/20 text-purple-400 border border-purple-500/30">LLM Training</span>
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30">Guide</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-white mb-6 leading-tight">
              LoRA Fine-Tuning:<br />
              <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                LLMs effizient auf eigene Daten trainieren
              </span>
            </h1>
            <p className="text-xl text-gray-400 leading-relaxed max-w-3xl">
              LoRA (Low-Rank Adaptation) ermöglicht es, Sprachmodelle mit Milliarden von Parametern
              auf kleinen GPUs zu fine-tunen – ohne das vollständige Modell neu zu trainieren.
              Dieser Guide erklärt wie es funktioniert und wann du es einsetzen solltest.
            </p>
          </div>
        </section>

        {/* Content */}
        <section className="py-12 px-4">
          <div className="max-w-4xl mx-auto space-y-12">

            {/* Was ist LoRA */}
            <div className="glass-strong rounded-2xl p-8 border border-white/10">
              <h2 className="text-3xl font-black text-white mb-6 flex items-center gap-3">
                <Brain className="w-8 h-8 text-purple-400" />
                Was ist LoRA?
              </h2>
              <div className="text-gray-300 space-y-4 leading-relaxed">
                <p>
                  LoRA steht für <strong className="text-white">Low-Rank Adaptation</strong> und ist eine Methode aus der Forschung, 
                  die 2021 von Microsoft vorgestellt wurde. Statt alle Milliarden Parameter eines großen Sprachmodells beim 
                  Fine-Tuning zu aktualisieren, werden dabei nur kleine, zusätzliche Matrizen trainiert.
                </p>
                <p>
                  Das Prinzip: Die Gewichtsveränderungen eines Modells lassen sich mathematisch 
                  durch <strong className="text-white">zwei kleine Matrizen mit niedrigem Rang (Low Rank)</strong> approximieren. 
                  Diese Matrizen haben wesentlich weniger Parameter als das ursprüngliche Modell – 
                  bei gleicher oder sogar besserer Anpassungsqualität.
                </p>
                <p>
                  Ein Llama-3 Modell mit 8 Milliarden Parametern benötigt beim Full Fine-Tuning 
                  etwa 60–80 GB VRAM. Mit LoRA reduziert sich das auf <strong className="text-white">6–12 GB</strong> –
                  und ist damit auch auf Consumer-GPUs wie der RTX 4070 oder 3090 machbar.
                </p>
              </div>
            </div>

            {/* LoRA vs Full Fine-Tuning */}
            <div className="glass-strong rounded-2xl p-8 border border-white/10">
              <h2 className="text-3xl font-black text-white mb-6">
                LoRA vs Full Fine-Tuning – Wann was?
              </h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="glass rounded-xl p-6 border border-purple-500/20">
                  <h3 className="text-xl font-bold text-purple-400 mb-4">LoRA Fine-Tuning</h3>
                  <ul className="space-y-3">
                    {[
                      'Wenig VRAM nötig (6–16 GB reicht)',
                      'Schneller – weniger Parameter zu aktualisieren',
                      'Mehrere LoRA-Adapter pro Basismodell möglich',
                      'Adapter sind klein und einfach zu teilen',
                      'Ideal für domänenspezifische Anpassung',
                      'Gut geeignet: Chatbots, Instruktions-Tuning',
                    ].map((item, i) => (
                      <li key={i} className="flex items-start gap-2 text-gray-300 text-sm">
                        <Check className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="glass rounded-xl p-6 border border-blue-500/20">
                  <h3 className="text-xl font-bold text-blue-400 mb-4">Full Fine-Tuning</h3>
                  <ul className="space-y-3">
                    {[
                      'Alle Modellparameter werden aktualisiert',
                      'Mehr VRAM nötig (oft 40–80+ GB)',
                      'Bessere Resultate bei sehr großen Datensätzen',
                      'Tiefere Domänenanpassung möglich',
                      'Kein Basismodell als Abhängigkeit',
                      'Gut geeignet: Pre-Training, massive Fachsprache',
                    ].map((item, i) => (
                      <li key={i} className="flex items-start gap-2 text-gray-300 text-sm">
                        <Check className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              <div className="mt-6 glass rounded-xl p-4 border border-white/10">
                <p className="text-gray-400 text-sm">
                  <strong className="text-white">Faustformel:</strong> Für die meisten praktischen Anwendungsfälle – 
                  Chatbots, Klassifikatoren, domänenspezifische Assistenten – ist LoRA die bessere Wahl. 
                  Full Fine-Tuning lohnt sich erst ab sehr großen, domänenspezifischen Datensätzen 
                  (100.000+ Beispiele) und mit entsprechender GPU-Infrastruktur.
                </p>
              </div>
            </div>

            {/* QLoRA */}
            <div className="glass-strong rounded-2xl p-8 border border-white/10">
              <h2 className="text-3xl font-black text-white mb-6 flex items-center gap-3">
                <Cpu className="w-8 h-8 text-blue-400" />
                QLoRA – noch weniger VRAM
              </h2>
              <div className="text-gray-300 space-y-4 leading-relaxed">
                <p>
                  <strong className="text-white">QLoRA (Quantized LoRA)</strong> kombiniert LoRA mit 4-Bit-Quantisierung 
                  des Basismodells. Das Modell wird dabei in 4-Bit-Präzision geladen, was den Speicherbedarf 
                  nochmals drastisch reduziert – und die LoRA-Adapter weiterhin in 16-Bit trainiert.
                </p>
                <p>
                  Ergebnis: Llama-3 8B ist mit QLoRA auf einer <strong className="text-white">RTX 3060 (12 GB)</strong> trainierbar. 
                  Ein 13B-Modell benötigt etwa 14–16 GB VRAM. Das macht professionelles LLM-Fine-Tuning 
                  auch ohne High-End-Hardware möglich.
                </p>
              </div>

              {/* VRAM Table */}
              <div className="mt-6 overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="text-left py-3 px-4 text-gray-400 font-semibold">Modell</th>
                      <th className="text-left py-3 px-4 text-gray-400 font-semibold">Full FT</th>
                      <th className="text-left py-3 px-4 text-gray-400 font-semibold">LoRA (FP16)</th>
                      <th className="text-left py-3 px-4 text-gray-400 font-semibold">QLoRA (4-Bit)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {[
                      ['Llama-3 8B', '~64 GB', '~18 GB', '~10 GB'],
                      ['Llama-3 13B', '~104 GB', '~28 GB', '~14 GB'],
                      ['Mistral 7B', '~56 GB', '~16 GB', '~8 GB'],
                      ['Phi-3 Mini 3.8B', '~30 GB', '~10 GB', '~6 GB'],
                    ].map(([model, full, lora, qlora], i) => (
                      <tr key={i} className="hover:bg-white/2 transition-colors">
                        <td className="py-3 px-4 text-white font-medium">{model}</td>
                        <td className="py-3 px-4 text-red-400">{full}</td>
                        <td className="py-3 px-4 text-yellow-400">{lora}</td>
                        <td className="py-3 px-4 text-green-400">{qlora}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* LoRA Hyperparameter */}
            <div className="glass-strong rounded-2xl p-8 border border-white/10">
              <h2 className="text-3xl font-black text-white mb-6 flex items-center gap-3">
                <Code2 className="w-8 h-8 text-green-400" />
                Wichtige LoRA Hyperparameter
              </h2>
              <div className="space-y-4">
                {[
                  {
                    param: 'rank (r)',
                    typical: '4, 8, 16, 32',
                    desc: 'Rank der LoRA-Matrizen. Höherer Rank = mehr Parameter, mehr Kapazität, aber auch mehr VRAM. Für einfache Aufgaben reicht r=8, für komplexere Domänenadaption r=16–32.',
                  },
                  {
                    param: 'alpha (α)',
                    typical: 'gleich wie rank',
                    desc: 'Skalierungsfaktor für die LoRA-Gewichte. Oft auf den gleichen Wert wie rank gesetzt. Höheres Alpha = aggressivere Updates.',
                  },
                  {
                    param: 'target_modules',
                    typical: 'q_proj, v_proj',
                    desc: 'Welche Schichten mit LoRA adaptiert werden. Query und Value Projektionen sind Standard. Mehr Module = mehr Kapazität, aber mehr Speicher.',
                  },
                  {
                    param: 'lora_dropout',
                    typical: '0.05 – 0.1',
                    desc: 'Dropout-Rate auf die LoRA-Schichten. Hilft gegen Overfitting bei kleinen Datensätzen.',
                  },
                ].map(({ param, typical, desc }) => (
                  <div key={param} className="glass rounded-xl p-5 border border-white/10">
                    <div className="flex items-center gap-3 mb-2">
                      <code className="text-purple-400 font-mono font-bold text-sm bg-purple-500/10 px-2 py-1 rounded">{param}</code>
                      <span className="text-xs text-gray-500">typisch: {typical}</span>
                    </div>
                    <p className="text-gray-400 text-sm leading-relaxed">{desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* CTA */}
            <div className="glass-strong rounded-2xl p-8 border border-purple-500/20 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl mb-6">
                <Zap className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-black text-white mb-4">
                LoRA Fine-Tuning direkt in FrameTrain
              </h3>
              <p className="text-gray-400 mb-6 max-w-lg mx-auto">
                LoRA, QLoRA, Rank, Alpha, Target-Module – alles konfigurierbar in einer intuitiven 
                Oberfläche. Keine Codezeile nötig. Lokal auf deiner GPU.
              </p>
              <div className="flex gap-4 justify-center flex-wrap">
                <Link
                  href="/register"
                  className="relative group inline-block px-8 py-3 rounded-xl overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600" />
                  <div className="relative flex items-center gap-2 text-white font-semibold">
                    <span>Jetzt starten</span>
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </Link>
                <Link href="/docs" className="glass-strong px-8 py-3 rounded-xl text-gray-300 hover:text-white transition font-semibold">
                  Dokumentation
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
