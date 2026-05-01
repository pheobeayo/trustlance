'use client'

import { ScanFace, ArrowLeftRight, Handshake, CheckCircle2, Clock3 } from 'lucide-react'
import { useReveal } from '@/hooks/useParallax'
import { SlidingLineGrid } from '@/components/ui-custom/SlidingGrid'
import { HOW_STEPS } from './data'

const ICONS = [ScanFace, ArrowLeftRight, Handshake, CheckCircle2, Clock3]

export function HowItWorks() {
  const ref = useReveal()
  return (
    <div className="relative overflow-hidden transition-colors duration-300" style={{ backgroundColor: 'var(--bg-surface)', borderTop: '1px solid var(--border-base)', borderBottom: '1px solid var(--border-base)' }}>
      <SlidingLineGrid speed={0.15} />
      <div className="relative z-10 px-5 md:px-10 py-20 md:py-28 max-w-6xl mx-auto">
        <div className="opacity-0 translate-y-6 transition-all duration-700" ref={ref as any}>
          <p className="flex items-center gap-3 text-[10px] font-bold tracking-[2.5px] uppercase mb-4" style={{ color: 'var(--teal)' }}>
            <span className="block w-7 h-px flex-shrink-0" style={{ backgroundColor: 'var(--teal)' }} />How it works
          </p>
          <h2 className="text-[clamp(28px,4vw,50px)] font-extrabold leading-[1.1] tracking-tight mb-4 transition-colors" style={{ color: 'var(--text-primary)' }}>Five steps. No middlemen.</h2>
          <p className="text-[clamp(14px,1.8vw,17px)] max-w-xl leading-relaxed font-light transition-colors" style={{ color: 'var(--text-secondary)' }}>Every action is on-chain. Both parties verify once, then transact with full trust.</p>
        </div>
        {/* Desktop */}
        <div className="hidden lg:grid grid-cols-5 mt-16 relative">
          <div className="absolute top-[22px] left-[10%] right-[10%] h-px pointer-events-none" style={{ background: `linear-gradient(90deg, transparent, var(--teal-lo), var(--teal), var(--teal-lo), transparent)` }} />
          {HOW_STEPS.map((s, i) => {
            const Icon = ICONS[i]
            return (
              <div key={i} className="opacity-0 translate-y-6 transition-all duration-700 flex flex-col items-center text-center px-4 z-10 group" style={{ transitionDelay: `${i * 80}ms` }} ref={ref as any}>
                <div className="size-11 rounded-full flex items-center justify-center mb-5 transition-all duration-300"
                  style={{ backgroundColor: 'var(--bg-card)', border: '2px solid var(--border-strong)' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(13,158,117,0.1)'; (e.currentTarget as HTMLElement).style.borderColor = 'var(--teal)' }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'var(--bg-card)'; (e.currentTarget as HTMLElement).style.borderColor = 'var(--border-strong)' }}>
                  <Icon className="size-4 transition-colors" style={{ color: 'var(--text-muted)' }} />
                </div>
                <div className="text-[9px] font-bold tracking-[1.5px] uppercase mb-1.5" style={{ color: 'var(--teal)' }}>{s.tag}</div>
                <div className="text-[14px] font-bold mb-2 transition-colors" style={{ color: 'var(--text-primary)' }}>{s.title}</div>
                <p className="text-[12px] leading-relaxed transition-colors" style={{ color: 'var(--text-muted)' }}>{s.body}</p>
              </div>
            )
          })}
        </div>
        {/* Mobile */}
        <div className="lg:hidden grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 mt-10">
          {HOW_STEPS.map((s, i) => {
            const Icon = ICONS[i]
            return (
              <div key={i} className="opacity-0 translate-y-6 transition-all duration-700 rounded-xl p-5 flex gap-4 items-start"
                style={{ transitionDelay: `${i * 60}ms`, backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-base)' }} ref={ref as any}>
                <div className="size-10 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(13,158,117,0.1)', border: '1px solid rgba(13,158,117,0.3)' }}>
                  <Icon className="size-4" style={{ color: 'var(--teal-hi)' }} />
                </div>
                <div>
                  <div className="text-[9px] font-bold tracking-[1.5px] uppercase mb-1" style={{ color: 'var(--teal)' }}>{s.tag}</div>
                  <div className="text-[13px] font-bold mb-1 transition-colors" style={{ color: 'var(--text-primary)' }}>{s.title}</div>
                  <p className="text-[11px] leading-relaxed transition-colors" style={{ color: 'var(--text-muted)' }}>{s.body}</p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
