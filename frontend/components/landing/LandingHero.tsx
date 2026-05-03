'use client'

import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { SlidingGrid } from '@/components/ui-custom/SlidingGrid'
import { STATS } from './data'

export function LandingHero() {
  return (
    <section className="relative min-h-svh flex flex-col items-center justify-center overflow-hidden text-center px-5 pt-28 pb-24 md:px-10 transition-colors duration-300"
      style={{ backgroundColor: 'var(--bg-page)' }}>
      <SlidingGrid speed={0.35} opacity={0.3} />
      <div aria-hidden className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 w-[min(760px,140vw)] h-[min(760px,140vw)] rounded-full animate-pulse" style={{ background: 'radial-gradient(circle,rgba(13,158,117,0.13) 0%,transparent 65%)', animationDuration: '4s' }} />

      <div className="relative z-10 flex flex-col items-center gap-7 animate-in fade-in slide-in-from-bottom-8 duration-700">
        <Badge className="gap-2 px-4 py-1.5 rounded-full text-xs font-semibold tracking-wide text-[var(--teal-hi)]"
          style={{ background: 'rgba(13,158,117,0.1)', border: '1px solid rgba(13,158,117,0.3)' }}>
          <span className="size-1.5 rounded-full bg-[var(--teal-hi)] animate-pulse" />
          Built for ETHGlobal Open · OG Galileo Testnet Exclusive
        </Badge>

        <h1 className="text-[clamp(44px,9vw,96px)] font-extrabold leading-[1.0] tracking-[-0.03em] max-w-4xl transition-colors duration-300"
          style={{ color: 'var(--text-primary)' }}>
          Freelance without<br />
          <span style={{ WebkitTextStroke: '2px var(--teal-lo)', color: 'transparent' }}>the </span>
          <span style={{ color: 'var(--teal-hi)' }}>risk.</span>
        </h1>

        <p className="text-[clamp(15px,2vw,20px)] max-w-[560px] leading-relaxed font-light transition-colors duration-300"
          style={{ color: 'var(--text-secondary)' }}>
          Every participant is a verified human. Every payment held in USDC escrow and released with SLA-guaranteed execution. No middlemen. No scams.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3">
          <Button asChild size="lg" className="font-bold rounded-xl gap-2 transition-all duration-200 hover:-translate-y-0.5"
            style={{ backgroundColor: 'var(--teal)', color: '#fff' }}
            onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--teal-hi)')}
            onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'var(--teal)')}>
            <Link href="/jobs">Browse Jobs <ArrowRight className="size-4" /></Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="rounded-xl transition-all duration-200"
            style={{ borderColor: 'var(--border-strong)', color: 'var(--text-secondary)' }}>
            <Link href="/jobs/post">Post a Job</Link>
          </Button>
        </div>

        {/* Stats bar */}
        <div className="w-full max-w-3xl grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 rounded-2xl overflow-hidden transition-colors duration-300"
          style={{ border: '1px solid var(--border-base)', backgroundColor: 'var(--bg-surface)' }}>
          {STATS.map((s, i) => (
            <div key={i} className="group relative flex flex-col items-center justify-center py-4 px-3"
              style={{ borderRight: `1px solid var(--border-base)` }}>
              <div className="absolute top-0 left-1/2 right-1/2 h-0.5 transition-all duration-300 group-hover:left-0 group-hover:right-0"
                style={{ backgroundColor: 'var(--teal)' }} />
              <div className="text-[clamp(18px,2.5vw,26px)] font-extrabold leading-none mb-1 transition-colors"
                style={{ color: 'var(--text-primary)' }}>{s.n}</div>
              <div className="text-[10px] tracking-wide text-center transition-colors"
                style={{ color: 'var(--text-faint)' }}>{s.l}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="hidden md:flex absolute bottom-8 left-1/2 -translate-x-1/2 flex-col items-center gap-2 text-[10px] tracking-[0.2em] uppercase select-none"
        style={{ color: 'var(--text-faint)' }}>
        <div className="w-px h-9 animate-bounce" style={{ background: 'linear-gradient(var(--teal), transparent)' }} />
        scroll
      </div>
    </section>
  )
}
