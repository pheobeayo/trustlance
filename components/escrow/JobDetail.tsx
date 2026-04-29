'use client'
import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, ShieldCheck, Zap, CheckCircle2 } from 'lucide-react'
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { base } from 'wagmi/chains'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { Input } from '@/components/ui/input'
import { SlidingLineGrid } from '@/components/ui-custom/SlidingGrid'
import type { Job } from '@/types'
import { DEPOSIT_TOKENS } from '@/types'
import { formatUSDC, shortAddress } from '@/lib/mockData'
import { TRUSTLANCE_ABI, TRUSTLANCE_ADDRESS } from '@/lib/contracts'
import { WorldIDVerifyModal } from './WorldIDVerifyModal'
import { cn } from '@/lib/utils'

const STATUS_LABELS: Record<string, string> = {
  Open:'Open', InProgress:'In Progress', Delivered:'In Review', Completed:'Completed', Reclaimed:'Reclaimed'
}

const TL_STEPS = [
  { label: 'Job Created',        sub: 'Funds deposited & locked in escrow'  },
  { label: 'Client Verified',    sub: 'World ID confirmed — unique human'    },
  { label: 'Freelancer Accepts', sub: 'Verified freelancer accepts the job'  },
  { label: 'Work Delivered',     sub: 'IPFS deliverable submitted'           },
  { label: 'Payment Released',   sub: 'Via KeeperHub — SLA guaranteed'       },
]

function getDoneCount(s: string) {
  return s==='Open'?2:s==='InProgress'?3:s==='Delivered'?4:5
}

