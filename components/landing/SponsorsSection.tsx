'use client'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useReveal } from '@/hooks/useParallax'
import { SPONSORS } from './data'

export function SponsorsSection() {
  const ref = useReveal()
  return (
    <section className="px-5 md:px-10 py-20 md:py-28 max-w-6xl mx-auto">
      <div className="opacity-0 translate-y-6 transition-all duration-700" ref={ref as any}>
        <p className="flex items-center gap-3 text-[10px] font-bold tracking-[2.5px] text-[#0d9e75] uppercase mb-4 before:block before:w-7 before:h-px before:bg-[#0d9e75] before:flex-shrink-0">Technology</p>
        <h2 className="text-[clamp(28px,4vw,50px)] font-extrabold leading-[1.1] tracking-tight text-[#e5f2ea] mb-4">
          Three primitives that didn&apos;t<br className="hidden lg:block" /> exist together — until now.
        </h2>
        <p className="text-[clamp(14px,1.8vw,17px)] text-[#95b8a5] max-w-xl leading-relaxed font-light">
          The smallest possible integration of three technologies that make trustless freelance work actually work.
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-12">
        {SPONSORS.map((s, i) => (
          <Card key={i}
            className="opacity-0 translate-y-6 transition-all duration-700 bg-[#0f1a14] border-[#1e2f24] hover:border-[#0a7a5a] rounded-2xl group relative overflow-hidden"
            style={{ transitionDelay: `${i * 100}ms` }}
            ref={ref as any}
          >
            <div className="absolute top-0 left-0 right-0 h-0.5 bg-[#0d9e75] scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
            <CardContent className="p-8">
              <Badge className="bg-[#0d9e75]/10 text-[#14c490] border border-[#0d9e75]/30 rounded text-[11px] font-extrabold tracking-wider uppercase mb-5">{s.badge}</Badge>
              <div className="text-[56px] font-extrabold text-[#294038] leading-none mb-4 tracking-tight">{s.num}</div>
              <h3 className="text-[clamp(16px,2vw,20px)] font-bold text-[#e5f2ea] mb-3">{s.title}</h3>
              <p className="text-[13px] text-[#95b8a5] leading-relaxed mb-5">{s.body}</p>
              <pre className="text-[11px] text-[#14c490] font-mono bg-[#152019] border border-[#1e2f24] rounded-xl p-4 whitespace-pre-wrap break-words">{s.code}</pre>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  )
}
