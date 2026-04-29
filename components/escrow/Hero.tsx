'use client'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { SlidingLineGrid } from '@/components/ui-custom/SlidingGrid'

const STATS = [
  { value: '$214k', label: 'in escrow today'     },
  { value: '1,840', label: 'verified humans'      },
  { value: '98.4%', label: 'release success rate' },
]

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-[#0b1310] border-b border-[#1e2f24] px-5 md:px-10 pt-12 pb-10">
      <SlidingLineGrid speed={0.15} />
      <div aria-hidden className="pointer-events-none absolute -top-24 -right-16 w-96 h-96 rounded-full bg-[radial-gradient(circle,rgba(13,158,117,0.07)_0%,transparent_65%)]" />
      <div className="relative z-10 max-w-6xl">
        <p className="flex items-center gap-3 text-[10px] font-bold tracking-[2.5px] text-[#0d9e75] uppercase mb-4 before:block before:w-7 before:h-px before:bg-[#0d9e75] before:flex-shrink-0">
          Sybil-resistant escrow marketplace
        </p>
        <h1 className="text-[clamp(30px,5vw,52px)] font-extrabold leading-[1.05] tracking-tight text-[#e5f2ea] max-w-xl mb-4">
          Freelance without <em className="not-italic text-[#14c490]">the risk.</em>
        </h1>
        <p className="text-[clamp(13px,1.6vw,15px)] text-[#95b8a5] max-w-lg leading-relaxed font-light mb-8">
          Every participant is World ID verified. Payments held in USDC escrow, released with SLA-guaranteed execution.
        </p>
        <div className="flex flex-wrap gap-3 mb-10">
          <Button asChild className="bg-[#0d9e75] hover:bg-[#14c490] text-white font-bold rounded-xl gap-2">
            <Link href="/jobs/post">Post a Job <ArrowRight className="size-4" /></Link>
          </Button>
          <Button variant="outline" className="border-[#294038] text-[#95b8a5] hover:border-[#0a7a5a] hover:text-[#14c490] bg-transparent rounded-xl">
            How it works ↓
          </Button>
        </div>
        <div className="flex flex-wrap gap-8">
          {STATS.map((s, i) => (
            <div key={i}>
              <div className="text-[clamp(20px,3vw,28px)] font-extrabold text-[#e5f2ea] leading-none mb-1">{s.value}</div>
              <div className="text-[11px] text-[#344d3f]">{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
