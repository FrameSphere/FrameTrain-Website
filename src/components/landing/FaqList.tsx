'use client'

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'

type FaqEntry = { question: string; answer: string }

/**
 * Akkordeon zwischen 1px-Linien. Die Antworten bleiben immer im DOM (SEO
 * und FAQPage-Markup), aufgeklappt wird über grid-template-rows, damit die
 * echte Höhe animiert wird.
 */
export function FaqList({ items }: { items: FaqEntry[] }) {
  const [open, setOpen] = useState<number | null>(0)
  return (
    <div className="border-t border-line">
      {items.map((item, i) => {
        const isOpen = open === i
        return (
          <div key={item.question} className="border-b border-line">
            <h3 className="m-0">
              <button
                type="button"
                onClick={() => setOpen(isOpen ? null : i)}
                aria-expanded={isOpen}
                className="w-full flex items-center justify-between gap-6 py-5 text-left text-[17px] leading-7 font-medium text-ink hover:text-ink-muted transition-colors duration-150"
              >
                {item.question}
                <ChevronDown
                  className={`w-5 h-5 flex-none text-ink-faint transition-transform duration-[240ms] ease-out ${isOpen ? 'rotate-180' : ''}`}
                  strokeWidth={1.5}
                  aria-hidden="true"
                />
              </button>
            </h3>
            <div
              className={`grid transition-[grid-template-rows] duration-[240ms] ease-out motion-reduce:transition-none ${
                isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
              }`}
            >
              <div className="overflow-hidden">
                <p className="pb-6 pr-10 m-0 text-[16px] leading-[27px] text-ink-muted max-w-[68ch]">{item.answer}</p>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
