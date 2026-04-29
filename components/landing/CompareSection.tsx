'use client'
import { Check } from 'lucide-react'
import { SlidingLineGrid } from '@/components/ui-custom/SlidingGrid'
import { useReveal } from '@/hooks/useParallax'
import { COMPARE_ROWS } from './data'

export function CompareSection() {
  const ref = useReveal()
  return (
    <div className="relative overflow-hidden bg-[#0b1310] border-y border-[#1e2f24]">
      <SlidingLineGrid speed={0.1} />
      <div className="relative z-10 px-5 md:px-10 py-20 md:py-28 max-w-6xl mx-auto">
        <div className="opacity-0 translate-y-6 transition-all duration-700" ref={ref as any}>
          <p className="flex items-center gap-3 text-[10px] font-bold tracking-[2.5px] text-[#0d9e75] uppercase mb-4 before:block before:w-7 before:h-px before:bg-[#0d9e75] before:flex-shrink-0">Why TrustLance</p>
          <h2 className="text-[clamp(28px,4vw,50px)] font-extrabold leading-[1.1] tracking-tight text-[#e5f2ea]">
            Everything traditional platforms<br className="hidden lg:block" /> couldn&apos;t be.
          </h2>
        </div>
        <div className="opacity-0 translate-y-6 transition-all duration-700 mt-12 rounded-2xl border border-[#1e2f24] overflow-hidden overflow-x-auto" ref={ref as any} style={{ transitionDelay: '100ms' }}>
          <table className="w-full min-w-[560px]">
            <thead>
              <tr className="bg-[#152019]">
                <th className="text-left px-5 py-4 text-[11px] font-bold text-[#567a68] uppercase tracking-wider w-[35%]">Feature</th>
                <th className="text-left px-5 py-4 text-[11px] font-bold text-[#14c490] uppercase tracking-wider bg-[#0d9e75]/10 border-b-2 border-[#0d9e75]">TrustLance</th>
                <th className="text-left px-5 py-4 text-[11px] font-bold text-[#567a68] uppercase tracking-wider">Upwork / Fiverr</th>
                <th className="text-left px-5 py-4 text-[11px] font-bold text-[#567a68] uppercase tracking-wider hidden sm:table-cell">Generic Escrow</th>
              </tr>
            </thead>
            <tbody>
              {COMPARE_ROWS.map((r, i) => (
                <tr key={i} className="border-t border-[#1e2f24] hover:bg-[#0f1a14] transition-colors">
                  <td className="px-5 py-3.5 text-[13px] text-[#e5f2ea]">{r.f}</td>
                  <td className="px-5 py-3.5 text-[13px] font-semibold text-[#14c490] bg-[#0d9e75]/5">
                    <span className="flex items-center gap-1.5"><Check className="size-3.5 flex-shrink-0" />{r.tl}</span>
                  </td>
                  <td className="px-5 py-3.5 text-[13px] text-[#344d3f]">{r.up}</td>
                  <td className="px-5 py-3.5 text-[13px] text-[#344d3f] hidden sm:table-cell">{r.ce}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
