'use client'

import { Quote } from 'lucide-react'
import { useReveal } from '@/hooks/useParallax'
import { QUOTES } from './data'

export function QuotesSection() {
  const ref = useReveal()
  return (
    <section className="px-5 md:px-10 py-20 md:py-28 max-w-6xl mx-auto">
      <div className="opacity-0 translate-y-6 transition-all duration-700" ref={ref as any}>
        <p className="flex items-center gap-3 text-[10px] font-bold tracking-[2.5px] uppercase mb-4" style={{ color: 'var(--teal)' }}>
          <span className="block w-7 h-px flex-shrink-0" style={{ backgroundColor: 'var(--teal)' }} />From the community
        </p>
        <h2 className="text-[clamp(28px,4vw,50px)] font-extrabold leading-[1.1] tracking-tight transition-colors" style={{ color: 'var(--text-primary)' }}>
          Real freelancers.<br />Real problems solved.
        </h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-12">
        {QUOTES.map((q, i) => (
          <div key={i}
            className="opacity-0 translate-y-6 transition-all duration-700 rounded-2xl p-7"
            style={{ transitionDelay: `${i * 80}ms`, backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-base)' }}
            ref={ref as any}
            onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--border-strong)')}
            onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border-base)')}>
            <Quote className="size-8 mb-4" style={{ color: 'var(--teal-lo)' }} />
            <p className="text-[14px] leading-relaxed italic mb-6 transition-colors" style={{ color: 'var(--text-secondary)' }}>{q.q}</p>
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 transition-colors" style={{ backgroundColor: 'var(--bg-input)', border: '1px solid var(--border-strong)', color: 'var(--teal-hi)' }}>{q.av}</div>
              <div>
                <div className="text-[13px] font-semibold transition-colors" style={{ color: 'var(--text-primary)' }}>{q.name}</div>
                <div className="text-[11px] transition-colors" style={{ color: 'var(--text-faint)' }}>{q.role}</div>
                <div className="text-[10px] mt-0.5" style={{ color: 'var(--teal)' }}>✓ World ID Verified</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
