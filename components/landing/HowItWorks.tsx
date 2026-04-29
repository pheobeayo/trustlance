'use client'
import { ScanFace, ArrowLeftRight, Handshake, CheckCircle2, Clock3 } from 'lucide-react'
import { useReveal } from '@/hooks/useParallax'
import { SlidingLineGrid } from '@/components/ui-custom/SlidingGrid'
import { HOW_STEPS } from './data'

const ICONS = [ScanFace, ArrowLeftRight, Handshake, CheckCircle2, Clock3]

export function HowItWorks() {
  const ref = useReveal()
  return (
    <div className="relative overflow-hidden bg-[#0b1310] border-y border-[#1e2f24]">
      <SlidingLineGrid speed={0.15} />
      <div className="relative z-10 px-5 md:px-10 py-20 md:py-28 max-w-6xl mx-auto">
        <div className="opacity-0 translate-y-6 transition-all duration-700" ref={ref as any}>
          <p className="flex items-center gap-3 text-[10px] font-bold tracking-[2.5px] text-[#0d9e75] uppercase mb-4 before:block before:w-7 before:h-px before:bg-[#0d9e75] before:flex-shrink-0">
            How it works
          </p>
          <h2 className="text-[clamp(28px,4vw,50px)] font-extrabold leading-[1.1] tracking-tight text-[#e5f2ea] mb-4">Five steps. No middlemen.</h2>
          <p className="text-[clamp(14px,1.8vw,17px)] text-[#95b8a5] max-w-xl leading-relaxed font-light">Every action is on-chain. Both parties verify once, then transact with full trust.</p>
        </div>

        {/* Desktop horizontal */}
        <div className="hidden lg:grid grid-cols-5 mt-16 relative">
          <div className="absolute top-[22px] left-[10%] right-[10%] h-px bg-gradient-to-r from-transparent via-[#0d9e75] to-transparent pointer-events-none" />
          {HOW_STEPS.map((s, i) => {
            const Icon = ICONS[i]
            return (
              <div key={i}
                className="opacity-0 translate-y-6 transition-all duration-700 flex flex-col items-center text-center px-4 z-10 group"
                style={{ transitionDelay: `${i * 80}ms` }}
                ref={ref as any}
              >
                <div className="size-11 rounded-full bg-[#0f1a14] border-2 border-[#294038] flex items-center justify-center mb-5 group-hover:bg-[#0d9e75]/10 group-hover:border-[#0d9e75] transition-all duration-300">
                  <Icon className="size-4 text-[#567a68] group-hover:text-[#14c490] transition-colors" />
                </div>
                <div className="text-[9px] font-bold tracking-[1.5px] uppercase text-[#0d9e75] mb-1.5">{s.tag}</div>
                <div className="text-[14px] font-bold text-[#e5f2ea] mb-2">{s.title}</div>
                <p className="text-[12px] text-[#567a68] leading-relaxed">{s.body}</p>
              </div>
            )
          })}
        </div>

        {/* Mobile/tablet cards */}
        <div className="lg:hidden grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 mt-10">
          {HOW_STEPS.map((s, i) => {
            const Icon = ICONS[i]
            return (
              <div key={i}
                className="opacity-0 translate-y-6 transition-all duration-700 bg-[#0f1a14] border border-[#1e2f24] rounded-xl p-5 flex gap-4 items-start"
                style={{ transitionDelay: `${i * 60}ms` }}
                ref={ref as any}
              >
                <div className="size-10 rounded-full bg-[#0d9e75]/10 border border-[#0d9e75]/30 flex items-center justify-center flex-shrink-0">
                  <Icon className="size-4 text-[#14c490]" />
                </div>
                <div>
                  <div className="text-[9px] font-bold tracking-[1.5px] uppercase text-[#0d9e75] mb-1">{s.tag}</div>
                  <div className="text-[13px] font-bold text-[#e5f2ea] mb-1">{s.title}</div>
                  <p className="text-[11px] text-[#567a68] leading-relaxed">{s.body}</p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
