import type { Metadata } from 'next'
import Link from 'next/link'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { Cpu, Zap, Check, ChevronRight, ArrowRight } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Beste GPU für lokales ML Training – Kaufberatung 2025 | FrameTrain',
  description: 'Welche GPU für LLM Fine-Tuning, LoRA Training und lokales Machine Learning? NVIDIA RTX vs Apple Silicon M-Chips: der komplette GPU-Guide für AI-Training 2025.',
  keywords: [
    'beste GPU Machine Learning', 'GPU für KI Training', 'RTX 4090 ML Training',
    'Apple M2 M3 KI Training', 'VRAM für LLM Fine-Tuning', 'GPU Kaufberatung AI',
    'CUDA GPU für ML', 'lokales LLM Training GPU'
  ],
  openGraph: {
    title: 'Beste GPU für lokales ML Training 2025',
    description: 'NVIDIA RTX vs Apple Silicon: Welche GPU für AI-Training kaufen?',
    images: ['/og-image.svg'],
  },
}

const gpus = [
  {
    name: 'RTX 4090',
    vram: '24 GB',
    price: '~1.800 €',
    tier: 'Beste Wahl',
    tierColor: 'green',
    pros: ['Schnellste Consumer-GPU', '24 GB VRAM für 13B Modelle', 'CUDA 8.9 – alle Features'],
    cons: ['Teuerste Option', '450W TDP – hoher Stromverbrauch'],
    suitable: ['13B Modelle mit QLoRA', '7B Modelle mit Full LoRA', 'Schnelle Iterationszyklen'],
  },
  {
    name: 'RTX 4070 Ti / 4080',
    vram: '12–16 GB',
    price: '~700–1.100 €',
    tier: 'Empfehlung',
    tierColor: 'purple',
    pros: ['Sehr gute Performance/Preis-Ratio', 'Gut für 7B Modelle', 'Moderate Leistungsaufnahme'],
    cons: ['13B Modelle nur mit QLoRA', '12 GB kann bei großen Batches eng werden'],
    suitable: ['7B Modelle (LoRA & QLoRA)', 'Instruktions-Tuning', 'NLP-Klassifikation'],
  },
  {
    name: 'RTX 3090 / 4070',
    vram: '12–24 GB',
    price: '~600–900 €',
    tier: 'Gut & Günstig',
    tierColor: 'blue',
    pros: ['Sehr gutes Preis-Leistungs-Verhältnis', 'RTX 3090: 24 GB VRAM', 'CUDA 8.6 – breite Kompatibilität'],
    cons: ['RTX 3090: Ältere Architektur, weniger CUDA-Kerne', 'RTX 4070: Nur 12 GB VRAM'],
    suitable: ['Meiste 7B Modelle problemlos', 'LoRA & QLoRA Fine-Tuning'],
  },
  {
    name: 'Apple M3 / M4 Pro & Max',
    vram: '18–128 GB Unified',
    price: 'ab ~2.500 € (Mac)',
    tier: 'Apple-Alternative',
    tierColor: 'pink',
    pros: ['Sehr hohe Unified Memory Bandbreite', 'M3/M4 Max: bis 128 GB', 'Effizient & leise', 'Perfekt für macOS-Nutzer'],
    cons: ['Teurer als äquivalente NVIDIA-Lösung', 'MPS langsamer als CUDA für manche Ops', 'Kein CUDA-Ökosystem'],
    suitable: ['Lokales LLM-Inferenz', 'Fine-Tuning über Metal (MPS)', 'Studio/Creative-Workflows'],
  },
  {
    name: 'RTX 3060 12GB',
    vram: '12 GB',
    price: '~250–350 €',
    tier: 'Einsteiger',
    tierColor: 'gray',
    pros: ['Günstigster Einstieg', '12 GB VRAM für QLoRA', 'Breite CUDA-Unterstützung'],
    cons: ['Langsamer bei größeren Modellen', 'Kein 7B-LoRA ohne Quantisierung'],
    suitable: ['QLoRA auf 7B Modellen', 'Kleine Klassifikations-Modelle', 'Zum Lernen & Experimentieren'],
  },
]

const tierColors: Record<string, string> = {
  green: 'text-green-400 bg-green-500/10 border-green-500/30',
  purple: 'text-purple-400 bg-purple-500/10 border-purple-500/30',
  blue: 'text-blue-400 bg-blue-500/10 border-blue-500/30',
  pink: 'text-pink-400 bg-pink-500/10 border-pink-500/30',
  gray: 'text-gray-400 bg-gray-500/10 border-gray-500/30',
}

