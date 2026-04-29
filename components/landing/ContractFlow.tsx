'use client'
import { Lock, Hand, Package, Zap, Timer } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { SlidingLineGrid } from '@/components/ui-custom/SlidingGrid'
import { useReveal } from '@/hooks/useParallax'
import { FLOW } from './data'

const ICONS = [Lock, Hand, Package, Zap, Timer]

export function ContractFlow() {
  const ref = useReveal()
  return (
    <div className="relative overflow-hidden bg-[#0b1310] border-y border-[#1e2f24]">
      <SlidingLineGrid speed={0.12} />
      <div className="relative z-10 max-w-4xl mx-auto px-5 md:px-10 py-20 md:py-28">
        <div className="opacity-0 translate-y-6 transition-all duration-700" ref={ref as any}>
          <p className="flex items-center gap-3 text-[10px] font-bold tracking-[2.5px] text-[#0d9e75] uppercase mb-4 before:block before:w-7 before:h-px before:bg-[#0d9e75] before:flex-shrink-0">Contract flow</p>
          <h2 className="text-[clamp(28px,4vw,50px)] font-extrabold leading-[1.1] tracking-tight text-[#e5f2ea]">
            Five functions.<br />~100 lines of Solidity.
          </h2>
        </div>
        <div className="relative mt-12">
          <div className="absolute left-5 top-0 bottom-0 w-px bg-gradient-to-b from-[#1e2f24] via-[#0d9e75] to-[#1e2f24] hidden sm:block" />
          <div className="flex flex-col">
            {FLOW.map((f, i) => {
              const Icon = ICONS[i]
              return (
                <div key={i} className="opacity-0 translate-y-6 transition-all duration-700" style={{ transitionDelay: `${i * 70}ms` }} ref={ref as any}>
                  <div className="flex gap-5 items-start py-6 group">
                    <div className="size-11 rounded-full bg-[#0f1a14] border border-[#294038] flex items-center justify-center flex-shrink-0 z-10 group-hover:bg-[#0d9e75]/10 group-hover:border-[#0d9e75] transition-all duration-200">
                      <Icon className="size-4 text-[#567a68] group-hover:text-[#14c490] transition-colors" />
                    </div>
                    <div className="flex-1 min-w-0 pt-1.5">
                      <div className="font-mono text-[clamp(11px,1.4vw,14px)] font-bold text-[#e5f2ea] mb-1.5 break-all">{f.title}</div>
                      <p className="text-[13px] text-[#95b8a5] leading-relaxed mb-2 max-w-lg">{f.body}</p>
                      <Badge variant="outline" className="text-[10px] text-[#14c490] border-[#1e2f24] bg-[#152019] font-mono rounded">{f.tag}</Badge>
                    </div>
                    <div className="text-[11px] text-[#344d3f] font-mono flex-shrink-0 pt-2 hidden md:block">{i + 1} of 5</div>
                  </div>
                  {i < FLOW.length - 1 && <Separator className="bg-[#162118] ml-0 sm:ml-16" />}
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
