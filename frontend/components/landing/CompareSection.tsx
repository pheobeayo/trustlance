'use client'

import { Check } from 'lucide-react'
import { SlidingLineGrid } from '@/components/ui-custom/SlidingGrid'
import { useReveal } from '@/hooks/useParallax'
import { COMPARE_ROWS } from './data'

export function CompareSection() {
  const ref = useReveal()
  return (
    <div className="relative overflow-hidden transition-colors duration-300" style={{ backgroundColor: 'var(--bg-surface)', borderTop: '1px solid var(--border-base)', borderBottom: '1px solid var(--border-base)' }}>
      <SlidingLineGrid speed={0.1} />
      <div className="relative z-10 px-5 md:px-10 py-20 md:py-28 max-w-6xl mx-auto">
        <div className="opacity-0 translate-y-6 transition-all duration-700" ref={ref as any}>
          <p className="flex items-center gap-3 text-[10px] font-bold tracking-[2.5px] uppercase mb-4" style={{ color: 'var(--teal)' }}>
            <span className="block w-7 h-px flex-shrink-0" style={{ backgroundColor: 'var(--teal)' }} />Why TrustLance
          </p>
          <h2 className="text-[clamp(28px,4vw,50px)] font-extrabold leading-[1.1] tracking-tight transition-colors" style={{ color: 'var(--text-primary)' }}>
            Everything traditional platforms<br className="hidden lg:block" /> couldn&apos;t be.
          </h2>
        </div>
        <div className="opacity-0 translate-y-6 transition-all duration-700 mt-12 rounded-2xl overflow-hidden overflow-x-auto" ref={ref as any} style={{ transitionDelay: '100ms', border: '1px solid var(--border-base)' }}>
          <table className="w-full min-w-[560px]">
            <thead>
              <tr style={{ backgroundColor: 'var(--bg-input)' }}>
                <th className="text-left px-5 py-4 text-[11px] font-bold uppercase tracking-wider w-[35%] transition-colors" style={{ color: 'var(--text-muted)' }}>Feature</th>
                <th className="text-left px-5 py-4 text-[11px] font-bold uppercase tracking-wider" style={{ color: 'var(--teal-hi)', backgroundColor: 'rgba(13,158,117,0.08)', borderBottom: '2px solid var(--teal)' }}>TrustLance</th>
                <th className="text-left px-5 py-4 text-[11px] font-bold uppercase tracking-wider transition-colors" style={{ color: 'var(--text-muted)' }}>Upwork / Fiverr</th>
                <th className="text-left px-5 py-4 text-[11px] font-bold uppercase tracking-wider transition-colors hidden sm:table-cell" style={{ color: 'var(--text-muted)' }}>Generic Escrow</th>
              </tr>
            </thead>
            <tbody>
              {COMPARE_ROWS.map((r, i) => (
                <tr key={i} className="transition-colors" style={{ borderTop: '1px solid var(--border-base)' }}
                  onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--bg-card)')}
                  onMouseLeave={e => (e.currentTarget.style.backgroundColor = '')}>
                  <td className="px-5 py-3.5 text-[13px] transition-colors" style={{ color: 'var(--text-primary)' }}>{r.f}</td>
                  <td className="px-5 py-3.5 text-[13px] font-semibold" style={{ color: 'var(--teal-hi)', backgroundColor: 'rgba(13,158,117,0.04)' }}>
                    <span className="flex items-center gap-1.5"><Check className="size-3.5 flex-shrink-0" style={{ color: 'var(--teal-hi)' }} />{r.tl}</span>
                  </td>
                  <td className="px-5 py-3.5 text-[13px] transition-colors" style={{ color: 'var(--text-faint)' }}>{r.up}</td>
                  <td className="px-5 py-3.5 text-[13px] transition-colors hidden sm:table-cell" style={{ color: 'var(--text-faint)' }}>{r.ce}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
