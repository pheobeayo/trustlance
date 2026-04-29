'use client'

import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { SlidingGrid } from '@/components/ui-custom/SlidingGrid'
import { useReveal } from '@/hooks/useParallax'

export function LandingCTA() {
  const ref = useReveal()
  return (
    <section className="relative overflow-hidden px-5 md:px-10 py-24 md:py-36 text-center transition-colors duration-300" style={{ backgroundColor: 'var(--bg-page)' }}>
      <SlidingGrid speed={0.2} opacity={0.2} />
      <div aria-hidden className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[min(800px,120vw)] h-[min(400px,60vw)] rounded-full" style={{ background: 'radial-gradient(ellipse,rgba(13,158,117,0.12) 0%,transparent 65%)' }} />
      <div className="relative z-10 opacity-0 translate-y-6 transition-all duration-700 flex flex-col items-center gap-6" ref={ref as any}>
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold tracking-wide" style={{ color: 'var(--teal-hi)', background: 'rgba(13,158,117,0.1)', border: '1px solid rgba(13,158,117,0.3)' }}>
          <span className="size-1.5 rounded-full animate-pulse" style={{ backgroundColor: 'var(--teal-hi)' }} />Now live on Base Mainnet
        </div>
        <h2 className="text-[clamp(32px,5.5vw,68px)] font-extrabold leading-[1.08] tracking-tight max-w-3xl transition-colors" style={{ color: 'var(--text-primary)' }}>
          Ship your next contract<br /><span style={{ color: 'var(--teal-hi)' }}>without the trust tax.</span>
        </h2>
        <p className="text-[clamp(14px,1.8vw,17px)] max-w-md leading-relaxed font-light transition-colors" style={{ color: 'var(--text-secondary)' }}>
          Join 1,840 verified humans who freelance with cryptographic guarantees instead of blind faith.
        </p>
        <div className="flex flex-wrap gap-3 justify-center">
          <Button asChild size="lg" className="font-bold rounded-xl gap-2 transition-all hover:-translate-y-0.5" style={{ backgroundColor: 'var(--teal)', color: '#fff' }}>
            <Link href="/jobs">Browse Open Jobs <ArrowRight className="size-4" /></Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="rounded-xl" style={{ borderColor: 'var(--border-strong)', color: 'var(--text-secondary)' }}>
            <Link href="/jobs/post">Post a Job</Link>
          </Button>
        </div>
        <p className="flex items-center gap-2 text-[11px] flex-wrap justify-center text-center transition-colors" style={{ color: 'var(--text-faint)' }}>
          <span className="size-1 rounded-full inline-block flex-shrink-0" style={{ backgroundColor: 'var(--teal)' }} />
          Verification takes 2 minutes · World ID required once · 0% platform fee forever
        </p>
      </div>
    </section>
  )
}
