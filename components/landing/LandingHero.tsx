'use client'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { SlidingGrid } from '@/components/ui-custom/SlidingGrid'
import { STATS } from './data'

export function LandingHero() {
  return (
    <section className="relative min-h-svh flex flex-col items-center justify-center overflow-hidden bg-[#040705] text-center px-5 pt-28 pb-24 md:px-10">
      <SlidingGrid speed={0.35} />
      {/* Radial glows */}
      <div aria-hidden className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 w-[min(760px,140vw)] h-[min(760px,140vw)] rounded-full bg-[radial-gradient(circle,rgba(13,158,117,0.13)_0%,transparent_65%)] animate-pulse" style={{ animationDuration: '4s' }} />
      <div aria-hidden className="pointer-events-none absolute -bottom-24 -right-20 w-80 h-80 rounded-full bg-[radial-gradient(circle,rgba(13,158,117,0.07)_0%,transparent_65%)]" />

      <div className="relative z-10 flex flex-col items-center gap-7 animate-in fade-in slide-in-from-bottom-8 duration-700">
        <Badge className="gap-2 bg-[#0d9e75]/10 text-[#14c490] border border-[#0d9e75]/30 hover:bg-[#0d9e75]/15 px-4 py-1.5 rounded-full text-xs font-semibold tracking-wide">
          <span className="size-1.5 rounded-full bg-[#14c490] animate-pulse" />
          Built for ETHGlobal Open · Base Mainnet
        </Badge>

        <h1 className="text-[clamp(44px,9vw,96px)] font-extrabold leading-[1.0] tracking-[-0.03em] text-[#e5f2ea] max-w-4xl">
          Freelance without
          <br />
          <span style={{ WebkitTextStroke: '2px #0a7a5a', color: 'transparent' }}>the </span>
          <span className="text-[#14c490]">risk.</span>
        </h1>

        <p className="text-[clamp(15px,2vw,20px)] text-[#95b8a5] max-w-[560px] leading-relaxed font-light">
          Every participant is a verified human. Every payment held in USDC
          escrow and released with SLA-guaranteed execution.
          No middlemen. No scams. No ghost jobs.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3">
          <Button asChild size="lg" className="bg-[#0d9e75] hover:bg-[#14c490] text-white font-bold rounded-xl gap-2 transition-all duration-200 hover:-translate-y-0.5">
            <Link href="/jobs">Browse Jobs <ArrowRight className="size-4" /></Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="border-[#294038] text-[#95b8a5] hover:border-[#0a7a5a] hover:text-[#14c490] bg-transparent rounded-xl transition-all duration-200">
            <Link href="/jobs/post">Post a Job</Link>
          </Button>
        </div>

        {/* Stats bar */}
        <div className="w-full max-w-3xl grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 border border-[#1e2f24] rounded-2xl overflow-hidden bg-[#0b1310]">
          {STATS.map((s, i) => (
            <div key={i} className="group relative flex flex-col items-center justify-center py-4 px-3 border-r border-[#1e2f24] last:border-r-0 [&:nth-child(3)]:border-r-0 sm:[&:nth-child(3)]:border-r lg:[&:nth-child(3)]:border-r [&:nth-child(3)]:border-t-0 [&:nth-child(4)]:border-t sm:[&:nth-child(4)]:border-t-0">
              <div className="absolute top-0 left-1/2 right-1/2 h-0.5 bg-[#0d9e75] transition-all duration-300 group-hover:left-0 group-hover:right-0" />
              <div className="text-[clamp(18px,2.5vw,26px)] font-extrabold text-[#e5f2ea] leading-none mb-1">{s.n}</div>
              <div className="text-[10px] text-[#344d3f] tracking-wide text-center">{s.l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Scroll hint */}
      <div className="hidden md:flex absolute bottom-8 left-1/2 -translate-x-1/2 flex-col items-center gap-2 text-[10px] text-[#344d3f] tracking-[0.2em] uppercase select-none animate-in fade-in duration-700 delay-1000">
        <div className="w-px h-9 bg-gradient-to-b from-[#0d9e75] to-transparent animate-bounce" />
        scroll
      </div>
    </section>
  )
}
