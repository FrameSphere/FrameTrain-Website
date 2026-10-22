'use client'

import { useState } from 'react'
import { ArrowRight } from 'lucide-react'
import { Link } from '@/i18n/navigation'
import { AppShot } from './AppShot'

type UseCase = {
  key: string
  tag: string
  title: string
  text: string
  stack: string[]
  shot: string
  alt: string
  href?: string
}

/**
 * Drei Einsteiger-Projekte. Alle Texte stehen sichtbar nebeneinander; die
 * gewählte Karte bestimmt, welchen Screenshot das Fenster darunter zeigt.
 */
export function UseCaseSwitcher({ items, locale, learnMore }: { items: UseCase[]; locale: string; learnMore: string }) {
  const [active, setActive] = useState(0)

  return (
    <div>
      <div className="grid gap-3 md:grid-cols-3">
        {items.map((u, i) => {
          const isActive = i === active
          return (
            <div
              key={u.key}
              className={`flex flex-col rounded-lg border transition-colors duration-150 ease-out ${
                isActive ? 'bg-surface border-line-strong' : 'bg-bg border-line hover:border-line-strong'
              }`}
            >
              <button
                type="button"
                onClick={() => setActive(i)}
                aria-pressed={isActive}
                className="flex-1 text-left p-7 pb-4 rounded-t-lg"
              >
                <span className="flex items-center gap-2.5 ft-label">
                  <span
                    className={`block rounded-pill transition-all duration-150 ${isActive ? 'w-3.5 h-3.5 bg-output' : 'w-2.5 h-2.5 bg-ink'}`}
                    aria-hidden="true"
                  />
                  <span className={isActive ? '!text-output-text' : ''}>{u.tag}</span>
                </span>
                <h3 className="ft-heading mt-4">{u.title}</h3>
                <p className="ft-small mt-3">{u.text}</p>
              </button>
              <div className="px-7 pb-6 flex flex-wrap items-center gap-2">
                {u.stack.map((s) => (
                  <span key={s} className="ft-data px-2.5 py-1 rounded-pill bg-ghost-fill text-ink-muted">
                    {s}
                  </span>
                ))}
                {u.href && (
                  <Link href={u.href} className="ft-link ml-auto inline-flex items-center gap-1 text-[14px] font-medium">
                    {learnMore}
                    <ArrowRight className="w-3.5 h-3.5" strokeWidth={1.5} aria-hidden="true" />
                  </Link>
                )}
              </div>
            </div>
          )
        })}
      </div>

      <div className="ft-window relative mt-8">
        {items.map((u, i) => (
          <div
            key={u.key}
            className={`${i === 0 ? 'relative' : 'absolute inset-0'} transition-opacity duration-500 ease-out ${
              i === active ? 'opacity-100' : 'opacity-0'
            }`}
            aria-hidden={i !== active}
          >
            <AppShot locale={locale} slug={u.shot} alt={u.alt} />
          </div>
        ))}
      </div>
    </div>
  )
}
