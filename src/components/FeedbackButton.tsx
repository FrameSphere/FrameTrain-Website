'use client'

import { openFeedback } from '@/components/FeedbackDialog'

/** Öffnet das globale Feedback-Fenster – nutzbar auch aus Server-Komponenten wie dem Footer. */
export function FeedbackButton({ label, className = '' }: { label: string; className?: string }) {
  return (
    <button type="button" onClick={openFeedback} className={className}>
      {label}
    </button>
  )
}
