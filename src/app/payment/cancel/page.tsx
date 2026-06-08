'use client'

import Link from 'next/link'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { XCircle, ArrowLeft, RefreshCw, MessageCircle } from 'lucide-react'

export default function PaymentCancelPage() {
  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      {/* Background — identisch zu den anderen Seiten */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute w-[600px] h-[600px] rounded-full top-[-150px] right-[-100px]"
          style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.15) 0%, transparent 70%)' }} />
        <div className="absolute w-[400px] h-[400px] rounded-full bottom-[-80px] left-[-80px]"
          style={{ background: 'radial-gradient(circle, rgba(236,72,153,0.12) 0%, transparent 70%)' }} />
        <div className="absolute inset-0"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)',
            backgroundSize: '60px 60px',
          }} />
      </div>

      <Header />

      <main className="flex-1 flex items-center justify-center px-4 py-16 relative">
        <div className="w-full max-w-lg">

          {/* Icon */}
          <div className="flex justify-center mb-8">
            <div className="relative">
              <div className="absolute inset-0 bg-red-500/20 rounded-full blur-2xl" />
              <div className="relative w-24 h-24 rounded-3xl flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, rgba(239,68,68,0.2), rgba(239,68,68,0.08))', border: '1px solid rgba(239,68,68,0.3)' }}>
                <XCircle className="w-12 h-12 text-red-400" />
              </div>
            </div>
          </div>

          {/* Card */}
          <div className="rounded-3xl p-8 md:p-10 text-center"
            style={{
              background: 'linear-gradient(145deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02))',
              border: '1px solid rgba(255,255,255,0.09)',
              backdropFilter: 'blur(24px)',
              boxShadow: '0 40px 80px rgba(0,0,0,0.4)',
            }}>

            <h1 className="text-4xl font-black text-white mb-3">Zahlung abgebrochen</h1>
            <p className="text-gray-400 text-lg mb-8 leading-relaxed">
              Die Zahlung wurde nicht abgeschlossen.
              <br />
              <span className="text-gray-500 text-base">Keine Sorge – es wurden keine Gebühren erhoben.</span>
            </p>

            {/* Info Box */}
            <div className="rounded-2xl p-5 mb-8 text-left"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <h2 className="text-white font-semibold mb-3 text-sm uppercase tracking-widest opacity-60">Was passiert jetzt?</h2>
              <ul className="space-y-2.5">
                {[
                  'Du kannst die Zahlung jederzeit wiederholen',
                  'Dein Account bleibt aktiv (ohne API-Key)',
                  'Keine automatischen Abbuchungen',
                ].map(item => (
                  <li key={item} className="flex items-center gap-3 text-gray-300 text-sm">
                    <span className="w-1.5 h-1.5 rounded-full bg-purple-400 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center mb-8">
              <Link href="/payment"
                className="relative group flex items-center justify-center gap-2 px-6 py-3 rounded-xl overflow-hidden font-semibold text-white">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600" />
                <RefreshCw className="relative w-4 h-4" />
                <span className="relative">Zahlung erneut versuchen</span>
              </Link>
              <Link href="/dashboard"
                className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold text-gray-300 hover:text-white transition-all"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
                <ArrowLeft className="w-4 h-4" />
                Zurück zum Dashboard
              </Link>
            </div>

            {/* Support */}
            <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
              <MessageCircle className="w-3.5 h-3.5" />
              <span>Probleme bei der Zahlung?{' '}
                <Link
                  href="/dashboard?support=open"
                  className="text-purple-400 hover:text-purple-300 underline underline-offset-2 transition-colors">
                  Support im Dashboard kontaktieren
                </Link>
              </span>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
