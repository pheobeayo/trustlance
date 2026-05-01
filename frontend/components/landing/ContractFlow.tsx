'use client'

import { Lock, Hand, Package, Zap, Timer } from 'lucide-react'
import { SlidingLineGrid } from '@/components/ui-custom/SlidingGrid'
import { useReveal } from '@/hooks/useParallax'
import { FLOW } from './data'

const ICONS = [Lock, Hand, Package, Zap, Timer]

export function ContractFlow() {
  const ref = useReveal()
  return (
    <div className="relative overflow-hidden transition-colors duration-300" style={{ backgroundColor: 'var(--bg-surface)', borderTop: '1px solid var(--border-base)', borderBottom: '1px solid var(--border-base)' }}>
      <SlidingLineGrid speed={0.12} />
      <div className="relative z-10 max-w-4xl mx-auto px-5 md:px-10 py-20 md:py-28">
        <div className="opacity-0 translate-y-6 transition-all duration-700" ref={ref as any}>
          <p className="flex items-center gap-3 text-[10px] font-bold tracking-[2.5px] uppercase mb-4" style={{ color: 'var(--teal)' }}>
            <span className="block w-7 h-px flex-shrink-0" style={{ backgroundColor: 'var(--teal)' }} />Contract flow
          </p>
          <h2 className="text-[clamp(28px,4vw,50px)] font-extrabold leading-[1.1] tracking-tight transition-colors" style={{ color: 'var(--text-primary)' }}>
            Five functions.<br />~100 lines of Solidity.
          </h2>
        </div>
        <div className="relative mt-12">
          <div className="absolute left-5 top-0 bottom-0 w-px hidden sm:block" style={{ background: `linear-gradient(var(--border-base), var(--teal), var(--border-base))` }} />
          <div className="flex flex-col">
            {FLOW.map((f, i) => {
              const Icon = ICONS[i]
              return (
                <div key={i} className="opacity-0 translate-y-6 transition-all duration-700" style={{ transitionDelay: `${i * 70}ms` }} ref={ref as any}>
                  <div className="flex gap-5 items-start py-6 group">
                    <div className="size-11 rounded-full flex items-center justify-center flex-shrink-0 z-10 transition-all duration-200"
                      style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-strong)' }}
                      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(13,158,117,0.1)'; (e.currentTarget as HTMLElement).style.borderColor = 'var(--teal)' }}
                      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'var(--bg-card)'; (e.currentTarget as HTMLElement).style.borderColor = 'var(--border-strong)' }}>
                      <Icon className="size-4 transition-colors" style={{ color: 'var(--text-muted)' }} />
                    </div>
                    <div className="flex-1 min-w-0 pt-1.5">
                      <div className="font-mono text-[clamp(11px,1.4vw,14px)] font-bold mb-1.5 break-all transition-colors" style={{ color: 'var(--text-primary)' }}>{f.title}</div>
                      <p className="text-[13px] leading-relaxed mb-2 max-w-lg transition-colors" style={{ color: 'var(--text-secondary)' }}>{f.body}</p>
                      <span className="inline-flex items-center text-[10px] font-mono rounded px-2.5 py-1 transition-colors" style={{ color: 'var(--teal-hi)', backgroundColor: 'var(--bg-input)', border: '1px solid var(--border-base)' }}>{f.tag}</span>
                    </div>
                    <div className="text-[11px] font-mono flex-shrink-0 pt-2 hidden md:block transition-colors" style={{ color: 'var(--text-faint)' }}>{i + 1} of 5</div>
                  </div>
                  {i < FLOW.length - 1 && <div className="ml-0 sm:ml-16 h-px transition-colors" style={{ backgroundColor: 'var(--border-subtle)' }} />}
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
