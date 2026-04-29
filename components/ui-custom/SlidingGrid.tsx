'use client'
import { useParallax } from '@/hooks/useParallax'

interface Props {
  className?: string
  speed?: number
  opacity?: string
}

/**
 * Stikkverse-style sliding dot/grid background.
 * Place as first child of any relative/overflow-hidden section.
 */
export function SlidingGrid({ className = '', speed = 0.3, opacity = '0.45' }: Props) {
  const ref = useParallax(speed)
  return (
    <div
      ref={ref}
      aria-hidden
      className={`pointer-events-none absolute inset-0 -top-1/4 h-[150%] will-change-transform ${className}`}
      style={{
        opacity: Number(opacity),
        backgroundImage: [
          'radial-gradient(circle, rgba(13,158,117,0.35) 1px, transparent 1px)',
        ].join(','),
        backgroundSize: '40px 40px',
        maskImage: 'radial-gradient(ellipse 85% 75% at 50% 40%, black 20%, transparent 100%)',
        WebkitMaskImage: 'radial-gradient(ellipse 85% 75% at 50% 40%, black 20%, transparent 100%)',
      }}
    />
  )
}

/** Tighter line-grid variant for inner pages */
export function SlidingLineGrid({ className = '', speed = 0.2 }: Props) {
  const ref = useParallax(speed)
  return (
    <div
      ref={ref}
      aria-hidden
      className={`pointer-events-none absolute inset-0 -top-1/4 h-[150%] will-change-transform ${className}`}
      style={{
        backgroundImage: [
          'linear-gradient(rgba(30,47,36,0.6) 1px, transparent 1px)',
          'linear-gradient(90deg, rgba(30,47,36,0.6) 1px, transparent 1px)',
        ].join(','),
        backgroundSize: '56px 56px',
        maskImage: 'radial-gradient(ellipse 90% 80% at 50% 30%, black 20%, transparent 100%)',
        WebkitMaskImage: 'radial-gradient(ellipse 90% 80% at 50% 30%, black 20%, transparent 100%)',
      }}
    />
  )
}
