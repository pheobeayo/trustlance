'use client'
import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, ShieldCheck, Zap, CheckCircle2, Clock } from 'lucide-react'
import { useAccount } from 'wagmi'
import { parseUnits } from 'viem'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { SlidingLineGrid } from '@/components/ui-custom/SlidingGrid'
import { useJob, useJobRole, useJobActions, useUSDC, useTimeout } from '@/hooks/escrow'
import { JOB_STATUS_LABEL, JobStatus } from '@/lib/contracts'
import { cn } from '@/lib/utils'

const THIRTY_DAYS = 30 * 24 * 60 * 60

const TL_STEPS = [
  { label: 'Job Created',        sub: 'USDC locked in escrow'              },
  { label: 'Freelancer Accepts', sub: 'Work underway, 30-day clock started' },
  { label: 'Work Delivered',     sub: 'IPFS deliverable submitted'          },
  { label: 'Client Approves',    sub: 'KeeperHub task registered on-chain'  },
  { label: 'Payment Released',   sub: 'USDC sent via KeeperHub'             },
]

function getDoneCount(status: number) {
  if (status === JobStatus.Open)       return 1
  if (status === JobStatus.InProgress) return 2
  if (status === JobStatus.Delivered)  return 3
  if (status === JobStatus.Approved)   return 4
  return 5 // Completed / Reclaimed / Cancelled
}

