'use client'
import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, ShieldCheck, Zap, CheckCircle2 } from 'lucide-react'
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { base } from 'wagmi/chains'
import { Button } from '@/components/ui/button'
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
  Open:'Open', InProgress:'In Progress', Delivered:'In Review',
  Completed:'Completed', Reclaimed:'Reclaimed',
}
const TL_STEPS = [
  { label:'Job Created',        sub:'Funds deposited & locked in escrow'  },
  { label:'Client Verified',    sub:'World ID confirmed — unique human'    },
  { label:'Freelancer Accepts', sub:'Verified freelancer accepts the job'  },
  { label:'Work Delivered',     sub:'IPFS deliverable submitted'           },
  { label:'Payment Released',   sub:'Via KeeperHub — SLA guaranteed'       },
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
    writeContract({ address: TRUSTLANCE_ADDRESS[base.id], abi: TRUSTLANCE_ABI, functionName:'acceptJob', args:[BigInt(job.id)] })
  }
  function handleSubmit() {
    if (!delivUrl) return
    writeContract({ address: TRUSTLANCE_ADDRESS[base.id], abi: TRUSTLANCE_ABI, functionName:'submitWork', args:[BigInt(job.id), delivUrl] })
  }
  function handleRelease() {
    writeContract({ address: TRUSTLANCE_ADDRESS[base.id], abi: TRUSTLANCE_ABI, functionName:'approveAndRelease', args:[BigInt(job.id)] })
  }

  return (
    <>
      <div className="flex flex-col lg:grid lg:grid-cols-[1fr_340px] min-h-[calc(100vh-64px)]">
        {/* ── Main ── */}
        <div className="relative overflow-hidden p-5 md:p-10 lg:border-r transition-colors duration-300"
          style={{ borderColor: 'var(--border-base)' }}>
          <SlidingLineGrid speed={0.1} />
          <div className="relative z-10">
            <Link href="/jobs" className="inline-flex items-center gap-2 text-[12px] mb-6 transition-colors"
              style={{ color: 'var(--text-faint)' }}
              onMouseEnter={e=>(e.currentTarget.style.color='var(--teal-hi)')}
              onMouseLeave={e=>(e.currentTarget.style.color='var(--text-faint)')}>
              <ArrowLeft className="size-3.5" /> Back to jobs
            </Link>

            {/* Status row */}
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span className="text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded"
                style={{ color:'var(--teal)', background:'rgba(13,158,117,0.1)', border:'1px solid rgba(13,158,117,0.2)' }}>
                {job.category}
              </span>
              <span className="text-[11px] font-semibold rounded-full px-3 py-0.5 flex items-center gap-1.5"
                style={{ color:'var(--teal-hi)', background:'rgba(13,158,117,0.1)', border:'1px solid rgba(13,158,117,0.35)' }}>
                <span className="size-1.5 rounded-full animate-pulse" style={{ backgroundColor:'var(--teal-hi)' }} />
                {STATUS_LABELS[job.status]}
              </span>
            </div>

            <h1 className="text-[clamp(22px,3.5vw,34px)] font-extrabold leading-[1.15] tracking-tight mb-5 transition-colors"
              style={{ color:'var(--text-primary)' }}>{job.title}</h1>

            <div className="flex flex-wrap gap-6 mb-6">
              {[
                { label:'Deadline', val:job.deadline?new Date(job.deadline).toLocaleDateString('en-US',{month:'long',day:'numeric',year:'numeric'}):'—' },
                { label:'Posted',   val:job.postedAt?new Date(job.postedAt).toLocaleDateString('en-US',{month:'short',day:'numeric'}):'—' },
                { label:'Client',   val:shortAddress(job.client) },
              ].map(m=>(
                <div key={m.label}>
                  <div className="text-[13px] font-semibold font-mono transition-colors" style={{ color:'var(--text-primary)' }}>{m.val}</div>
                  <div className="text-[11px] transition-colors" style={{ color:'var(--text-faint)' }}>{m.label}</div>
                </div>
              ))}
            </div>

            <Separator className="mb-6" />

            <div className="text-[14px] leading-[1.85] space-y-4 mb-6 transition-colors" style={{ color:'var(--text-secondary)' }}>
              {job.description?.split('\n').map((p,i)=><p key={i}>{p}</p>)}
            </div>

            <div className="text-[10px] font-bold tracking-[1.8px] uppercase mb-3 transition-colors" style={{ color:'var(--text-faint)' }}>Required Skills</div>
            <div className="flex flex-wrap gap-2 mb-8">
              {job.skills?.map(s=>(
                <span key={s} className="px-3 py-1.5 rounded-lg text-[12px] font-medium transition-colors"
                  style={{ backgroundColor:'var(--bg-input)', color:'var(--text-secondary)', border:'1px solid var(--border-strong)' }}>{s}</span>
              ))}
            </div>

            <Separator className="mb-6" />

            <div className="text-[10px] font-bold tracking-[1.8px] uppercase mb-5 transition-colors" style={{ color:'var(--text-faint)' }}>Escrow Timeline</div>
            <div>
              {TL_STEPS.map((step,i)=>{
                const done=i<doneCount, current=i===doneCount
                return (
                  <div key={i} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className={cn('size-6 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0')}
                        style={done?{backgroundColor:'var(--teal)',color:'#fff'}:current?{backgroundColor:'var(--bg-input)',border:'2px solid var(--teal-hi)',color:'var(--teal-hi)'}:{backgroundColor:'var(--bg-input)',border:'1px solid var(--border-strong)',color:'var(--text-faint)'}}>
                        {done?'✓':i+1}
                      </div>
                      {i<TL_STEPS.length-1&&<div className="w-px flex-1 min-h-4 my-1 transition-colors" style={{ backgroundColor:'var(--border-base)' }} />}
                    </div>
                    <div className="pb-4">
                      <div className="text-[13px] font-semibold transition-colors" style={{ color:'var(--text-primary)' }}>{step.label}</div>
                      <div className="text-[11px] mt-0.5 transition-colors" style={{ color:done?'var(--teal)':'var(--text-faint)' }}>{step.sub}</div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* ── Sidebar ── */}
        <aside className="p-5 md:p-6 lg:sticky lg:top-16 lg:max-h-[calc(100vh-64px)] lg:overflow-y-auto space-y-3 transition-colors duration-300"
          style={{ backgroundColor:'var(--bg-surface)', borderTop:'1px solid var(--border-base)' }}>

          {/* Amount card */}
          <div className="rounded-2xl p-5 transition-colors" style={{ backgroundColor:'var(--bg-card)', border:'1px solid var(--border-base)' }}>
            <div className="text-[10px] font-bold tracking-[1.5px] uppercase mb-3 transition-colors" style={{ color:'var(--text-faint)' }}>Escrow Amount</div>
            <div className="text-[36px] font-extrabold leading-none mb-1" style={{ color:'var(--teal-hi)' }}>
              ${formatUSDC(job.amountUSDC)}<span className="text-[14px] font-medium ml-1" style={{ color:'var(--text-faint)' }}>USDC</span>
            </div>
            <div className="text-[12px] font-mono mb-3 transition-colors" style={{ color:'var(--text-faint)' }}>≈ {ethAmt} ETH at current rate</div>
            <p className="text-[11px] mb-3 leading-relaxed transition-colors" style={{ color:'var(--text-faint)' }}>Deposit in any token — auto-swapped via Uniswap</p>
            <div className="grid grid-cols-4 gap-1.5">
              {DEPOSIT_TOKENS.map(t=>(
                <button key={t} onClick={()=>setSelectedToken(t)}
                  className="py-2 rounded-lg text-[11px] font-bold transition-all"
                  style={selectedToken===t
                    ?{backgroundColor:'rgba(13,158,117,0.1)',border:'1px solid var(--teal)',color:'var(--teal-hi)'}
                    :{backgroundColor:'var(--bg-input)',border:'1px solid var(--border-base)',color:'var(--text-faint)'}
                  }
                  onMouseEnter={e=>selectedToken!==t&&((e.currentTarget.style.borderColor='var(--teal-lo)'),(e.currentTarget.style.color='var(--teal)'))}
                  onMouseLeave={e=>selectedToken!==t&&((e.currentTarget.style.borderColor='var(--border-base)'),(e.currentTarget.style.color='var(--text-faint)'))}>
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Client card */}
          <div className="rounded-2xl p-5 transition-colors" style={{ backgroundColor:'var(--bg-card)', border:'1px solid var(--border-base)' }}>
            <div className="text-[10px] font-bold tracking-[1.5px] uppercase mb-3 transition-colors" style={{ color:'var(--text-faint)' }}>Client</div>
            <div className="flex items-center gap-3 mb-3">
              <div className="size-10 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
                style={{ backgroundColor:'var(--bg-input)', border:'1px solid var(--border-strong)', color:'var(--teal-hi)' }}>
                {job.client.slice(2,4).toUpperCase()}
              </div>
              <div>
                <div className="text-[14px] font-semibold font-mono transition-colors" style={{ color:'var(--text-primary)' }}>{shortAddress(job.client)}</div>
                <div className="text-[11px] flex items-center gap-1 mt-0.5" style={{ color:'var(--teal)' }}><ShieldCheck className="size-3" /> World ID Verified</div>
              </div>
            </div>
            <div className="flex items-center gap-2 rounded-lg px-3 py-2 text-[12px]"
              style={{ background:'rgba(13,158,117,0.08)', border:'1px solid rgba(13,158,117,0.2)', color:'var(--teal-hi)' }}>
              <div className="size-5 rounded-full flex items-center justify-center text-white text-[9px] font-bold flex-shrink-0" style={{ backgroundColor:'var(--teal)' }}>W</div>
              Unique human · sybil-resistant
            </div>
          </div>

          {/* CTA */}
          <div className="space-y-2">
            {!isConnected&&(
              <p className="text-center text-[12px] rounded-xl p-4 transition-colors" style={{ color:'var(--text-faint)', backgroundColor:'var(--bg-input)', border:'1px solid var(--border-base)' }}>
                Connect your wallet to interact
              </p>
            )}
            {isConnected&&job.status==='Open'&&!isClient&&(
              <Button className="w-full h-12 font-bold rounded-xl text-white" style={{ backgroundColor:'var(--teal)' }} onClick={handleAccept} disabled={busy}>
                {busy?'Sending…':isVerified?'Accept Job':'Verify & Accept →'}
              </Button>
            )}
            {isConnected&&job.status==='InProgress'&&isFreelancer&&(
              <div className="space-y-2">
                <Input value={delivUrl} onChange={e=>setDelivUrl(e.target.value)} placeholder="IPFS CID or deliverable URL" className="rounded-xl font-mono text-[13px]" />
                <Button className="w-full h-12 font-bold rounded-xl text-white" style={{ backgroundColor:'var(--teal)' }} onClick={handleSubmit} disabled={busy||!delivUrl}>
                  {busy?'Sending…':'Submit Deliverable'}
                </Button>
              </div>
            )}
            {isConnected&&job.status==='Delivered'&&isClient&&(
              <Button className="w-full h-12 font-bold rounded-xl text-white" style={{ backgroundColor:'var(--teal)' }} onClick={handleRelease} disabled={busy}>
                {busy?'Confirming…':'Approve & Release via KeeperHub'}
              </Button>
            )}
            {isSuccess&&(
              <div className="flex items-center justify-center gap-2 text-[13px] font-semibold rounded-xl p-3"
                style={{ color:'var(--teal-hi)', background:'rgba(13,158,117,0.1)', border:'1px solid rgba(13,158,117,0.3)' }}>
                <CheckCircle2 className="size-4" /> Transaction confirmed
              </div>
            )}
            <div className="flex items-center justify-center gap-2 text-[11px] transition-colors" style={{ color:'var(--text-faint)' }}>
              <Zap className="size-3" style={{ color:'var(--teal)' }} />Release via KeeperHub · SLA-backed
            </div>
          </div>
        </aside>
      </div>

      {showVerify&&(
        <WorldIDVerifyModal onClose={()=>setShowVerify(false)} onSuccess={()=>{setShowVerify(false);handleAccept()}} />
      )}
    </>
  )
}
