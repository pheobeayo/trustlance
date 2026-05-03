'use client'
import Link from 'next/link'
import { ShieldCheck } from 'lucide-react'
import { useNextJobId, useJobs } from '@/hooks/escrow'
import { JOB_STATUS_LABEL } from '@/lib/contracts'

const STATUS_STYLE: Record<number, { color: string; bg: string; border: string }> = {
  0: { color: '#14c490', bg: 'rgba(13,158,117,0.1)',  border: 'rgba(13,158,117,0.4)'  },
  1: { color: '#6699ee', bg: 'rgba(56,114,235,0.1)',  border: 'rgba(56,114,235,0.35)' },
  2: { color: '#c8921e', bg: 'rgba(186,117,23,0.1)',  border: 'rgba(186,117,23,0.35)' },
  3: { color: '#9b72cf', bg: 'rgba(155,114,207,0.1)', border: 'rgba(155,114,207,0.35)' },
  4: { color: '#4acc80', bg: 'rgba(50,180,100,0.1)',  border: 'rgba(50,180,100,0.35)' },
  5: { color: '#567a68', bg: 'rgba(86,122,104,0.1)',  border: 'rgba(86,122,104,0.35)' },
  6: { color: '#e06060', bg: 'rgba(224,96,96,0.1)',   border: 'rgba(224,96,96,0.35)'  },
}

function fmtUSDC(raw: bigint) {
  return (Number(raw) / 1e6).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}
function shortAddr(a: string) {
  return `${a.slice(0, 6)}…${a.slice(-4)}`
}

export function JobGrid() {
  const { nextJobId, isLoading: idLoading } = useNextJobId()
  const { jobs, isLoading }                 = useJobs(nextJobId, 30)

  if (isLoading || idLoading) return (
    <div className="flex items-center justify-center py-24">
      <div className="flex flex-col items-center gap-3">
        <div className="size-8 rounded-full border-2 border-[var(--teal)] border-t-transparent animate-spin" />
        <p className="text-[13px]" style={{ color: 'var(--text-faint)' }}>Loading jobs from 0G chain…</p>
      </div>
    </div>
  )

  if (!jobs.length) return (
    <div className="flex flex-col items-center justify-center py-24 gap-4">
      <p className="text-[17px] font-bold" style={{ color: 'var(--text-primary)' }}>No jobs yet</p>
      <p className="text-[13px]" style={{ color: 'var(--text-faint)' }}>Be the first to post one.</p>
      <Link href="/jobs/post" className="text-[13px] font-semibold px-4 py-2 rounded-xl text-white"
        style={{ backgroundColor: 'var(--teal)' }}>
        Post a Job
      </Link>
    </div>
  )

  return (
    <section className="px-5 md:px-10 py-7 pb-20 max-w-6xl mx-auto w-full">
      <div className="flex justify-between items-baseline mb-5">
        <h2 className="text-[17px] font-bold transition-colors" style={{ color: 'var(--text-primary)' }}>
          Live Jobs
        </h2>
        <span className="text-[12px] transition-colors" style={{ color: 'var(--text-faint)' }}>
          {jobs.length} jobs on-chain
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {jobs.map((job, i) => {
          const st = STATUS_STYLE[job.status] ?? STATUS_STYLE[0]
          return (
            <Link key={job.id.toString()} href={`/jobs/${job.id}`} className="block group">
              <div className="h-full rounded-2xl relative overflow-hidden transition-all duration-200 flex flex-col p-5"
                style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-base)' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--teal-lo)'; (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)' }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--border-base)'; (e.currentTarget as HTMLElement).style.transform = '' }}>

                <div className="absolute top-0 left-0 right-0 h-0.5 opacity-0 group-hover:opacity-100 transition-opacity" style={{ backgroundColor: 'var(--teal)' }} />

                <div className="flex justify-between items-start mb-3">
                  <span className="text-[10px] font-bold font-mono" style={{ color: 'var(--text-faint)' }}>
                    Job #{job.id.toString()}
                  </span>
                  <div className="text-right">
                    <div className="text-[18px] font-extrabold leading-none" style={{ color: 'var(--text-primary)' }}>
                      ${fmtUSDC(job.amountUSDC)}
                    </div>
                    <div className="text-[11px] mt-0.5" style={{ color: 'var(--text-faint)' }}>USDC</div>
                  </div>
                </div>

                <h3 className="text-[14px] font-bold leading-snug mb-2 flex-1 transition-colors" style={{ color: 'var(--text-primary)' }}>
                  {/* Parse title from ipfsJobSpec JSON if available */}
                  {(() => {
                    try { return JSON.parse(job.ipfsJobSpec).title || job.ipfsJobSpec }
                    catch { return job.ipfsJobSpec || `Job #${job.id}` }
                  })()}
                </h3>

                <div className="flex items-center justify-between pt-3" style={{ borderTop: '1px solid var(--border-subtle)' }}>
                  <div className="flex items-center gap-2">
                    <div className="size-7 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0"
                      style={{ backgroundColor: 'var(--bg-input)', border: '1px solid var(--border-strong)', color: 'var(--teal-hi)' }}>
                      {job.client.slice(2, 4).toUpperCase()}
                    </div>
                    <div>
                      <div className="text-[11px] font-medium font-mono leading-none" style={{ color: 'var(--text-secondary)' }}>
                        {shortAddr(job.client)}
                      </div>
                      <div className="text-[9px] flex items-center gap-0.5 mt-0.5" style={{ color: 'var(--teal)' }}>
                        <ShieldCheck className="size-2.5" /> On-chain
                      </div>
                    </div>
                  </div>
                  <span className="text-[10px] rounded-full px-2 py-0.5 font-semibold"
                    style={{ color: st.color, backgroundColor: st.bg, border: `1px solid ${st.border}` }}>
                    {JOB_STATUS_LABEL[job.status]}
                  </span>
                </div>
              </div>
            </Link>
          )
        })}
      </div>
    </section>
  )
}