function shortAddr(a: string) {
  return `${a.slice(0, 6)}…${a.slice(-4)}`
}
function fmtUSDC(raw: bigint) {
  return (Number(raw) / 1e6).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

export function JobDetail({ jobId }: { jobId: bigint }) {
  const { address, isConnected } = useAccount()
  const { job, isLoading }       = useJob(jobId)
  const { isClient, isFreelancer } = useJobRole(job, address)
  const { hasAllowance, approve, isApproving } = useUSDC(address)
  const { formatRemaining, canReclaim } = useTimeout(jobId)
  const {
    acceptJob, submitWork, approveWork, reclaimAfterTimeout, cancelJob,
    isBusy, isSuccess, error,
  } = useJobActions(jobId)

  const [delivUrl, setDelivUrl] = useState('')

  if (isLoading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="flex flex-col items-center gap-3">
        <div className="size-8 rounded-full border-2 border-[var(--teal)] border-t-transparent animate-spin" />
        <p className="text-[13px]" style={{ color: 'var(--text-faint)' }}>Loading job…</p>
      </div>
    </div>
  )

  if (!job) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
      <p className="text-[17px] font-bold" style={{ color: 'var(--text-primary)' }}>Job not found</p>
      <Link href="/jobs" className="text-[13px]" style={{ color: 'var(--teal-hi)' }}>← Back to jobs</Link>
    </div>
  )

  const doneCount = getDoneCount(job.status)
  const ethAmt    = (Number(job.amountUSDC) / 1e6 / 2750).toFixed(4)

  // Approve then accept in sequence
  function handleAccept() {
    if (!hasAllowance(0n)) {
      approve(0n) // no approval needed for acceptJob (no token pull)
    }
    acceptJob()
  }

  function handleSubmit() {
    if (!delivUrl.trim()) return
    submitWork(delivUrl.trim())
    setDelivUrl('')
  }

  const statusColor = {
    [JobStatus.Open]:       'var(--teal-hi)',
    [JobStatus.InProgress]: '#6699ee',
    [JobStatus.Delivered]:  '#c8921e',
    [JobStatus.Approved]:   '#9b72cf',
    [JobStatus.Completed]:  '#4acc80',
    [JobStatus.Reclaimed]:  '#567a68',
    [JobStatus.Cancelled]:  '#e06060',
  }[job.status] ?? 'var(--text-muted)'

  return (
    <div className="flex flex-col lg:grid lg:grid-cols-[1fr_340px] min-h-[calc(100vh-64px)]">

      {/* ── Main panel ── */}
      <div className="relative overflow-hidden p-5 md:p-10 lg:border-r transition-colors duration-300"
        style={{ borderColor: 'var(--border-base)' }}>
        <SlidingLineGrid speed={0.1} />
        <div className="relative z-10">
          <Link href="/jobs" className="inline-flex items-center gap-2 text-[12px] mb-6 transition-colors"
            style={{ color: 'var(--text-faint)' }}
            onMouseEnter={e => (e.currentTarget.style.color = 'var(--teal-hi)')}
            onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-faint)')}>
            <ArrowLeft className="size-3.5" /> Back to jobs
          </Link>

          {/* Status badge */}
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className="text-[11px] font-semibold rounded-full px-3 py-0.5 flex items-center gap-1.5"
              style={{ color: statusColor, background: `${statusColor}18`, border: `1px solid ${statusColor}55` }}>
              <span className="size-1.5 rounded-full animate-pulse" style={{ backgroundColor: statusColor }} />
              {job.statusLabel}
            </span>
          </div>

          <h1 className="text-[clamp(22px,3.5vw,34px)] font-extrabold leading-[1.15] tracking-tight mb-5 transition-colors"
            style={{ color: 'var(--text-primary)' }}>
            Job #{jobId.toString()}
          </h1>

          {/* Meta */}
          <div className="flex flex-wrap gap-6 mb-6">
            {[
              { label: 'Created',   val: new Date(Number(job.createdAt) * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) },
              { label: 'Client',    val: shortAddr(job.client) },
              { label: 'Spec',      val: job.ipfsJobSpec || '—' },
            ].map(m => (
              <div key={m.label}>
                <div className="text-[13px] font-semibold font-mono transition-colors truncate max-w-[220px]"
                  style={{ color: 'var(--text-primary)' }}>{m.val}</div>
                <div className="text-[11px] transition-colors" style={{ color: 'var(--text-faint)' }}>{m.label}</div>
              </div>
            ))}
          </div>

          {job.ipfsDeliverable && (
            <>
              <Separator className="mb-4" />
              <div className="mb-6">
                <div className="text-[10px] font-bold tracking-[1.8px] uppercase mb-2" style={{ color: 'var(--text-faint)' }}>Deliverable</div>
                <a href={`https://ipfs.io/ipfs/${job.ipfsDeliverable}`} target="_blank" rel="noopener noreferrer"
                  className="text-[13px] font-mono break-all" style={{ color: 'var(--teal-hi)' }}>
                  {job.ipfsDeliverable}
                </a>
              </div>
            </>
          )}

          <Separator className="mb-6" />

          {/* Escrow timeline */}
          <div className="text-[10px] font-bold tracking-[1.8px] uppercase mb-5" style={{ color: 'var(--text-faint)' }}>
            Escrow Timeline
          </div>
          <div>
            {TL_STEPS.map((step, i) => {
              const done    = i < doneCount
              const current = i === doneCount - 1
              return (
                <div key={i} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="size-6 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0"
                      style={done
                        ? { backgroundColor: 'var(--teal)', color: '#fff' }
                        : current
                        ? { backgroundColor: 'var(--bg-input)', border: '2px solid var(--teal-hi)', color: 'var(--teal-hi)' }
                        : { backgroundColor: 'var(--bg-input)', border: '1px solid var(--border-strong)', color: 'var(--text-faint)' }
                      }>
                      {done ? '✓' : i + 1}
                    </div>
                    {i < TL_STEPS.length - 1 && <div className="w-px flex-1 min-h-4 my-1 transition-colors" style={{ backgroundColor: 'var(--border-base)' }} />}
                  </div>
                  <div className="pb-4">
                    <div className="text-[13px] font-semibold transition-colors" style={{ color: 'var(--text-primary)' }}>{step.label}</div>
                    <div className="text-[11px] mt-0.5 transition-colors" style={{ color: done ? 'var(--teal)' : 'var(--text-faint)' }}>{step.sub}</div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Timeout warning */}
          {(job.status === JobStatus.InProgress || job.status === JobStatus.Delivered) && (
            <div className="mt-6 flex items-center gap-2 rounded-xl px-4 py-3 text-[12px]"
              style={{ backgroundColor: 'var(--bg-input)', border: '1px solid var(--border-base)', color: 'var(--text-secondary)' }}>
              <Clock className="size-4 flex-shrink-0" style={{ color: 'var(--teal)' }} />
              <span>{formatRemaining()}</span>
            </div>
          )}
        </div>
      </div>

      {/* ── Sidebar ── */}
      <aside className="p-5 md:p-6 lg:sticky lg:top-16 lg:max-h-[calc(100vh-64px)] lg:overflow-y-auto space-y-3 transition-colors duration-300"
        style={{ backgroundColor: 'var(--bg-surface)', borderTop: '1px solid var(--border-base)' }}>

        {/* Amount card */}
        <div className="rounded-2xl p-5 transition-colors" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-base)' }}>
          <div className="text-[10px] font-bold tracking-[1.5px] uppercase mb-3" style={{ color: 'var(--text-faint)' }}>Escrow Amount</div>
          <div className="text-[36px] font-extrabold leading-none mb-1" style={{ color: 'var(--teal-hi)' }}>
            ${fmtUSDC(job.amountUSDC)}<span className="text-[14px] font-medium ml-1" style={{ color: 'var(--text-faint)' }}>USDC</span>
          </div>
          <div className="text-[12px] font-mono mb-1 transition-colors" style={{ color: 'var(--text-faint)' }}>≈ {ethAmt} ETH</div>
          <div className="flex items-center gap-1.5 text-[11px]" style={{ color: 'var(--teal)' }}>
            <Zap className="size-3" />KeeperHub guaranteed release
          </div>
        </div>

        {/* Participants */}
        {[
          { label: 'Client',     addr: job.client },
          ...(job.freelancer && job.freelancer !== '0x0000000000000000000000000000000000000000'
            ? [{ label: 'Freelancer', addr: job.freelancer }]
            : []),
        ].map(p => (
          <div key={p.label} className="rounded-2xl p-5 transition-colors"
            style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-base)' }}>
            <div className="text-[10px] font-bold tracking-[1.5px] uppercase mb-2" style={{ color: 'var(--text-faint)' }}>{p.label}</div>
            <div className="flex items-center gap-2">
              <div className="size-9 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
                style={{ backgroundColor: 'var(--bg-input)', border: '1px solid var(--border-strong)', color: 'var(--teal-hi)' }}>
                {p.addr.slice(2, 4).toUpperCase()}
              </div>
              <div>
                <div className="text-[13px] font-mono font-semibold transition-colors" style={{ color: 'var(--text-primary)' }}>
                  {shortAddr(p.addr)}
                </div>
                {p.label === 'Client' && (
                  <div className="text-[10px] flex items-center gap-1 mt-0.5" style={{ color: 'var(--teal)' }}>
                    <ShieldCheck className="size-3" /> Verified
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}

        {/* Actions */}
        <div className="space-y-2">
          {!isConnected && (
            <p className="text-center text-[12px] rounded-xl p-4 transition-colors"
              style={{ color: 'var(--text-faint)', backgroundColor: 'var(--bg-input)', border: '1px solid var(--border-base)' }}>
              Connect your wallet to interact
            </p>
          )}

          {/* FREELANCER: Accept Open job */}
          {isConnected && !isClient && !isFreelancer && job.status === JobStatus.Open && (
            <Button className="w-full h-12 font-bold rounded-xl text-white"
              style={{ backgroundColor: 'var(--teal)' }}
              onClick={handleAccept} disabled={isBusy}>
              {isBusy ? 'Sending…' : 'Accept Job →'}
            </Button>
          )}

          {/* FREELANCER: Submit work */}
          {isConnected && isFreelancer && job.status === JobStatus.InProgress && (
            <div className="space-y-2">
              <Input value={delivUrl} onChange={e => setDelivUrl(e.target.value)}
                placeholder="IPFS CID or deliverable URL" className="rounded-xl font-mono text-[13px]" />
              <Button className="w-full h-12 font-bold rounded-xl text-white"
                style={{ backgroundColor: 'var(--teal)' }}
                onClick={handleSubmit} disabled={isBusy || !delivUrl.trim()}>
                {isBusy ? 'Sending…' : 'Submit Deliverable'}
              </Button>
            </div>
          )}

          {/* CLIENT: Approve work */}
          {isConnected && isClient && job.status === JobStatus.Delivered && (
            <Button className="w-full h-12 font-bold rounded-xl text-white"
              style={{ backgroundColor: 'var(--teal)' }}
              onClick={() => approveWork()} disabled={isBusy}>
              {isBusy ? 'Confirming…' : 'Approve & Release via KeeperHub'}
            </Button>
          )}

          {/* CLIENT: Cancel open job */}
          {isConnected && isClient && job.status === JobStatus.Open && (
            <Button variant="outline" className="w-full h-10 rounded-xl text-[13px]"
              style={{ borderColor: 'var(--border-strong)', color: 'var(--text-muted)' }}
              onClick={() => cancelJob()} disabled={isBusy}>
              {isBusy ? 'Cancelling…' : 'Cancel Job (Full Refund)'}
            </Button>
          )}

          {/* FREELANCER: Reclaim after timeout */}
          {isConnected && isFreelancer && canReclaim &&
            (job.status === JobStatus.InProgress || job.status === JobStatus.Delivered) && (
            <Button className="w-full h-12 font-bold rounded-xl text-white"
              style={{ backgroundColor: '#c8921e' }}
              onClick={() => reclaimAfterTimeout()} disabled={isBusy}>
              {isBusy ? 'Sending…' : 'Reclaim After Timeout'}
            </Button>
          )}

          {/* Approved — waiting for keeper */}
          {job.status === JobStatus.Approved && (
            <div className="text-center rounded-xl p-4 text-[12px]"
              style={{ color: '#9b72cf', backgroundColor: 'rgba(155,114,207,0.08)', border: '1px solid rgba(155,114,207,0.3)' }}>
              <Zap className="size-4 mx-auto mb-1" />
              KeeperHub task pending — payment will release automatically
            </div>
          )}

          {/* Success */}
          {isSuccess && (
            <div className="flex items-center justify-center gap-2 text-[13px] font-semibold rounded-xl p-3"
              style={{ color: 'var(--teal-hi)', background: 'rgba(13,158,117,0.1)', border: '1px solid rgba(13,158,117,0.3)' }}>
              <CheckCircle2 className="size-4" /> Transaction confirmed
            </div>
          )}

          {/* Error */}
          {error && (
            <p className="text-[11px] text-red-400 text-center px-2">
              {(error as any).shortMessage ?? error.message}
            </p>
          )}
        </div>
      </aside>
    </div>
  )
}
