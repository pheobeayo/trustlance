'use client'

import { useParallax } from '@/hooks/useParallax'

interface Props { className?: string; speed?: number; opacity?: number }

export function SlidingGrid({ className = '', speed = 0.3, opacity = 0.45 }: Props) {
  const ref = useParallax(speed)
  return (
    <div ref={ref} aria-hidden
      className={`pointer-events-none absolute inset-0 -top-1/4 h-[150%] will-change-transform ${className}`}
      style={{
        opacity,
        backgroundImage: 'radial-gradient(circle, var(--teal) 1px, transparent 1px)',
        backgroundSize: '40px 40px',
        maskImage: 'radial-gradient(ellipse 85% 75% at 50% 40%, black 20%, transparent 100%)',
        WebkitMaskImage: 'radial-gradient(ellipse 85% 75% at 50% 40%, black 20%, transparent 100%)',
      }}
    />
  )
}

export function SlidingLineGrid({ className = '', speed = 0.2 }: Props) {
  const ref = useParallax(speed)
  return (
    <div ref={ref} aria-hidden
      className={`pointer-events-none absolute inset-0 -top-1/4 h-[150%] will-change-transform ${className}`}
      style={{
        backgroundImage: [
          'linear-gradient(var(--border-base) 1px, transparent 1px)',
          'linear-gradient(90deg, var(--border-base) 1px, transparent 1px)',
        ].join(','),
        backgroundSize: '56px 56px',
        maskImage: 'radial-gradient(ellipse 90% 80% at 50% 30%, black 20%, transparent 100%)',
        WebkitMaskImage: 'radial-gradient(ellipse 90% 80% at 50% 30%, black 20%, transparent 100%)',
      }}
    />
  )
}
