'use client'

import { useEffect, useRef, useState } from 'react'
import { Pause, Play, RotateCcw } from 'lucide-react'
import { AppShot } from './AppShot'

type Step = { key: string; label: string; title: string; text: string; shot: string; alt: string }

type Props = {
  steps: Step[]
  locale: string
  loopBack: string
  pauseLabel: string
  playLabel: string
}

const STEP_MS = 5200

/**
 * Der Kreislauf als geführter Rundgang: links die fünf Schritte (alle Texte
 * stehen sichtbar im HTML – gut für Leser und Crawler), rechts das
 * App-Fenster mit dem passenden Screenshot.
 *
 * Läuft von selbst weiter, sobald er im Bild ist; der orange Balken zeigt
 * die verbleibende Zeit. Hover oder Fokus pausieren, ein Klick springt.
 * Bei prefers-reduced-motion gibt es keinen Autoplay.
 */
export function LoopPlayer({ steps, locale, loopBack, pauseLabel, playLabel }: Props) {
  const [active, setActive] = useState(0)
  const [playing, setPlaying] = useState(true)
  const [inView, setInView] = useState(false)
  const [hovered, setHovered] = useState(false)
  const [reduced, setReduced] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    setReduced(mq.matches)
    if (mq.matches) setPlaying(false)
    const el = rootRef.current
    if (!el) return
    const io = new IntersectionObserver(([e]) => setInView(e.isIntersecting), { threshold: 0.35 })
    io.observe(el)
    return () => io.disconnect()
  }, [])

  const running = playing && inView && !hovered && !reduced
  const next = () => setActive((a) => (a + 1) % steps.length)

  return (
    <div
      ref={rootRef}
      className="grid gap-8 lg:gap-12 lg:grid-cols-[minmax(0,360px)_minmax(0,1fr)] items-start"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="order-2 lg:order-1">
        <ol className="flex flex-col gap-1">
          {steps.map((s, i) => {
            const isActive = i === active
            return (
              <li key={s.key}>
                <button
                  type="button"
                  onClick={() => setActive(i)}
                  aria-current={isActive ? 'step' : undefined}
                  className={`w-full text-left rounded-lg px-5 py-4 border transition-colors duration-150 ease-out ${
                    isActive ? 'bg-surface border-line' : 'border-transparent hover:bg-ghost-fill'
                  }`}
                >
                  <span className="flex items-center gap-3">
                    <span className={`ft-label ${isActive ? '!text-output-text' : ''}`}>{String(i + 1).padStart(2, '0')}</span>
                    <span className={`text-[17px] font-semibold tracking-[-0.01em] ${isActive ? 'text-ink' : 'text-ink-muted'}`}>
                      {s.title}
                    </span>
                  </span>
                  <span
                    className={`block mt-1.5 pl-[34px] text-[15px] leading-6 ${isActive ? 'text-ink-muted' : 'text-ink-faint'}`}
                  >
                    {s.text}
                  </span>
                  {isActive && (
                    <span className="block mt-3 ml-[34px] h-[3px] rounded-pill bg-ghost-edge overflow-hidden" aria-hidden="true">
                      <span
                        key={`${active}-${reduced}`}
                        onAnimationEnd={next}
                        className="block h-full bg-output origin-left"
                        style={
                          reduced
                            ? { transform: 'scaleX(1)' }
                            : {
                                animation: `ft-fill ${STEP_MS}ms linear forwards`,
                                animationPlayState: running ? 'running' : 'paused',
                              }
                        }
                      />
                    </span>
                  )}
                </button>
              </li>
            )
          })}
        </ol>

        <div className="mt-5 pl-5 flex items-center justify-between gap-4">
          <p className="flex items-center gap-2.5 text-[15px] leading-6 text-indigo-text m-0">
            <RotateCcw className="w-4 h-4 flex-none" strokeWidth={1.5} aria-hidden="true" />
            {loopBack}
          </p>
          {!reduced && (
            <button
              type="button"
              onClick={() => setPlaying((p) => !p)}
              aria-label={playing ? pauseLabel : playLabel}
              title={playing ? pauseLabel : playLabel}
              className="flex-none flex items-center justify-center w-11 h-11 rounded-pill bg-ghost-fill text-ink-muted hover:text-ink hover:bg-surface-raised transition-colors duration-150"
            >
              {playing ? <Pause className="w-4 h-4" strokeWidth={1.5} /> : <Play className="w-4 h-4" strokeWidth={1.5} />}
            </button>
          )}
        </div>
      </div>

      {/* App-Fenster: Screenshots liegen übereinander und blenden über */}
      <div className="order-1 lg:order-2 lg:sticky lg:top-28">
        <div className="ft-window relative">
          <div className="relative">
            {steps.map((s, i) => (
              <div
                key={s.key}
                className={`${i === 0 ? 'relative' : 'absolute inset-0'} transition-opacity duration-500 ease-out ${
                  i === active ? 'opacity-100' : 'opacity-0'
                }`}
                aria-hidden={i !== active}
              >
                <AppShot locale={locale} slug={s.shot} alt={s.alt} sizes="(min-width: 1120px) 700px, 100vw" />
              </div>
            ))}
          </div>
        </div>
        <div className="mt-4 flex items-center gap-2 justify-center lg:justify-start" aria-hidden="true">
          {steps.map((s, i) => (
            <span
              key={s.key}
              className={`h-1.5 rounded-pill transition-all duration-300 ${i === active ? 'w-6 bg-ink' : 'w-1.5 bg-line-strong'}`}
            />
          ))}
          <span className="ft-label ml-2">{steps[active]?.label}</span>
        </div>
      </div>
    </div>
  )
}
