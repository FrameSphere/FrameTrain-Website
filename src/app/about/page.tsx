import type { Metadata } from 'next'
import Link from 'next/link'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import {
  Sparkles, Heart, Shield, Zap, Brain, Globe, Lock,
  Code2, Cpu, ArrowRight, Github, Users, Rocket, Star,
  Target, Eye, Lightbulb
} from 'lucide-react'

export const metadata: Metadata = {
  title: 'Über FrameTrain – Mission, Vision, Team | FrameTrain',
  description: 'FrameTrain wurde entwickelt, damit ML Engineers und Forscher KI-Modelle lokal trainieren können – ohne Cloud-Abhängigkeit, ohne Datenverlust, ohne Abo. Lerne das Team und die Mission kennen.',
  keywords: ['FrameTrain über uns', 'FrameTrain Team', 'lokales ML Training Mission', 'KI Tool Made in Germany'],
  openGraph: {
    title: 'Über FrameTrain – Mission & Vision',
    description: 'Warum wir FrameTrain gebaut haben und wohin die Reise geht.',
    images: ['/og-image.svg'],
  },
}

const values = [
  {
    icon: <Lock className="w-7 h-7" />,
    title: 'Privacy first',
    description: 'Lokales Training ist kein Feature – es ist das Fundament. Deine Daten gehören dir. Wir haben keine API, die deine Trainingsdaten je zu sehen bekommt.',
    color: 'from-purple-500 to-pink-500',
  },
  {
    icon: <Zap className="w-7 h-7" />,
    title: 'Einfachheit über Komplexität',
    description: 'ML-Training soll nicht an der Einrichtung scheitern. FrameTrain zielt darauf ab, dass der erste Trainingsrun in unter 10 Minuten startet – ohne Bash-Kenntnisse.',
    color: 'from-yellow-500 to-orange-500',
  },
  {
    icon: <Globe className="w-7 h-7" />,
    title: 'Zugänglichkeit',
    description: 'Der Early-Access-Preis von 1,99€ ist kein Zufall. Wir wollen, dass Studenten, Forscher und Indie-Entwickler dieselben Werkzeuge haben wie große Unternehmen.',
    color: 'from-green-500 to-cyan-500',
  },
  {
    icon: <Code2 className="w-7 h-7" />,
    title: 'Open Source wo möglich',
    description: 'Wir glauben an offene Ökosysteme. FrameTrain baut auf HuggingFace, PyTorch und dem Open-Source-ML-Stack auf – und gibt zurück wo wir können.',
    color: 'from-blue-500 to-purple-500',
  },
]

const techStack = [
  { name: 'PyTorch', desc: 'Deep Learning Framework', category: 'ML' },
  { name: 'HuggingFace Transformers', desc: 'Modell-Bibliothek', category: 'ML' },
  { name: 'PEFT / LoRA', desc: 'Parameter-effizientes Fine-Tuning', category: 'ML' },
  { name: 'BitsAndBytes', desc: 'QLoRA Quantisierung', category: 'ML' },
  { name: 'Tauri', desc: 'Cross-platform Desktop Framework', category: 'App' },
  { name: 'Rust', desc: 'System-Backend der App', category: 'App' },
  { name: 'Next.js', desc: 'Web-Interface', category: 'Web' },
  { name: 'CUDA / MPS', desc: 'GPU-Beschleunigung', category: 'HW' },
]

const milestones = [
  {
    date: 'Nov 2024',
    title: 'Early Access Launch',
    desc: 'Erste öffentliche Version mit LoRA, HuggingFace-Integration und GPU-Monitoring. 100+ frühe Nutzer am ersten Tag.',
    icon: <Rocket className="w-5 h-5" />,
    color: 'purple',
  },
  {
    date: 'Dez 2024',
    title: 'QLoRA & BF16',
    desc: 'QLoRA-Unterstützung ermöglicht Training von 13B-Modellen auf 12 GB VRAM. BF16 für Ampere-GPUs.',
    icon: <Cpu className="w-5 h-5" />,
    color: 'blue',
  },
  {
    date: 'Jan 2025',
    title: 'Apple M4 Support',
    desc: 'Vollständige Metal-Performance-Shader-Optimierung für Apple Silicon M4 Chips.',
    icon: <Star className="w-5 h-5" />,
    color: 'pink',
  },
  {
    date: '2025',
    title: 'Roadmap',
    desc: 'Multi-GPU-Training, Vision-Modelle, Extension-Ecosystem, kollaborative Projekte.',
    icon: <Lightbulb className="w-5 h-5" />,
    color: 'green',
    future: true,
  },
]

