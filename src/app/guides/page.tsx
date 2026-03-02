import type { Metadata } from 'next'
import Link from 'next/link'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { Brain, Laptop, Cpu, Shield, ArrowRight } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Guides & Tutorials – FrameTrain',
  description: 'Guides zu lokalem ML Training: LoRA Fine-Tuning, GPU-Kaufberatung, lokal vs Cloud, DSGVO-konformes KI-Training.',
  openGraph: {
    title: 'FrameTrain Guides – ML Training Tutorials',
    description: 'Alles über lokales ML Training: LoRA, GPU-Guide, Cloud-Vergleich.',
    images: ['/og-image.svg'],
  },
}

const guides = [
  {
    icon: <Brain className="w-8 h-8 text-purple-400" />,
    title: 'LoRA Fine-Tuning erklärt',
    description: 'Was ist LoRA? Wie funktioniert QLoRA? Der vollständige Guide zu Parameter-effizientem Fine-Tuning von LLMs auf eigene Daten – mit VRAM-Vergleichen.',
    href: '/guides/lora-finetuning',
    tags: ['LLM', 'LoRA', 'QLoRA'],
    color: 'purple',
  },
  {
    icon: <Laptop className="w-8 h-8 text-green-400" />,
    title: 'Lokal vs Cloud – der ehrliche Vergleich',
    description: 'Google Colab, AWS SageMaker, Paperspace gegen lokale GPU-Training. Kosten, Datenschutz, Geschwindigkeit: Wann lohnt sich welcher Ansatz?',
    href: '/guides/local-vs-cloud',
    tags: ['Cloud', 'DSGVO', 'Kosten'],
    color: 'green',
  },
  {
    icon: <Cpu className="w-8 h-8 text-orange-400" />,
    title: 'Beste GPU für ML Training 2025',
    description: 'Von RTX 3060 bis RTX 4090 und Apple M4 Max: Welche GPU für welchen Anwendungsfall? Kaufberatung mit VRAM-Tabellen für LLM Fine-Tuning.',
    href: '/guides/gpu-guide',
    tags: ['GPU', 'Hardware', 'VRAM'],
    color: 'orange',
  },
]

const colorMap: Record<string, string> = {
  purple: 'from-purple-500 to-pink-500',
  green: 'from-green-500 to-cyan-500',
  orange: 'from-orange-500 to-red-500',
}

export default function GuidesPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1">
        <section className="py-20 px-4 border-b border-white/10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-3xl mb-6">
              <Shield className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-5xl md:text-6xl font-black text-white mb-6">Guides</h1>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Praxisorientierte Guides zu lokalen ML Training, LoRA Fine-Tuning und GPU-Auswahl.
            </p>
          </div>
        </section>

        <section className="py-16 px-4">
          <div className="max-w-4xl mx-auto grid gap-6">
            {guides.map((guide) => (
              <Link key={guide.href} href={guide.href} className="group">
                <div className="glass-strong rounded-2xl p-8 border border-white/10 hover:border-white/20 transition-all duration-300 hover:scale-[1.01]">
                  <div className="flex items-start gap-6">
                    <div className={`w-16 h-16 bg-gradient-to-br ${colorMap[guide.color]} rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform`}>
                      {guide.icon}
                    </div>
                    <div className="flex-1">
                      <h2 className="text-2xl font-black text-white mb-3 group-hover:text-purple-300 transition-colors">
                        {guide.title}
                      </h2>
                      <p className="text-gray-400 leading-relaxed mb-4">{guide.description}</p>
                      <div className="flex items-center gap-4">
                        <div className="flex gap-2 flex-wrap">
                          {guide.tags.map((tag) => (
                            <span key={tag} className="text-xs px-2 py-1 rounded bg-white/5 text-gray-500 font-mono border border-white/10">
                              {tag}
                            </span>
                          ))}
                        </div>
                        <div className="ml-auto flex items-center gap-1 text-purple-400 text-sm font-semibold group-hover:gap-2 transition-all">
                          <span>Lesen</span>
                          <ArrowRight className="w-4 h-4" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
