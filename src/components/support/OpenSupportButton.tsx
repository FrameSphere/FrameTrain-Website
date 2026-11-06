'use client'

import { MessageCircle } from 'lucide-react'
import { openSupport, type SupportView } from '@/lib/support'

/** Oeffnet den Support-Chat – nutzbar aus Server-Komponenten (z. B. /support). */
export function OpenSupportButton({ label, view = 'new', variant = 'primary' }: { label: string; view?: SupportView; variant?: 'primary' | 'ghost' }) {
  return (
    <button
      type="button"
      onClick={() => openSupport(view)}
      className={`ft-btn ${variant === 'primary' ? 'ft-btn--primary' : 'ft-btn--ghost'} inline-flex items-center gap-2`}
    >
      <MessageCircle className="w-4 h-4" />
      {label}
    </button>
  )
}
