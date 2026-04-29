'use client'
import { Quote } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { useReveal } from '@/hooks/useParallax'
import { QUOTES } from './data'

export function QuotesSection() {
  const ref = useReveal()
  return (
    <section className="px-5 md:px-10 py-20 md:py-28 max-w-6xl mx-auto">
      <div className="opacity-0 translate-y-6 transition-all duration-700" ref={ref as any}>
        <p className="flex items-center gap-3 text-[10px] font-bold tracking-[2.5px] text-[#0d9e75] uppercase mb-4 before:block before:w-7 before:h-px before:bg-[#0d9e75] before:flex-shrink-0">From the community</p>
        <h2 className="text-[clamp(28px,4vw,50px)] font-extrabold leading-[1.1] tracking-tight text-[#e5f2ea]">
          Real freelancers.<br />Real problems solved.
        </h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-12">
        {QUOTES.map((q, i) => (
          <Card key={i}
            className="opacity-0 translate-y-6 transition-all duration-700 bg-[#0f1a14] border-[#1e2f24] hover:border-[#294038] rounded-2xl"
            style={{ transitionDelay: `${i * 80}ms` }}
            ref={ref as any}
          >
            <CardContent className="p-7">
              <Quote className="size-8 text-[#0a7a5a] mb-4" />
              <p className="text-[14px] text-[#95b8a5] leading-relaxed italic mb-6">{q.q}</p>
              <div className="flex items-center gap-3">
                <Avatar className="size-10 border border-[#294038]">
                  <AvatarFallback className="bg-[#152019] text-[#14c490] text-xs font-bold">{q.av}</AvatarFallback>
                </Avatar>
                <div>
                  <div className="text-[13px] font-semibold text-[#e5f2ea]">{q.name}</div>
                  <div className="text-[11px] text-[#344d3f]">{q.role}</div>
                  <div className="text-[10px] text-[#0d9e75] mt-0.5">✓ World ID Verified</div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  )
}
