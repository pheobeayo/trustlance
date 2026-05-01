'use client'
import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, ArrowRight, Zap } from 'lucide-react'
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { base } from 'wagmi/chains'
import { parseUnits } from 'viem'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { SlidingGrid } from '@/components/ui-custom/SlidingGrid'
import { TRUSTLANCE_ABI, TRUSTLANCE_ADDRESS, ERC20_ABI, USDC_ADDRESS } from '@/lib/contracts'
import { cn } from '@/lib/utils'
import type { DepositToken } from '@/types'

const DEPOSIT_TOKENS: DepositToken[] = ['ETH','USDC','USDT','DAI']
const TOKEN_PRICES: Record<DepositToken, number> = { ETH:2750, USDC:1, USDT:1, DAI:1 }
const TOKEN_NAMES: Record<DepositToken, string> = { ETH:'Ethereum', USDC:'USD Coin', USDT:'Tether', DAI:'Dai' }
const CATEGORIES = ['Smart Contracts','Frontend / React','Rust / Solana','Security Auditing','Technical Writing','ZK / Cryptography']
const STEPS = ['Verify','Job Details','Deposit','Publish']

export default function PostJobPage() {
  const { address, isConnected } = useAccount()
  const [step, setStep]                   = useState(1)
  const [title, setTitle]                 = useState('')
  const [category, setCategory]           = useState('')
  const [description, setDescription]     = useState('')
  const [skills, setSkills]               = useState('')
  const [deadline, setDeadline]           = useState('')
  const [freelancer, setFreelancer]       = useState('')
  const [depositToken, setDepositToken]   = useState<DepositToken>('ETH')
  const [depositAmount, setDepositAmount] = useState('')

  const { writeContract, data: txHash, isPending } = useWriteContract()
  const { isLoading: isConfirming, isSuccess }     = useWaitForTransactionReceipt({ hash: txHash })
  const busy    = isPending || isConfirming
  const usdcOut = depositAmount ? (parseFloat(depositAmount) * TOKEN_PRICES[depositToken]).toFixed(2) : '0.00'

  async function handleSubmit() {
    if (!address) return
    const mockCid    = 'bafkreidemo' + Math.random().toString(36).slice(2, 8)
    const usdcAmount = parseUnits(usdcOut, 6)
    writeContract({ address: USDC_ADDRESS, abi: ERC20_ABI, functionName:'approve', args:[TRUSTLANCE_ADDRESS[base.id], usdcAmount] })
    writeContract({
      address: TRUSTLANCE_ADDRESS[base.id], abi: TRUSTLANCE_ABI, functionName:'createEscrow',
      args:[(freelancer as `0x${string}`)||'0x0000000000000000000000000000000000000000', usdcAmount, mockCid],
    })
  }

  return (
    <div className="relative min-h-screen overflow-hidden transition-colors duration-300" style={{ backgroundColor:'var(--bg-page)' }}>
      <SlidingGrid speed={0.2} opacity={0.2} />
      <div className="relative z-10 max-w-2xl mx-auto px-5 md:px-8 pt-24 pb-20">

        <Link href="/jobs" className="inline-flex items-center gap-2 text-[12px] mb-6 transition-colors" style={{ color:'var(--text-faint)' }}
          onMouseEnter={e=>(e.currentTarget.style.color='var(--teal-hi)')}
          onMouseLeave={e=>(e.currentTarget.style.color='var(--text-faint)')}>
          <ArrowLeft className="size-3.5" /> Back to jobs
        </Link>

        <div className="mb-8">
          <h1 className="text-[clamp(22px,3.5vw,28px)] font-extrabold tracking-tight mb-2 transition-colors" style={{ color:'var(--text-primary)' }}>Post a New Job</h1>
          <p className="text-[13px] transition-colors" style={{ color:'var(--text-muted)' }}>Funds are locked in escrow until work is approved. World ID verification required.</p>
        </div>

        {/* Step bar */}
        <div className="flex items-start mb-10">
          {STEPS.map((s, i) => (
            <div key={i} className="flex-1 flex flex-col items-center relative">
              {i < STEPS.length-1 && (
                <div className="absolute top-3 left-1/2 right-0 h-px z-0 transition-colors" style={{ backgroundColor:'var(--border-strong)' }} />
              )}
              <div className="size-6 rounded-full flex items-center justify-center text-[10px] font-bold relative z-10 transition-colors"
                style={i<step
                  ?{backgroundColor:'var(--teal)',color:'#fff'}
                  :i===step
                  ?{backgroundColor:'var(--bg-input)',border:'2px solid var(--teal-hi)',color:'var(--teal-hi)'}
                  :{backgroundColor:'var(--bg-input)',border:'1px solid var(--border-strong)',color:'var(--text-faint)'}}>
                {i < step ? '✓' : i + 1}
              </div>
              <div className="text-[10px] mt-2 text-center leading-tight transition-colors" style={{ color:'var(--text-faint)' }}>{s}</div>
            </div>
          ))}
        </div>

        {/* Form card */}
        <div className="rounded-2xl p-6 space-y-5 transition-colors" style={{ backgroundColor:'var(--bg-card)', border:'1px solid var(--border-base)' }}>

          <div className="space-y-1.5">
            <label className="text-[11px] font-bold uppercase tracking-widest transition-colors" style={{ color:'var(--text-faint)' }}>Job Title</label>
            <Input value={title} onChange={e=>setTitle(e.target.value)} placeholder="e.g. Build Uniswap V3 LP Dashboard" className="h-11 rounded-xl" />
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-bold uppercase tracking-widest transition-colors" style={{ color:'var(--text-faint)' }}>Category</label>
            <Select onValueChange={setCategory}>
              <SelectTrigger className="h-11 rounded-xl"><SelectValue placeholder="Select category" /></SelectTrigger>
              <SelectContent>
                {CATEGORIES.map(c=><SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-bold uppercase tracking-widest transition-colors" style={{ color:'var(--text-faint)' }}>Description</label>
            <Textarea value={description} onChange={e=>setDescription(e.target.value)}
              placeholder="Describe deliverables, requirements, and scope clearly…" rows={5} className="rounded-xl" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-widest transition-colors" style={{ color:'var(--text-faint)' }}>Skills</label>
              <Input value={skills} onChange={e=>setSkills(e.target.value)} placeholder="Solidity, wagmi, The Graph" className="h-11 rounded-xl" />
            </div>
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-widest transition-colors" style={{ color:'var(--text-faint)' }}>Deadline</label>
              <Input type="date" value={deadline} onChange={e=>setDeadline(e.target.value)} className="h-11 rounded-xl" />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-bold uppercase tracking-widest transition-colors" style={{ color:'var(--text-faint)' }}>
              Freelancer Address <span className="normal-case tracking-normal font-normal" style={{ color:'var(--text-faint)' }}>— optional</span>
            </label>
            <Input value={freelancer} onChange={e=>setFreelancer(e.target.value)} placeholder="0x…" className="h-11 rounded-xl font-mono" />
          </div>

          {/* Token selector */}
          <div className="space-y-2">
            <label className="text-[11px] font-bold uppercase tracking-widest transition-colors" style={{ color:'var(--text-faint)' }}>Deposit Token</label>
            <div className="grid grid-cols-4 gap-2">
              {DEPOSIT_TOKENS.map(t=>(
                <button key={t} onClick={()=>setDepositToken(t)}
                  className="py-3 rounded-xl text-center cursor-pointer transition-all"
                  style={depositToken===t
                    ?{backgroundColor:'rgba(13,158,117,0.1)',border:'1px solid var(--teal)'}
                    :{backgroundColor:'var(--bg-input)',border:'1px solid var(--border-base)'}
                  }
                  onMouseEnter={e=>depositToken!==t&&(e.currentTarget.style.borderColor='var(--teal-lo)')}
                  onMouseLeave={e=>depositToken!==t&&(e.currentTarget.style.borderColor='var(--border-base)')}>
                  <div className="text-[15px] font-extrabold transition-colors" style={{ color:depositToken===t?'var(--teal-hi)':'var(--text-primary)' }}>{t}</div>
                  <div className="text-[10px] mt-0.5 transition-colors" style={{ color:'var(--text-faint)' }}>{TOKEN_NAMES[t]}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Amount + swap */}
          <div className="space-y-2">
            <label className="text-[11px] font-bold uppercase tracking-widest transition-colors" style={{ color:'var(--text-faint)' }}>Amount</label>
            <Input type="number" min="0" value={depositAmount} onChange={e=>setDepositAmount(e.target.value)} placeholder="0.00" className="h-11 rounded-xl" />
            <div className="text-center text-[11px]" style={{ color:'var(--teal)' }}>↓ auto-swapped to USDC via Uniswap Universal Router</div>
            <div className="flex justify-between items-center rounded-xl px-4 py-3 transition-colors"
              style={{ background:'rgba(13,158,117,0.08)', border:'1px solid rgba(13,158,117,0.2)' }}>
              <div>
                <div className="text-[22px] font-extrabold leading-none" style={{ color:'var(--teal-hi)' }}>
                  ≈ {parseFloat(usdcOut).toLocaleString(undefined,{minimumFractionDigits:2,maximumFractionDigits:2})} USDC
                </div>
                <div className="text-[11px] mt-1" style={{ color:'var(--teal)' }}>locked in escrow on deposit</div>
              </div>
              <div className="text-[11px] font-bold" style={{ color:'var(--teal)' }}>Uniswap V3 ✦</div>
            </div>
          </div>

          {/* KeeperHub note */}
          <div className="flex gap-3 rounded-xl px-4 py-3 transition-colors"
            style={{ backgroundColor:'var(--bg-input)', border:'1px solid var(--border-base)' }}>
            <Zap className="size-4 flex-shrink-0 mt-0.5" style={{ color:'var(--teal)' }} />
            <p className="text-[12px] leading-relaxed transition-colors" style={{ color:'var(--text-muted)' }}>
              <span className="font-semibold" style={{ color:'var(--text-secondary)' }}>Release via KeeperHub</span> — when you approve work, payment is routed through KeeperHub for SLA-backed execution, automatic retry on gas spikes, and a complete audit trail.
            </p>
          </div>

          <Button
            onClick={handleSubmit}
            disabled={!title||!description||!depositAmount||!isConnected||busy}
            className="w-full h-12 font-bold rounded-xl text-[15px] gap-2 text-white disabled:opacity-40"
            style={{ backgroundColor:'var(--teal)' }}>
            {busy?(isConfirming?'Confirming transaction…':'Sending…'):<>Create Escrow & Publish Job <ArrowRight className="size-4" /></>}
          </Button>

          {isSuccess&&(
            <div className="text-center text-[13px] font-semibold rounded-xl p-3"
              style={{ color:'var(--teal-hi)', background:'rgba(13,158,117,0.1)', border:'1px solid rgba(13,158,117,0.3)' }}>
              ✓ Job published on-chain. Redirecting…
            </div>
          )}
          {!isConnected&&(
            <p className="text-center text-[12px] transition-colors" style={{ color:'var(--text-faint)' }}>Connect your wallet to post a job.</p>
          )}
        </div>
      </div>
    </div>
  )
}
