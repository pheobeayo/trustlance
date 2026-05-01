'use client'
import Link from 'next/link'
import { ShieldCheck } from 'lucide-react'
import { MOCK_JOBS, formatUSDC, shortAddress } from '@/lib/mockData'

const STATUS_MAP: Record<string, { label: string; color: string; bg: string; border: string }> = {
  Open:       { label: 'Open',        color: '#14c490', bg: 'rgba(13,158,117,0.1)',   border: 'rgba(13,158,117,0.4)'  },
  InProgress: { label: 'In Progress', color: '#6699ee', bg: 'rgba(56,114,235,0.1)',   border: 'rgba(56,114,235,0.35)' },
  Delivered:  { label: 'In Review',   color: '#c8921e', bg: 'rgba(186,117,23,0.1)',   border: 'rgba(186,117,23,0.35)' },
  Completed:  { label: 'Completed',   color: '#4acc80', bg: 'rgba(50,180,100,0.1)',   border: 'rgba(50,180,100,0.35)' },
}

export function JobGrid() {
  return (
    <section className="px-5 md:px-10 py-7 pb-20 max-w-6xl mx-auto w-full">
      <div className="flex justify-between items-baseline mb-5">
        <h2 className="text-[17px] font-bold transition-colors" style={{ color: 'var(--text-primary)' }}>Open Positions</h2>
        <span className="text-[12px] transition-colors" style={{ color: 'var(--text-faint)' }}>{MOCK_JOBS.length} available</span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {MOCK_JOBS.map((job, i) => {
          const st = STATUS_MAP[job.status] ?? STATUS_MAP.Open
          return (
            <Link key={job.id} href={`/jobs/${job.id}`} className="block group animate-in fade-in slide-in-from-bottom-3 duration-500" style={{ animationDelay: `${i * 60}ms` }}>
              <div className="h-full rounded-2xl relative overflow-hidden transition-all duration-200 flex flex-col p-5"
                style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-base)' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--teal-lo)'; (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)' }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--border-base)'; (e.currentTarget as HTMLElement).style.transform = '' }}>
                <div className="absolute top-0 left-0 right-0 h-0.5 opacity-0 group-hover:opacity-100 transition-opacity" style={{ backgroundColor: 'var(--teal)' }} />

                <div className="flex justify-between items-start mb-3">
                  <span className="text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded" style={{ color: 'var(--teal)', background: 'rgba(13,158,117,0.1)', border: '1px solid rgba(13,158,117,0.2)' }}>{job.category}</span>
                  <div className="text-right">
                    <div className="text-[18px] font-extrabold leading-none transition-colors" style={{ color: 'var(--text-primary)' }}>${formatUSDC(job.amountUSDC)}</div>
                    <div className="text-[11px] mt-0.5 transition-colors" style={{ color: 'var(--text-faint)' }}>USDC</div>
                  </div>
                </div>

                <h3 className="text-[14px] font-bold leading-snug mb-2 transition-colors" style={{ color: 'var(--text-primary)' }}>{job.title}</h3>
                <p className="text-[12px] leading-relaxed mb-3 line-clamp-3 flex-1 transition-colors" style={{ color: 'var(--text-secondary)' }}>{job.description}</p>

                <div className="flex flex-wrap gap-1.5 mb-4">
                  {job.skills?.slice(0, 3).map(s => (
                    <span key={s} className="text-[10px] px-2 py-0.5 rounded transition-colors" style={{ backgroundColor: 'var(--bg-input)', border: '1px solid var(--border-base)', color: 'var(--text-muted)' }}>{s}</span>
                  ))}
                </div>

                <div className="flex items-center justify-between pt-3" style={{ borderTop: '1px solid var(--border-subtle)' }}>
                  <div className="flex items-center gap-2">
                    <div className="size-7 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0" style={{ backgroundColor: 'var(--bg-input)', border: '1px solid var(--border-strong)', color: 'var(--teal-hi)' }}>
                      {job.client.slice(2, 4).toUpperCase()}
                    </div>
                    <div>
                      <div className="text-[11px] font-medium font-mono leading-none transition-colors" style={{ color: 'var(--text-secondary)' }}>{shortAddress(job.client)}</div>
                      <div className="text-[9px] flex items-center gap-0.5 mt-0.5" style={{ color: 'var(--teal)' }}><ShieldCheck className="size-2.5" /> World ID</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] rounded-full px-2 py-0.5 font-semibold" style={{ color: st.color, backgroundColor: st.bg, border: `1px solid ${st.border}` }}>{st.label}</span>
                    <div className="text-[10px] mt-1 transition-colors" style={{ color: 'var(--text-faint)' }}>{job.deadline ? new Date(job.deadline).toLocaleDateString('en-US',{month:'short',day:'numeric'}) : '—'}</div>
                  </div>
                </div>
              </div>
            </Link>
          )
        })}
      </div>
    </section>
  )
}
