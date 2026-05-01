'use client'

import { Ghost, Flame, TrendingDown, Building2 } from 'lucide-react'
import { useReveal } from '@/hooks/useParallax'
import { PROBLEMS } from './data'

const ICONS = [Ghost, Flame, TrendingDown, Building2]

export function ProblemSection() {
  const ref = useReveal()
  return (
    <section className="px-5 md:px-10 py-20 md:py-28 max-w-6xl mx-auto">
      <div className="opacity-0 translate-y-6 transition-all duration-700" ref={ref as any}>
        <p className="flex items-center gap-3 text-[10px] font-bold tracking-[2.5px] uppercase mb-4 before:block before:w-7 before:h-px before:flex-shrink-0"
          style={{ color: 'var(--teal)', ['--tw-before-bg' as any]: 'var(--teal)' }}>
          <span className="block w-7 h-px flex-shrink-0" style={{ backgroundColor: 'var(--teal)' }} />
          The problem
        </p>
        <h2 className="text-[clamp(28px,4vw,50px)] font-extrabold leading-[1.1] tracking-tight mb-4 transition-colors" style={{ color: 'var(--text-primary)' }}>
          Freelance platforms are broken<br className="hidden lg:block" /> for both sides.
        </h2>
        <p className="text-[clamp(14px,1.8vw,17px)] max-w-xl leading-relaxed font-light transition-colors" style={{ color: 'var(--text-secondary)' }}>
          Clients get ghosted by fake freelancers. Freelancers complete work and get stiffed. Web3 escrow exists, but sybil attacks make it a playground for bad actors.
        </p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-12">
        {PROBLEMS.map((p, i) => {
          const Icon = ICONS[i]
          return (
            <div key={i}
              className="opacity-0 translate-y-6 transition-all duration-700 rounded-2xl overflow-hidden group relative p-7"
              style={{ transitionDelay: `${i * 80}ms`, backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-base)' }}
              ref={ref as any}
              onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--border-strong)')}
              onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border-base)')}>
              <div className="absolute top-3 right-4 font-extrabold text-[68px] leading-none pointer-events-none select-none opacity-30"
                style={{ color: 'var(--border-strong)' }}>{p.num}</div>
              <div className="size-11 rounded-xl flex items-center justify-center mb-5 relative z-10"
                style={{ backgroundColor: 'var(--bg-input)', border: '1px solid var(--border-strong)' }}>
                <Icon className="size-5 transition-colors" style={{ color: 'var(--text-muted)' }} />
              </div>
              <h3 className="text-[clamp(15px,1.8vw,18px)] font-bold mb-2 relative z-10 transition-colors" style={{ color: 'var(--text-primary)' }}>{p.title}</h3>
              <p className="text-[13px] leading-relaxed mb-4 relative z-10 transition-colors" style={{ color: 'var(--text-secondary)' }}>{p.body}</p>
              <span className="text-[11px] font-semibold px-2.5 py-1 rounded" style={{ color: 'var(--destructive, #e06060)', background: 'rgba(220,50,50,0.08)', border: '1px solid rgba(220,50,50,0.2)' }}>{p.tag}</span>
            </div>
          )
        })}
      </div>
    </section>
  )
}
