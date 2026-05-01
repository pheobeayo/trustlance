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
    <section className="relative overflow-hidden px-5 md:px-10 pt-12 pb-10 transition-colors duration-300"
      style={{ backgroundColor: 'var(--bg-surface)', borderBottom: '1px solid var(--border-base)' }}>
      <SlidingLineGrid speed={0.15} />
      <div className="relative z-10 max-w-6xl">
        <p className="flex items-center gap-3 text-[10px] font-bold tracking-[2.5px] uppercase mb-4" style={{ color: 'var(--teal)' }}>
          <span className="block w-7 h-px flex-shrink-0" style={{ backgroundColor: 'var(--teal)' }} />Sybil-resistant escrow marketplace
        </p>
        <h1 className="text-[clamp(30px,5vw,52px)] font-extrabold leading-[1.05] tracking-tight max-w-xl mb-4 transition-colors" style={{ color: 'var(--text-primary)' }}>
          Freelance without <em className="not-italic" style={{ color: 'var(--teal-hi)' }}>the risk.</em>
        </h1>
        <p className="text-[clamp(13px,1.6vw,15px)] max-w-lg leading-relaxed font-light mb-8 transition-colors" style={{ color: 'var(--text-secondary)' }}>
          Every participant is World ID verified. Payments held in USDC escrow, released with SLA-guaranteed execution.
        </p>
        <div className="flex flex-wrap gap-3 mb-10">
          <Button asChild className="font-bold rounded-xl gap-2" style={{ backgroundColor: 'var(--teal)', color: '#fff' }}>
            <Link href="/jobs/post">Post a Job <ArrowRight className="size-4" /></Link>
          </Button>
          <Button variant="outline" className="rounded-xl" style={{ borderColor: 'var(--border-strong)', color: 'var(--text-secondary)' }}>
            How it works ↓
          </Button>
        </div>
        <div className="flex flex-wrap gap-8">
          {STATS.map((s, i) => (
            <div key={i}>
              <div className="text-[clamp(20px,3vw,28px)] font-extrabold leading-none mb-1 transition-colors" style={{ color: 'var(--text-primary)' }}>{s.value}</div>
              <div className="text-[11px] transition-colors" style={{ color: 'var(--text-faint)' }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
