'use client'

import { useReveal } from '@/hooks/useParallax'
import { SPONSORS } from './data'

export function SponsorsSection() {
  const ref = useReveal()
  return (
    <section className="px-5 md:px-10 py-20 md:py-28 max-w-6xl mx-auto">
      <div className="opacity-0 translate-y-6 transition-all duration-700" ref={ref as any}>
        <p className="flex items-center gap-3 text-[10px] font-bold tracking-[2.5px] uppercase mb-4" style={{ color: 'var(--teal)' }}>
          <span className="block w-7 h-px flex-shrink-0" style={{ backgroundColor: 'var(--teal)' }} />Technology
        </p>
        <h2 className="text-[clamp(28px,4vw,50px)] font-extrabold leading-[1.1] tracking-tight mb-4 transition-colors" style={{ color: 'var(--text-primary)' }}>
          Three primitives that didn&apos;t<br className="hidden lg:block" /> exist together — until now.
        </h2>
        <p className="text-[clamp(14px,1.8vw,17px)] max-w-xl leading-relaxed font-light transition-colors" style={{ color: 'var(--text-secondary)' }}>
          The smallest possible integration of three technologies that make trustless freelance work actually work.
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-12">
        {SPONSORS.map((s, i) => (
          <div key={i}
            className="opacity-0 translate-y-6 transition-all duration-700 rounded-2xl relative overflow-hidden group p-8"
            style={{ transitionDelay: `${i * 100}ms`, backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-base)' }}
            ref={ref as any}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--teal-lo)'; e.currentTarget.style.transform = 'translateY(-3px)' }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-base)'; e.currentTarget.style.transform = '' }}>
            <div className="absolute top-0 left-0 right-0 h-0.5 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" style={{ backgroundColor: 'var(--teal)' }} />
            <span className="inline-block px-2.5 py-1 rounded text-[11px] font-extrabold tracking-wider uppercase mb-5" style={{ color: 'var(--teal-hi)', background: 'rgba(13,158,117,0.1)', border: '1px solid rgba(13,158,117,0.3)' }}>{s.badge}</span>
            <div className="text-[56px] font-extrabold leading-none mb-4 tracking-tight transition-colors" style={{ color: 'var(--border-strong)' }}>{s.num}</div>
            <h3 className="text-[clamp(16px,2vw,20px)] font-bold mb-3 transition-colors" style={{ color: 'var(--text-primary)' }}>{s.title}</h3>
            <p className="text-[13px] leading-relaxed mb-5 transition-colors" style={{ color: 'var(--text-secondary)' }}>{s.body}</p>
            <pre className="text-[11px] font-mono rounded-xl p-4 whitespace-pre-wrap break-words transition-colors" style={{ color: 'var(--teal-hi)', backgroundColor: 'var(--bg-input)', border: '1px solid var(--border-base)' }}>{s.code}</pre>
          </div>
        ))}
      </div>
    </section>
  )
}
