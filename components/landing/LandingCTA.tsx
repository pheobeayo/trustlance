'use client'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { SlidingGrid } from '@/components/ui-custom/SlidingGrid'
import { useReveal } from '@/hooks/useParallax'

export function LandingCTA() {
  const ref = useReveal()
  return (
    <section className="relative overflow-hidden px-5 md:px-10 py-24 md:py-36 text-center">
      <SlidingGrid speed={0.2} opacity="0.3" />
      <div aria-hidden className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[min(800px,120vw)] h-[min(400px,60vw)] rounded-full bg-[radial-gradient(ellipse,rgba(13,158,117,0.12)_0%,transparent_65%)]" />
      <div className="relative z-10 opacity-0 translate-y-6 transition-all duration-700 flex flex-col items-center gap-6" ref={ref as any}>
        <Badge className="gap-2 bg-[#0d9e75]/10 text-[#14c490] border border-[#0d9e75]/30 px-4 py-1.5 rounded-full text-xs font-semibold tracking-wide">
          <span className="size-1.5 rounded-full bg-[#14c490] animate-pulse" />
          Now live on Base Mainnet
        </Badge>
        <h2 className="text-[clamp(32px,5.5vw,68px)] font-extrabold leading-[1.08] tracking-tight max-w-3xl">
          Ship your next contract<br />
          <span className="text-[#14c490]">without the trust tax.</span>
        </h2>
        <p className="text-[clamp(14px,1.8vw,17px)] text-[#95b8a5] max-w-md leading-relaxed font-light">
          Join 1,840 verified humans who freelance with cryptographic guarantees instead of blind faith.
        </p>
        <div className="flex flex-wrap gap-3 justify-center">
          <Button asChild size="lg" className="bg-[#0d9e75] hover:bg-[#14c490] text-white font-bold rounded-xl gap-2 transition-all hover:-translate-y-0.5">
            <Link href="/jobs">Browse Open Jobs <ArrowRight className="size-4" /></Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="border-[#294038] text-[#95b8a5] hover:border-[#0a7a5a] hover:text-[#14c490] bg-transparent rounded-xl">
            <Link href="/jobs/post">Post a Job</Link>
          </Button>
        </div>
        <p className="flex items-center gap-2 text-[11px] text-[#344d3f] flex-wrap justify-center">
          <span className="size-1 rounded-full bg-[#0d9e75] inline-block flex-shrink-0" />
          Verification takes 2 minutes · World ID required once · 0% platform fee forever
        </p>
      </div>
    </section>
  )
}
