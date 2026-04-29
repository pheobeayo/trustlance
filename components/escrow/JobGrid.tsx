'use client'
import Link from 'next/link'
import { ShieldCheck } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { MOCK_JOBS, formatUSDC, shortAddress } from '@/lib/mockData'
import { cn } from '@/lib/utils'

const STATUS_MAP: Record<string, { label: string; cls: string }> = {
  Open:       { label: 'Open',        cls: 'text-[#14c490] bg-[#0d9e75]/10 border-[#0d9e75]/40' },
  InProgress: { label: 'In Progress', cls: 'text-blue-400 bg-blue-950/30 border-blue-800/40'    },
  Delivered:  { label: 'In Review',   cls: 'text-amber-400 bg-amber-950/30 border-amber-800/40' },
  Completed:  { label: 'Completed',   cls: 'text-green-400 bg-green-950/30 border-green-800/40' },
}

export function JobGrid() {
  return (
    <section className="px-5 md:px-10 py-7 pb-20 max-w-6xl mx-auto w-full">
      <div className="flex justify-between items-baseline mb-5">
        <h2 className="text-[17px] font-bold text-[#e5f2ea]">Open Positions</h2>
        <span className="text-[12px] text-[#344d3f]">{MOCK_JOBS.length} available</span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {MOCK_JOBS.map((job, i) => {
          const st = STATUS_MAP[job.status] ?? STATUS_MAP.Open
          return (
            <Link key={job.id} href={`/jobs/${job.id}`} className="block group">
              <Card
                className="h-full bg-[#0f1a14] border-[#1e2f24] hover:border-[#0a7a5a] rounded-2xl relative overflow-hidden transition-all duration-200 hover:-translate-y-0.5 animate-in fade-in slide-in-from-bottom-3 duration-500"
                style={{ animationDelay: `${i * 60}ms` }}
              >
                <div className="absolute top-0 left-0 right-0 h-0.5 bg-transparent group-hover:bg-[#0d9e75] transition-all duration-200" />
                <CardContent className="p-5 flex flex-col h-full">
                  <div className="flex justify-between items-start mb-3">
                    <Badge className="text-[10px] font-bold tracking-wider uppercase text-[#0d9e75] bg-[#0d9e75]/10 border border-[#0d9e75]/20 rounded px-2 py-0.5">{job.category}</Badge>
                    <div className="text-right">
                      <div className="text-[18px] font-extrabold text-[#e5f2ea] leading-none">${formatUSDC(job.amountUSDC)}</div>
                      <div className="text-[11px] text-[#344d3f] mt-0.5">USDC</div>
                    </div>
                  </div>
                  <h3 className="text-[14px] font-bold text-[#e5f2ea] leading-snug mb-2">{job.title}</h3>
                  <p className="text-[12px] text-[#95b8a5] leading-relaxed mb-3 line-clamp-3 flex-1">{job.description}</p>
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {job.skills?.slice(0, 3).map(s => (
                      <span key={s} className="text-[10px] px-2 py-0.5 rounded bg-[#152019] border border-[#1e2f24] text-[#567a68]">{s}</span>
                    ))}
                  </div>
                  <div className="flex items-center justify-between pt-3 border-t border-[#162118]">
                    <div className="flex items-center gap-2">
                      <Avatar className="size-7 border border-[#294038]">
                        <AvatarFallback className="bg-[#152019] text-[#14c490] text-[10px] font-bold">{job.client.slice(2, 4).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="text-[11px] text-[#95b8a5] font-medium font-mono leading-none">{shortAddress(job.client)}</div>
                        <div className="text-[9px] text-[#0d9e75] flex items-center gap-0.5 mt-0.5"><ShieldCheck className="size-2.5" /> World ID</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant="outline" className={cn('text-[10px] rounded-full px-2 py-0.5 border', st.cls)}>{st.label}</Badge>
                      <div className="text-[10px] text-[#344d3f] mt-1">{job.deadline ? new Date(job.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '—'}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          )
        })}
      </div>
    </section>
  )
}