export function JobDetail({ job }: { job: Job }) {
  const { address, isConnected } = useAccount()
  const [selectedToken, setSelectedToken] = useState('ETH')
  const [showVerify, setShowVerify]       = useState(false)
  const [delivUrl, setDelivUrl]           = useState('')

  const { data: isVerified } = useReadContract({
    address: TRUSTLANCE_ADDRESS[base.id], abi: TRUSTLANCE_ABI, functionName: 'isVerified',
    args: address ? [address] : undefined, query: { enabled: !!address },
  })
  const { writeContract, data: txHash, isPending } = useWriteContract()
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash: txHash })
  const busy = isPending || isConfirming

  const isClient     = address?.toLowerCase() === job.client.toLowerCase()
  const isFreelancer = address && job.freelancer ? address.toLowerCase() === job.freelancer.toLowerCase() : false
  const doneCount    = getDoneCount(job.status)
  const ethAmt       = (Number(job.amountUSDC) / 1e6 / 2750).toFixed(4)

  function handleAccept() {
    if (!isVerified) { setShowVerify(true); return }
    writeContract({ address: TRUSTLANCE_ADDRESS[base.id], abi: TRUSTLANCE_ABI, functionName: 'acceptJob', args: [BigInt(job.id)] })
  }
  function handleSubmit() {
    if (!delivUrl) return
    writeContract({ address: TRUSTLANCE_ADDRESS[base.id], abi: TRUSTLANCE_ABI, functionName: 'submitWork', args: [BigInt(job.id), delivUrl] })
  }
  function handleRelease() {
    writeContract({ address: TRUSTLANCE_ADDRESS[base.id], abi: TRUSTLANCE_ABI, functionName: 'approveAndRelease', args: [BigInt(job.id)] })
  }

  return (
    <>
      <div className="flex flex-col lg:grid lg:grid-cols-[1fr_340px] min-h-[calc(100vh-64px)]">
        {/* ── Main ── */}
        <div className="relative overflow-hidden p-5 md:p-10 lg:border-r border-[#1e2f24]">
          <SlidingLineGrid speed={0.1} />
          <div className="relative z-10">
            <Link href="/jobs" className="inline-flex items-center gap-2 text-[12px] text-[#344d3f] hover:text-[#14c490] transition-colors mb-6">
              <ArrowLeft className="size-3.5" /> Back to jobs
            </Link>

            <div className="flex flex-wrap items-center gap-2 mb-3">
              <Badge className="text-[10px] font-bold tracking-wider uppercase text-[#0d9e75] bg-[#0d9e75]/10 border border-[#0d9e75]/20 rounded">{job.category}</Badge>
              <Badge variant="outline" className="text-[11px] font-semibold text-[#14c490] border-[#0d9e75]/40 rounded-full gap-1.5">
                <span className="size-1.5 rounded-full bg-[#14c490] animate-pulse" />{STATUS_LABELS[job.status]}
              </Badge>
            </div>

            <h1 className="text-[clamp(22px,3.5vw,34px)] font-extrabold leading-[1.15] tracking-tight text-[#e5f2ea] mb-5">{job.title}</h1>

            <div className="flex flex-wrap gap-6 mb-6">
              {[
                { label:'Deadline', val: job.deadline ? new Date(job.deadline).toLocaleDateString('en-US',{month:'long',day:'numeric',year:'numeric'}) : '—' },
                { label:'Posted',   val: job.postedAt  ? new Date(job.postedAt).toLocaleDateString('en-US',{month:'short',day:'numeric'}) : '—' },
                { label:'Client',   val: shortAddress(job.client) },
              ].map(m => (
                <div key={m.label}>
                  <div className="text-[13px] font-semibold text-[#e5f2ea] font-mono">{m.val}</div>
                  <div className="text-[11px] text-[#344d3f]">{m.label}</div>
                </div>
              ))}
            </div>

            <Separator className="bg-[#1e2f24] mb-6" />

            <div className="text-[14px] text-[#95b8a5] leading-[1.85] space-y-4 mb-6">
              {job.description?.split('\n').map((p, i) => <p key={i}>{p}</p>)}
            </div>

            <div className="text-[10px] font-bold tracking-[1.8px] text-[#344d3f] uppercase mb-3">Required Skills</div>
            <div className="flex flex-wrap gap-2 mb-8">
              {job.skills?.map(s => (
                <span key={s} className="px-3 py-1.5 rounded-lg text-[12px] font-medium bg-[#152019] text-[#95b8a5] border border-[#294038]">{s}</span>
              ))}
            </div>

            <Separator className="bg-[#1e2f24] mb-6" />

            <div className="text-[10px] font-bold tracking-[1.8px] text-[#344d3f] uppercase mb-5">Escrow Timeline</div>
            <div>
              {TL_STEPS.map((step, i) => {
                const done    = i < doneCount
                const current = i === doneCount
                return (
                  <div key={i} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className={cn('size-6 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0',
                        done    ? 'bg-[#0d9e75] text-white'
                        : current? 'bg-[#152019] border-2 border-[#14c490] text-[#14c490]'
                        :          'bg-[#152019] border border-[#294038] text-[#344d3f]'
                      )}>
                        {done ? '✓' : i + 1}
                      </div>
                      {i < TL_STEPS.length - 1 && <div className="w-px flex-1 min-h-4 bg-[#1e2f24] my-1" />}
                    </div>
                    <div className="pb-4 min-w-0">
                      <div className="text-[13px] font-semibold text-[#e5f2ea]">{step.label}</div>
                      <div className={cn('text-[11px] mt-0.5', done ? 'text-[#0d9e75]' : 'text-[#344d3f]')}>{step.sub}</div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* ── Sidebar ── */}
        <aside className="p-5 md:p-6 bg-[#0b1310] border-t lg:border-t-0 border-[#1e2f24] lg:sticky lg:top-16 lg:max-h-[calc(100vh-64px)] lg:overflow-y-auto space-y-3">
          {/* Amount */}
          <Card className="bg-[#0f1a14] border-[#1e2f24] rounded-2xl">
            <CardContent className="p-5">
              <div className="text-[10px] font-bold tracking-[1.5px] text-[#344d3f] uppercase mb-3">Escrow Amount</div>
              <div className="text-[36px] font-extrabold text-[#14c490] leading-none mb-1">
                ${formatUSDC(job.amountUSDC)}<span className="text-[14px] font-medium text-[#344d3f] ml-1">USDC</span>
              </div>
              <div className="text-[12px] text-[#344d3f] font-mono mb-3">≈ {ethAmt} ETH at current rate</div>
              <p className="text-[11px] text-[#344d3f] mb-3 leading-relaxed">Deposit in any token — auto-swapped via Uniswap</p>
              <div className="grid grid-cols-4 gap-1.5">
                {DEPOSIT_TOKENS.map(t => (
                  <button key={t} onClick={() => setSelectedToken(t)}
                    className={cn('py-2 rounded-lg text-[11px] font-bold transition-all',
                      selectedToken === t
                        ? 'bg-[#0d9e75]/10 border border-[#0d9e75] text-[#14c490]'
                        : 'bg-[#152019] border border-[#1e2f24] text-[#344d3f] hover:border-[#0a7a5a] hover:text-[#0d9e75]'
                    )}>{t}</button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Client */}
          <Card className="bg-[#0f1a14] border-[#1e2f24] rounded-2xl">
            <CardContent className="p-5">
              <div className="text-[10px] font-bold tracking-[1.5px] text-[#344d3f] uppercase mb-3">Client</div>
              <div className="flex items-center gap-3 mb-3">
                <Avatar className="size-10 border border-[#294038]">
                  <AvatarFallback className="bg-[#152019] text-[#14c490] text-sm font-bold">{job.client.slice(2,4).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div>
                  <div className="text-[14px] font-semibold text-[#e5f2ea] font-mono">{shortAddress(job.client)}</div>
                  <div className="text-[11px] text-[#0d9e75] flex items-center gap-1 mt-0.5"><ShieldCheck className="size-3" /> World ID Verified</div>
                </div>
              </div>
              <div className="flex items-center gap-2 bg-[#0d9e75]/8 border border-[#0d9e75]/20 rounded-lg px-3 py-2 text-[12px] text-[#14c490]">
                <div className="size-5 rounded-full bg-[#0d9e75] flex items-center justify-center text-white text-[9px] font-bold flex-shrink-0">W</div>
                Unique human · sybil-resistant
              </div>
            </CardContent>
          </Card>

          {/* CTA */}
          <div className="space-y-2">
            {!isConnected && <p className="text-center text-[12px] text-[#344d3f] bg-[#152019] rounded-xl p-4 border border-[#1e2f24]">Connect your wallet to interact</p>}
            {isConnected && job.status==='Open' && !isClient && (
              <Button className="w-full bg-[#0d9e75] hover:bg-[#14c490] text-white font-bold rounded-xl h-12" onClick={handleAccept} disabled={busy}>
                {busy ? 'Sending…' : isVerified ? 'Accept Job' : 'Verify & Accept →'}
              </Button>
            )}
            {isConnected && job.status==='InProgress' && isFreelancer && (
              <div className="space-y-2">
                <Input value={delivUrl} onChange={e=>setDelivUrl(e.target.value)} placeholder="IPFS CID or deliverable URL"
                  className="bg-[#152019] border-[#294038] text-[#e5f2ea] placeholder:text-[#344d3f] rounded-xl font-mono text-[13px] focus-visible:ring-[#0d9e75]" />
                <Button className="w-full bg-[#0d9e75] hover:bg-[#14c490] text-white font-bold rounded-xl h-12" onClick={handleSubmit} disabled={busy||!delivUrl}>
                  {busy ? 'Sending…' : 'Submit Deliverable'}
                </Button>
              </div>
            )}
            {isConnected && job.status==='Delivered' && isClient && (
              <Button className="w-full bg-[#0d9e75] hover:bg-[#14c490] text-white font-bold rounded-xl h-12" onClick={handleRelease} disabled={busy}>
                {busy ? 'Confirming…' : 'Approve & Release via KeeperHub'}
              </Button>
            )}
            {isSuccess && (
              <div className="flex items-center justify-center gap-2 text-[13px] text-[#14c490] font-semibold bg-[#0d9e75]/10 border border-[#0d9e75]/30 rounded-xl p-3">
                <CheckCircle2 className="size-4" /> Transaction confirmed
              </div>
            )}
            <div className="flex items-center justify-center gap-2 text-[11px] text-[#344d3f]">
              <Zap className="size-3 text-[#0d9e75]" />Release via KeeperHub · SLA-backed
            </div>
          </div>
        </aside>
      </div>

      {showVerify && (
        <WorldIDVerifyModal onClose={() => setShowVerify(false)} onSuccess={() => { setShowVerify(false); handleAccept() }} />
      )}
    </>
  )
}