const colorMap: Record<string, string> = {
  purple: 'bg-purple-500/20 border-purple-500/30 text-purple-400',
  blue: 'bg-blue-500/20 border-blue-500/30 text-blue-400',
  pink: 'bg-pink-500/20 border-pink-500/30 text-pink-400',
  green: 'bg-green-500/20 border-green-500/30 text-green-400',
}

const categoryColors: Record<string, string> = {
  ML: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
  App: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
  Web: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20',
  HW: 'text-orange-400 bg-orange-500/10 border-orange-500/20',
}

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1">

        {/* ─── HERO ─── */}
        <section className="relative py-28 px-4 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-900/15 via-transparent to-blue-900/10 pointer-events-none" />
          <div className="absolute top-20 left-1/4 w-96 h-96 bg-purple-600 rounded-full blur-[160px] opacity-10 pointer-events-none" />
          <div className="absolute bottom-10 right-1/4 w-80 h-80 bg-blue-600 rounded-full blur-[140px] opacity-10 pointer-events-none" />

          <div className="max-w-4xl mx-auto relative text-center">
            <div className="inline-flex items-center gap-2 glass px-4 py-2 rounded-full text-sm text-gray-400 mb-8 border border-white/10">
              <Heart className="w-4 h-4 text-pink-500 fill-pink-500 animate-pulse" />
              <span>Made for ML Engineers, by ML Engineers</span>
            </div>

            <h1 className="text-5xl md:text-7xl font-black mb-8 leading-tight">
              <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
                Warum wir
              </span>
              <br />
              <span className="text-white">FrameTrain gebaut haben</span>
            </h1>

            <p className="text-xl md:text-2xl text-gray-400 max-w-3xl mx-auto leading-relaxed">
              Wir wollten selbst ein Tool, das lokales Fine-Tuning so einfach macht wie ein Klick –
              ohne Cloud-Abo, ohne Datenschutz-Kompromisse, ohne stundenlange Einrichtung.
              Also haben wir es gebaut.
            </p>
          </div>
        </section>

        {/* ─── ORIGIN STORY ─── */}
        <section className="py-20 px-4">
          <div className="max-w-4xl mx-auto">
            <div className="glass-strong rounded-3xl p-10 md:p-14 border border-white/10 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-purple-600/5 rounded-full blur-3xl pointer-events-none" />
              <div className="relative">
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                    <Brain className="w-5 h-5 text-white" />
                  </div>
                  <h2 className="text-3xl font-black text-white">Die Geschichte</h2>
                </div>

                <div className="space-y-5 text-gray-300 text-lg leading-relaxed">
                  <p>
                    Der Anfang war frustrierend: Wir wollten ein domänenspezifisches Sprachmodell auf einen
                    eigenen Datensatz fine-tunen. Sensible Daten – nichts für die Cloud.
                    Also: lokales Training. Die Alternative war, selbst Python-Scripts zu schreiben,
                    Abhängigkeiten zu debuggen, Konfigurationsdateien zu pflegen.
                  </p>
                  <p>
                    Für jemanden mit ML-Background: machbar. Für alle anderen:
                    <span className="text-white font-semibold"> eine Wand aus Komplexität</span>.
                    Dabei ist das eigentliche Problem – „ich möchte dieses Modell auf meine Daten anpassen" –
                    eigentlich verständlich und klar.
                  </p>
                  <p>
                    FrameTrain ist der Versuch, die Lücke zwischen
                    <span className="text-purple-400 font-semibold"> Idee und erstem Training</span> so klein
                    wie möglich zu machen. Eine native Desktop-App, die den gesamten Stack kapselt –
                    HuggingFace, PyTorch, LoRA, GPU-Scheduling – hinter einer Oberfläche, die man
                    sofort versteht.
                  </p>
                  <p>
                    Und weil wir wollen, dass das möglichst viele Menschen nutzen können:
                    einmalig <span className="text-green-400 font-semibold">1,99€</span>. Kein Abo,
                    kein per-Stunde-Preis, keine Überraschungen.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ─── MISSION / VISION ─── */}
        <section className="py-20 px-4">
          <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-6">
            <div className="glass-strong rounded-3xl p-10 border border-purple-500/20 relative overflow-hidden group hover:scale-[1.01] transition-transform duration-300">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-600/5 to-transparent pointer-events-none" />
              <div className="relative">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mb-6">
                  <Target className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-2xl font-black text-white mb-4">Mission</h2>
                <p className="text-gray-300 text-lg leading-relaxed">
                  Jeden ML Engineer und Forscher in die Lage versetzen, KI-Modelle lokal zu trainieren –
                  unabhängig von Cloud-Infrastruktur, Internetverbindung oder Budget. Lokales Training
                  soll so selbstverständlich werden wie lokale Entwicklung.
                </p>
              </div>
            </div>

            <div className="glass-strong rounded-3xl p-10 border border-blue-500/20 relative overflow-hidden group hover:scale-[1.01] transition-transform duration-300">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 to-transparent pointer-events-none" />
              <div className="relative">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center mb-6">
                  <Eye className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-2xl font-black text-white mb-4">Vision</h2>
                <p className="text-gray-300 text-lg leading-relaxed">
                  Eine Welt, in der proprietäre Unternehmensdaten nicht mehr auf fremden Servern
                  landen müssen, damit man KI nutzen kann. In der ein Arzt, ein Anwalt oder ein
                  Forscher ein Modell auf sensible Daten anpassen kann – vollständig lokal,
                  vollständig sicher.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ─── VALUES ─── */}
        <section className="py-20 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-14">
              <h2 className="text-4xl md:text-5xl font-black text-white mb-4">Unsere Prinzipien</h2>
              <p className="text-gray-400 text-lg max-w-xl mx-auto">
                Diese Überzeugungen leiten jede Entscheidung, die wir bei FrameTrain treffen.
              </p>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              {values.map((v) => (
                <div key={v.title} className="glass-strong rounded-2xl p-8 border border-white/10 hover:scale-[1.01] transition-transform duration-300">
                  <div className={`w-14 h-14 bg-gradient-to-br ${v.color} rounded-2xl flex items-center justify-center mb-6 text-white`}>
                    {v.icon}
                  </div>
                  <h3 className="text-xl font-black text-white mb-3">{v.title}</h3>
                  <p className="text-gray-400 leading-relaxed">{v.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── TECH STACK ─── */}
        <section className="py-20 px-4">
          <div className="max-w-4xl mx-auto">
            <div className="glass-strong rounded-3xl p-10 border border-white/10">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-xl flex items-center justify-center">
                  <Code2 className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-3xl font-black text-white">Tech Stack</h2>
              </div>
              <p className="text-gray-400 mb-8 leading-relaxed">
                FrameTrain baut vollständig auf Open-Source-Technologien auf. Kein proprietäres
                ML-Framework, keine Vendor-Lock-in-Bibliotheken. Das bedeutet: Wenn du FrameTrain
                nutzt, läuft echtes PyTorch auf deiner Maschine – nicht irgendein Wrapper.
              </p>
              <div className="grid sm:grid-cols-2 gap-3">
                {techStack.map((t) => (
                  <div key={t.name} className="glass rounded-xl px-5 py-4 border border-white/10 flex items-center justify-between gap-4 hover:bg-white/5 transition-colors">
                    <div>
                      <div className="text-white font-semibold text-sm">{t.name}</div>
                      <div className="text-gray-500 text-xs mt-0.5">{t.desc}</div>
                    </div>
                    <span className={`text-xs font-bold px-2 py-1 rounded border flex-shrink-0 ${categoryColors[t.category]}`}>
                      {t.category}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ─── MILESTONES ─── */}
        <section className="py-20 px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-14">
              <h2 className="text-4xl md:text-5xl font-black text-white mb-4">Meilensteine</h2>
              <p className="text-gray-400 text-lg">Von der ersten Version bis zur Roadmap</p>
            </div>

            <div className="relative">
              {/* Timeline line */}
              <div className="absolute left-6 top-0 bottom-0 w-px bg-gradient-to-b from-purple-500/50 via-blue-500/30 to-transparent hidden md:block" />

              <div className="space-y-6">
                {milestones.map((m, i) => (
                  <div key={i} className={`relative flex gap-6 ${m.future ? 'opacity-60' : ''}`}>
                    {/* Dot */}
                    <div className={`flex-shrink-0 w-12 h-12 rounded-full border-2 flex items-center justify-center z-10 hidden md:flex ${colorMap[m.color]}`}>
                      {m.icon}
                    </div>

                    <div className={`glass-strong rounded-2xl p-6 border border-white/10 flex-1 hover:border-white/20 transition-colors ${m.future ? 'border-dashed' : ''}`}>
                      <div className="flex items-center gap-3 mb-2">
                        <span className={`text-xs font-bold px-3 py-1 rounded-full border ${colorMap[m.color]}`}>
                          {m.date}
                        </span>
                        {m.future && (
                          <span className="text-xs text-gray-600 border border-gray-700 rounded-full px-2 py-0.5">Geplant</span>
                        )}
                      </div>
                      <h3 className="text-xl font-black text-white mb-2">{m.title}</h3>
                      <p className="text-gray-400 text-sm leading-relaxed">{m.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-8 text-center">
              <Link
                href="/changelog"
                className="inline-flex items-center gap-2 text-purple-400 hover:text-purple-300 transition font-semibold"
              >
                <span>Vollständiger Changelog</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>

        {/* ─── OPEN SOURCE ─── */}
        <section className="py-20 px-4">
          <div className="max-w-4xl mx-auto">
            <div className="glass-strong rounded-3xl p-10 border border-white/10 text-center relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-gray-800/20 to-transparent pointer-events-none" />
              <div className="relative">
                <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-white/20">
                  <Github className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-3xl font-black text-white mb-4">Open Source</h2>
                <p className="text-gray-300 text-lg leading-relaxed max-w-2xl mx-auto mb-8">
                  Die Website und Teile der Infrastruktur von FrameTrain sind Open Source.
                  Wir glauben, dass Transparenz Vertrauen aufbaut – besonders bei einem Tool,
                  das lokal auf deiner Hardware läuft.
                </p>
                <a
                  href="https://github.com/FrameSphere/FrameTrain-Website"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 glass-strong px-6 py-3 rounded-xl text-gray-200 hover:text-white border border-white/20 hover:border-white/30 transition font-semibold"
                >
                  <Github className="w-5 h-5" />
                  <span>GitHub ansehen</span>
                  <ArrowRight className="w-4 h-4" />
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* ─── STATS ─── */}
        <section className="py-20 px-4">
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { number: '100%', label: 'Lokal & Offline', icon: <Lock className="w-5 h-5" />, color: 'purple' },
                { number: '3', label: 'Betriebssysteme', icon: <Globe className="w-5 h-5" />, color: 'blue' },
                { number: '10+', label: 'GPU-Architekturen', icon: <Cpu className="w-5 h-5" />, color: 'green' },
                { number: '1,99€', label: 'Einmalig für immer', icon: <Sparkles className="w-5 h-5" />, color: 'pink' },
              ].map(({ number, label, icon, color }) => {
                const cs: Record<string, string> = {
                  purple: 'from-purple-500 to-pink-500',
                  blue: 'from-blue-500 to-cyan-500',
                  green: 'from-green-500 to-emerald-500',
                  pink: 'from-pink-500 to-rose-500',
                }
                return (
                  <div key={label} className="glass-strong rounded-2xl p-6 border border-white/10 text-center hover:scale-105 transition-transform">
                    <div className={`w-10 h-10 bg-gradient-to-br ${cs[color]} rounded-xl flex items-center justify-center text-white mx-auto mb-3`}>
                      {icon}
                    </div>
                    <div className={`text-3xl font-black bg-gradient-to-r ${cs[color]} bg-clip-text text-transparent mb-1`}>
                      {number}
                    </div>
                    <div className="text-xs text-gray-500 font-medium">{label}</div>
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        {/* ─── CTA ─── */}
        <section className="py-24 px-4">
          <div className="max-w-3xl mx-auto">
            <div className="glass-dark rounded-3xl p-14 relative overflow-hidden text-center">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-600/20 to-blue-600/10 pointer-events-none" />
              <div className="relative">
                <div className="flex items-center justify-center gap-2 mb-6">
                  <Users className="w-5 h-5 text-purple-400" />
                  <span className="text-gray-400 text-sm">Werde Teil der Community</span>
                </div>
                <h2 className="text-3xl md:text-4xl font-black text-white mb-5">
                  Bereit, lokal zu trainieren?
                </h2>
                <p className="text-gray-300 text-lg mb-8 max-w-xl mx-auto">
                  Einmalig 1,99€. Kein Abo. Keine Cloud. Volle Kontrolle über deine Modelle und Daten.
                </p>
                <div className="flex gap-4 justify-center flex-wrap">
                  <Link href="/register" className="relative group inline-block px-8 py-4 rounded-2xl overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600" />
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 opacity-0 group-hover:opacity-100 blur-xl transition-opacity" />
                    <div className="relative flex items-center gap-2 text-white font-bold text-lg">
                      <Sparkles className="w-5 h-5" />
                      <span>Jetzt starten</span>
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </Link>
                  <Link href="/faq" className="glass-strong px-8 py-4 rounded-2xl text-gray-300 hover:text-white transition font-bold text-lg border border-white/10">
                    FAQ lesen
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

      </main>

      <Footer />
    </div>
  )
}