export default function GpuGuidePage() {
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
            <span className="text-gray-300">GPU Guide</span>
          </div>
        </div>

        {/* Hero */}
        <section className="py-16 px-4 border-b border-white/10">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-orange-500/20 text-orange-400 border border-orange-500/30">Hardware</span>
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30">Kaufberatung 2025</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-white mb-6 leading-tight">
              Beste GPU für lokales<br />
              <span className="bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent">
                ML Training & LLM Fine-Tuning
              </span>
            </h1>
            <p className="text-xl text-gray-400 leading-relaxed max-w-3xl">
              VRAM ist das entscheidende Kriterium. Hier findest du für jedes Budget und jeden 
              Anwendungsfall die richtige GPU – von der günstigen RTX 3060 bis zum Apple M4 Max.
            </p>
          </div>
        </section>

        <section className="py-12 px-4">
          <div className="max-w-4xl mx-auto space-y-8">

            {/* Quick Summary */}
            <div className="glass-strong rounded-2xl p-6 border border-white/10">
              <h2 className="text-xl font-bold text-white mb-4">Kurzfassung: VRAM-Faustregeln</h2>
              <div className="grid md:grid-cols-3 gap-4">
                {[
                  { vram: '6–8 GB', desc: 'QLoRA auf 7B Modellen (gerade so)', example: 'RTX 3070, RTX 4060' },
                  { vram: '12–16 GB', desc: 'LoRA auf 7B, QLoRA auf 13B', example: 'RTX 3060 12G, RTX 4070' },
                  { vram: '24 GB+', desc: 'LoRA auf 13B, größere Batches', example: 'RTX 3090, RTX 4090' },
                ].map(({ vram, desc, example }) => (
                  <div key={vram} className="glass rounded-xl p-4 border border-white/10">
                    <div className="text-2xl font-black text-purple-400 mb-1">{vram}</div>
                    <p className="text-gray-300 text-sm mb-2">{desc}</p>
                    <p className="text-xs text-gray-600 font-mono">{example}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* GPU Cards */}
            {gpus.map((gpu) => (
              <div key={gpu.name} className="glass-strong rounded-2xl p-8 border border-white/10">
                <div className="flex items-start justify-between gap-4 mb-6">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-2xl font-black text-white">{gpu.name}</h3>
                      <span className={`text-xs font-bold px-3 py-1 rounded-full border ${tierColors[gpu.tierColor]}`}>
                        {gpu.tier}
                      </span>
                    </div>
                    <div className="flex gap-4 text-sm">
                      <span className="text-gray-400"><span className="text-white font-semibold">{gpu.vram}</span> VRAM</span>
                      <span className="text-gray-400">ca. <span className="text-yellow-400 font-semibold">{gpu.price}</span></span>
                    </div>
                  </div>
                  <div className="hidden md:flex items-center justify-center w-14 h-14 bg-gradient-to-br from-gray-700 to-gray-800 rounded-xl border border-white/10">
                    <Cpu className="w-7 h-7 text-gray-400" />
                  </div>
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <h4 className="text-xs font-bold text-green-400 uppercase tracking-wider mb-3">Vorteile</h4>
                    <ul className="space-y-2">
                      {gpu.pros.map((p) => (
                        <li key={p} className="flex items-start gap-2 text-gray-300 text-sm">
                          <Check className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                          {p}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-red-400 uppercase tracking-wider mb-3">Nachteile</h4>
                    <ul className="space-y-2">
                      {gpu.cons.map((c) => (
                        <li key={c} className="flex items-start gap-2 text-gray-300 text-sm">
                          <span className="w-4 h-4 flex-shrink-0 mt-0.5 text-red-400 font-bold text-xs leading-4">✕</span>
                          {c}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-blue-400 uppercase tracking-wider mb-3">Geeignet für</h4>
                    <ul className="space-y-2">
                      {gpu.suitable.map((s) => (
                        <li key={s} className="flex items-start gap-2 text-gray-300 text-sm">
                          <Zap className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
                          {s}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ))}

            {/* CTA */}
            <div className="glass-strong rounded-2xl p-8 border border-purple-500/20 text-center">
              <h3 className="text-2xl font-black text-white mb-4">
                Deine GPU ist kompatibel – starte jetzt
              </h3>
              <p className="text-gray-400 mb-6 max-w-lg mx-auto">
                FrameTrain unterstützt alle NVIDIA-GPUs ab GTX 1060 (CUDA) und Apple Silicon M1–M4 (Metal). 
                Einmalig 1,99€, dann unbegrenzt trainieren.
              </p>
              <div className="flex gap-4 justify-center flex-wrap">
                <Link href="/register" className="relative group inline-block px-8 py-3 rounded-xl overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600" />
                  <div className="relative flex items-center gap-2 text-white font-semibold">
                    <span>Jetzt starten</span>
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </Link>
                <Link href="/guides/lora-finetuning" className="glass-strong px-8 py-3 rounded-xl text-gray-300 hover:text-white transition font-semibold">
                  LoRA Guide
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
