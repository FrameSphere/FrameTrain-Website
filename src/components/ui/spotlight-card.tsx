'use client'

import React, { useEffect, useRef, ReactNode } from 'react'

interface GlowCardProps {
  children: ReactNode
  className?: string
  glowColor?: 'blue' | 'purple' | 'green' | 'red' | 'orange'
  size?: 'sm' | 'md' | 'lg'
  width?: string | number
  height?: string | number
  customSize?: boolean // When true, ignores size prop and uses width/height or className
}

const glowColorMap = {
  blue: { base: 220, spread: 200 },
  purple: { base: 280, spread: 300 },
  green: { base: 120, spread: 200 },
  red: { base: 0, spread: 200 },
  orange: { base: 30, spread: 200 },
}

const sizeMap = {
  sm: 'w-48 h-64',
  md: 'w-64 h-80',
  lg: 'w-80 h-96',
}

const GlowCard: React.FC<GlowCardProps> = ({
  children,
  className = '',
  glowColor = 'blue',
  size = 'md',
  width,
  height,
  customSize = false,
}) => {
  const cardRef = useRef<HTMLDivElement>(null)
  const innerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Auf Touch gibt es keinen Cursor – der Listener liefe dort umsonst und
    // würde bei jedem Scroll-Pointerevent Style-Recalcs auslösen.
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    let frame = 0
    let ev: PointerEvent | null = null

    // getBoundingClientRect() im Event-Handler erzwingt Layout bei jedem
    // Mausereignis; gebündelt im rAF passiert das höchstens einmal pro Frame.
    const paint = () => {
      frame = 0
      const el = cardRef.current
      if (!el || !ev) return
      const rect = el.getBoundingClientRect()
      el.style.setProperty('--x', (ev.clientX - rect.left).toFixed(2))
      el.style.setProperty('--xp', (ev.clientX / window.innerWidth).toFixed(2))
      el.style.setProperty('--y', (ev.clientY - rect.top).toFixed(2))
      el.style.setProperty('--yp', (ev.clientY / window.innerHeight).toFixed(2))
    }

    const syncPointer = (e: PointerEvent) => {
      ev = e
      if (!frame) frame = requestAnimationFrame(paint)
    }

    document.addEventListener('pointermove', syncPointer, { passive: true })
    return () => {
      document.removeEventListener('pointermove', syncPointer)
      if (frame) cancelAnimationFrame(frame)
    }
  }, [])

  const { base, spread } = glowColorMap[glowColor]

  // Determine sizing
  const getSizeClasses = () => {
    if (customSize) {
      return '' // Let className or inline styles handle sizing
    }
    return sizeMap[size]
  }

  const getInlineStyles = (): React.CSSProperties => {
    const baseStyles: Record<string, string | number> = {
      '--base': base,
      '--spread': spread,
      '--radius': '14',
      '--border': '3',
      '--backdrop': 'hsl(0 0% 60% / 0.12)',
      '--backup-border': 'var(--backdrop)',
      '--size': '200',
      '--outer': '1',
      '--border-size': 'calc(var(--border, 2) * 1px)',
      '--spotlight-size': 'calc(var(--size, 150) * 1px)',
      '--hue': 'calc(var(--base) + (var(--xp, 0) * var(--spread, 0)))',
      backgroundImage: `radial-gradient(
        var(--spotlight-size) var(--spotlight-size) at
        calc(var(--x, 0) * 1px)
        calc(var(--y, 0) * 1px),
        hsl(var(--hue, 210) calc(var(--saturation, 100) * 1%) calc(var(--lightness, 70) * 1%) / var(--bg-spot-opacity, 0.1)), transparent
      )`,
      backgroundColor: 'var(--backdrop, transparent)',
      backgroundSize: 'calc(100% + (2 * var(--border-size))) calc(100% + (2 * var(--border-size)))',
      backgroundPosition: '50% 50%',
      backgroundAttachment: 'scroll',
      border: 'var(--border-size) solid var(--backup-border)',
      position: 'relative',
      touchAction: 'none',
    }

    // Add width and height if provided
    if (width !== undefined) {
      baseStyles.width = typeof width === 'number' ? `${width}px` : width
    }
    if (height !== undefined) {
      baseStyles.height = typeof height === 'number' ? `${height}px` : height
    }

    return baseStyles as React.CSSProperties
  }

  // Das <style>-Tag stand vorher hier im JSX: bei zwei GlowCards auf der
  // Pricing-Sektion landete dasselbe Stylesheet zweimal im DOM. Die Regeln
  // sind statisch und global ([data-glow]) und liegen jetzt in globals.css.


  return (
    <div
      ref={cardRef}
      data-glow
      style={getInlineStyles()}
      className={`
        ${getSizeClasses()}
        ${!customSize ? 'aspect-[3/4]' : ''}
        rounded-2xl
        relative
        grid
        grid-rows-[1fr_auto]
        shadow-[0_1rem_2rem_-1rem_black]
        p-4
        gap-4
        backdrop-blur-[5px]
        ${className}
      `}
    >
      <div ref={innerRef} data-glow></div>
      {children}
    </div>
  )
}

export { GlowCard }
