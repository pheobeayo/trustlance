'use client'
import { Ghost, Flame, TrendingDown, Building2 } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useReveal } from '@/hooks/useParallax'
import { PROBLEMS } from './data'

const ICONS = [Ghost, Flame, TrendingDown, Building2]

export function ProblemSection() {
  const ref = useReveal()
  return (
    <section className="relative overflow-hidden px-5 md:px-10 py-20 md:py-28 max-w-6xl mx-auto">
      <div className="opacity-0 translate-y-6 transition-all duration-700" ref={ref as any}>
        <p className="flex items-center gap-3 text-[10px] font-bold tracking-[2.5px] text-[#0d9e75] uppercase mb-4 before:block before:w-7 before:h-px before:bg-[#0d9e75] before:flex-shrink-0">
          The problem
        </p>
        <h2 className="text-[clamp(28px,4vw,50px)] font-extrabold leading-[1.1] tracking-tight text-[#e5f2ea] mb-4">
          Freelance platforms are broken<br className="hidden lg:block" /> for both sides.
        </h2>
        <p className="text-[clamp(14px,1.8vw,17px)] text-[#95b8a5] max-w-xl leading-relaxed font-light">
          Clients get ghosted by fake freelancers. Freelancers complete work and get stiffed.
          Web3 escrow exists, but sybil attacks make it a playground for bad actors.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-12">
        {PROBLEMS.map((p, i) => {
          const Icon = ICONS[i]
          return (
            <Card key={i}
              className="opacity-0 translate-y-6 transition-all duration-700 bg-[#0f1a14] border-[#1e2f24] hover:border-[#294038] rounded-2xl overflow-hidden group relative"
              style={{ transitionDelay: `${i * 80}ms` }}
              ref={ref as any}
            >
              <div className="absolute top-3 right-4 font-extrabold text-[68px] leading-none text-[#1e2f24]/60 pointer-events-none select-none">{p.num}</div>
              <CardContent className="p-7 relative z-10">
                <div className="size-11 rounded-xl bg-[#152019] border border-[#294038] flex items-center justify-center mb-5">
                  <Icon className="size-5 text-[#567a68] group-hover:text-[#0d9e75] transition-colors" />
                </div>
                <h3 className="text-[clamp(15px,1.8vw,18px)] font-bold text-[#e5f2ea] mb-2">{p.title}</h3>
                <p className="text-[13px] text-[#95b8a5] leading-relaxed mb-4">{p.body}</p>
                <Badge variant="outline" className="text-[11px] text-red-400 border-red-900/40 bg-red-950/20 rounded">{p.tag}</Badge>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </section>
  )
}
