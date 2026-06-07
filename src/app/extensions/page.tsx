/* Temporäre UI Anfang, bald herausnehmen */
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { Package, Zap, Brain, Code2, ArrowRight } from 'lucide-react'
import Link from 'next/link'

export default function ExtensionsPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 flex items-center justify-center px-4 py-24">
        <div className="max-w-2xl w-full text-center">

          {/* Icon */}
          <div className="relative inline-flex mb-8">
            <div className="w-24 h-24 bg-gradient-to-br from-purple-600 via-pink-600 to-blue-600 rounded-3xl flex items-center justify-center shadow-2xl shadow-purple-500/40">
              <Package className="w-12 h-12 text-white" />
            </div>
            <div className="absolute -top-1 -right-1 w-6 h-6 bg-amber-500 rounded-full flex items-center justify-center shadow-lg shadow-amber-500/50">
              <span className="text-white text-xs font-black">!</span>
            </div>
          </div>

          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-sm font-bold mb-6">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500" />
            </span>
            Coming Soon
          </div>

          {/* Headline */}
          <h1 className="text-5xl md:text-6xl font-black mb-6">
            <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
              Extensions Marketplace
            </span>
          </h1>

          <p className="text-xl text-gray-400 mb-4 leading-relaxed">
            Der Marketplace ist noch nicht geöffnet.
          </p>
          <p className="text-gray-500 mb-12 max-w-lg mx-auto">
            Hier kannst du bald professionelle Extensions für FrameTrain kaufen und installieren –
            von NLP-Tools bis Computer Vision, direkt in der App.
          </p>

          {/* Preview Cards */}
          <div className="grid grid-cols-3 gap-4 mb-12 opacity-40 select-none pointer-events-none">
            {[
              { icon: Brain, label: 'NLP Suite', color: 'from-purple-600 to-pink-600' },
              { icon: Zap, label: 'Compression', color: 'from-blue-600 to-cyan-600' },
              { icon: Code2, label: 'Code ML', color: 'from-green-600 to-emerald-600' },
            ].map(({ icon: Icon, label, color }) => (
              <div key={label} className="glass-strong rounded-2xl p-5 border border-white/10">
                <div className={`w-10 h-10 bg-gradient-to-br ${color} rounded-xl flex items-center justify-center mb-3 mx-auto`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <div className="text-white text-sm font-semibold">{label}</div>
                <div className="text-gray-600 text-xs mt-1">Bald verfügbar</div>
              </div>
            ))}
          </div>

          {/* Back to Dashboard */}
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 px-8 py-4 glass-strong border border-white/15 text-gray-300 font-semibold rounded-2xl hover:border-purple-500/40 hover:text-white transition-all group"
          >
            <ArrowRight className="w-5 h-5 rotate-180" />
            Zurück zum Dashboard
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  )
}
/* Temporäre UI Ende */
