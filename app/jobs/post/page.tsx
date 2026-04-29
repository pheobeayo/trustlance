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
import { Card, CardContent } from '@/components/ui/card'
import { SlidingGrid } from '@/components/ui-custom/SlidingGrid'
import { TRUSTLANCE_ABI, TRUSTLANCE_ADDRESS, ERC20_ABI, USDC_ADDRESS } from '@/lib/contracts'
import { cn } from '@/lib/utils'
import type { DepositToken } from '@/types'

const DEPOSIT_TOKENS: DepositToken[] = ['ETH','USDC','USDT','DAI']
const TOKEN_PRICES: Record<DepositToken, number> = { ETH:2750, USDC:1, USDT:1, DAI:1 }
const CATEGORIES = ['Smart Contracts','Frontend / React','Rust / Solana','Security Auditing','Technical Writing','ZK / Cryptography']
const STEPS = ['Verify','Job Details','Deposit','Publish']

export default function PostJobPage() {
  const { address, isConnected } = useAccount()
  const [step,          setStep]          = useState(1)
  const [title,         setTitle]         = useState('')
  const [category,      setCategory]      = useState('')
  const [description,   setDescription]   = useState('')
  const [skills,        setSkills]        = useState('')
  const [deadline,      setDeadline]      = useState('')
  const [freelancer,    setFreelancer]    = useState('')
  const [depositToken,  setDepositToken]  = useState<DepositToken>('ETH')
  const [depositAmount, setDepositAmount] = useState('')

  const { writeContract, data: txHash, isPending } = useWriteContract()
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash: txHash })
  const busy = isPending || isConfirming

  const usdcOut = depositAmount ? (parseFloat(depositAmount) * TOKEN_PRICES[depositToken]).toFixed(2) : '0.00'

  async function handleSubmit() {
    if (!address) return
    const mockCid = 'bafkreidemo' + Math.random().toString(36).slice(2, 8)
    const usdcAmount = parseUnits(usdcOut, 6)
    writeContract({ address: USDC_ADDRESS, abi: ERC20_ABI, functionName: 'approve', args: [TRUSTLANCE_ADDRESS[base.id], usdcAmount] })
    writeContract({
      address: TRUSTLANCE_ADDRESS[base.id], abi: TRUSTLANCE_ABI, functionName: 'createEscrow',
      args: [(freelancer as `0x${string}`) || '0x0000000000000000000000000000000000000000', usdcAmount, mockCid],
    })
  }

  const stepCls = (i: number) => cn(
    'size-6 rounded-full flex items-center justify-center text-[10px] font-bold relative z-10',
    i < step  ? 'bg-[#0d9e75] text-white'
    : i===step? 'bg-[#152019] border-2 border-[#14c490] text-[#14c490]'
    :           'bg-[#152019] border border-[#294038] text-[#344d3f]'
  )

  return (
    <div className="relative min-h-screen overflow-hidden">
      <SlidingGrid speed={0.2} opacity="0.3" />
      <div className="relative z-10 max-w-2xl mx-auto px-5 md:px-8 pt-24 pb-20">

        <Link href="/jobs" className="inline-flex items-center gap-2 text-[12px] text-[#344d3f] hover:text-[#14c490] transition-colors mb-6">
          <ArrowLeft className="size-3.5" /> Back to jobs
        </Link>

        <div className="mb-8">
          <h1 className="text-[clamp(22px,3.5vw,28px)] font-extrabold tracking-tight text-[#e5f2ea] mb-2">Post a New Job</h1>
          <p className="text-[13px] text-[#567a68]">Funds are locked in escrow until work is approved. World ID verification required.</p>
        </div>

        {/* Step bar */}
        <div className="flex items-start mb-10">
          {STEPS.map((s, i) => (
            <div key={i} className="flex-1 flex flex-col items-center relative">
              {i < STEPS.length - 1 && (
                <div className="absolute top-3 left-1/2 right-0 h-px bg-[#294038] z-0" />
              )}
              <div className={stepCls(i)}>{i < step ? '✓' : i + 1}</div>
              <div className="text-[10px] text-[#344d3f] mt-2 text-center leading-tight">{s}</div>
            </div>
          ))}
        </div>

        <Card className="bg-[#0f1a14] border-[#1e2f24] rounded-2xl">
          <CardContent className="p-6 space-y-5">
            {/* Title */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-[#344d3f] uppercase tracking-widest">Job Title</label>
              <Input value={title} onChange={e=>setTitle(e.target.value)} placeholder="e.g. Build Uniswap V3 LP Dashboard"
                className="bg-[#152019] border-[#294038] text-[#e5f2ea] placeholder:text-[#344d3f] rounded-xl focus-visible:ring-[#0d9e75] h-11" />
            </div>

            {/* Category */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-[#344d3f] uppercase tracking-widest">Category</label>
              <Select onValueChange={setCategory}>
                <SelectTrigger className="bg-[#152019] border-[#294038] text-[#e5f2ea] rounded-xl h-11 focus:ring-[#0d9e75]">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent className="bg-[#0f1a14] border-[#294038] text-[#e5f2ea]">
                  {CATEGORIES.map(c => <SelectItem key={c} value={c} className="focus:bg-[#152019] focus:text-[#14c490]">{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-[#344d3f] uppercase tracking-widest">Description</label>
              <Textarea value={description} onChange={e=>setDescription(e.target.value)}
                placeholder="Describe deliverables, requirements, and scope clearly…" rows={5}
                className="bg-[#152019] border-[#294038] text-[#e5f2ea] placeholder:text-[#344d3f] rounded-xl focus-visible:ring-[#0d9e75] resize-none" />
            </div>

            {/* Skills + Deadline */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-[#344d3f] uppercase tracking-widest">Skills</label>
                <Input value={skills} onChange={e=>setSkills(e.target.value)} placeholder="Solidity, wagmi, The Graph"
                  className="bg-[#152019] border-[#294038] text-[#e5f2ea] placeholder:text-[#344d3f] rounded-xl focus-visible:ring-[#0d9e75] h-11" />
              </div>
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-[#344d3f] uppercase tracking-widest">Deadline</label>
                <Input type="date" value={deadline} onChange={e=>setDeadline(e.target.value)}
                  className="bg-[#152019] border-[#294038] text-[#e5f2ea] rounded-xl focus-visible:ring-[#0d9e75] h-11" />
              </div>
            </div>

            {/* Freelancer */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-[#344d3f] uppercase tracking-widest">
                Freelancer Address <span className="normal-case tracking-normal text-[#344d3f] font-normal">— optional, blank = open listing</span>
              </label>
              <Input value={freelancer} onChange={e=>setFreelancer(e.target.value)} placeholder="0x…"
                className="bg-[#152019] border-[#294038] text-[#e5f2ea] placeholder:text-[#344d3f] rounded-xl focus-visible:ring-[#0d9e75] h-11 font-mono" />
            </div>

            {/* Token selector */}
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-[#344d3f] uppercase tracking-widest">Deposit Token</label>
              <div className="grid grid-cols-4 gap-2">
                {DEPOSIT_TOKENS.map(t => (
                  <button key={t} onClick={() => setDepositToken(t)}
                    className={cn('py-3 rounded-xl text-center cursor-pointer border transition-all duration-150',
                      depositToken===t
                        ? 'border-[#0d9e75] bg-[#0d9e75]/10'
                        : 'border-[#1e2f24] bg-[#152019] hover:border-[#0a7a5a]'
                    )}>
                    <div className={cn('text-[15px] font-extrabold', depositToken===t ? 'text-[#14c490]' : 'text-[#e5f2ea]')}>{t}</div>
                    <div className="text-[10px] text-[#344d3f] mt-0.5">{{ ETH:'Ethereum',USDC:'USD Coin',USDT:'Tether',DAI:'Dai' }[t]}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Amount + swap preview */}
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-[#344d3f] uppercase tracking-widest">Amount</label>
              <Input type="number" min="0" value={depositAmount} onChange={e=>setDepositAmount(e.target.value)} placeholder="0.00"
                className="bg-[#152019] border-[#294038] text-[#e5f2ea] placeholder:text-[#344d3f] rounded-xl focus-visible:ring-[#0d9e75] h-11" />
              <div className="text-center text-[11px] text-[#0d9e75]">↓ auto-swapped to USDC via Uniswap Universal Router</div>
              <div className="flex justify-between items-center bg-[#0d9e75]/8 border border-[#0d9e75]/20 rounded-xl px-4 py-3">
                <div>
                  <div className="text-[22px] font-extrabold text-[#14c490] leading-none">
                    ≈ {parseFloat(usdcOut).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USDC
                  </div>
                  <div className="text-[11px] text-[#0d9e75] mt-1">locked in escrow on deposit</div>
                </div>
                <div className="text-[11px] font-bold text-[#0d9e75]">Uniswap V3 ✦</div>
              </div>
            </div>

            {/* KeeperHub note */}
            <div className="flex gap-3 bg-[#152019] border border-[#1e2f24] rounded-xl px-4 py-3">
              <Zap className="size-4 text-[#0d9e75] flex-shrink-0 mt-0.5" />
              <p className="text-[12px] text-[#567a68] leading-relaxed">
                <span className="text-[#95b8a5] font-semibold">Release via KeeperHub</span> — when you approve work, payment is routed through KeeperHub for SLA-backed execution, automatic retry on gas spikes, and a complete audit trail.
              </p>
            </div>

            {/* Submit */}
            <Button
              onClick={handleSubmit}
              disabled={!title || !description || !depositAmount || !isConnected || busy}
              className="w-full h-12 bg-[#0d9e75] hover:bg-[#14c490] text-white font-bold rounded-xl text-[15px] gap-2 disabled:opacity-40"
            >
              {busy ? (isConfirming ? 'Confirming transaction…' : 'Sending…') : <>Create Escrow & Publish Job <ArrowRight className="size-4" /></>}
            </Button>

            {isSuccess && (
              <div className="text-center text-[13px] text-[#14c490] font-semibold bg-[#0d9e75]/10 border border-[#0d9e75]/30 rounded-xl p-3">
                ✓ Job published on-chain. Redirecting…
              </div>
            )}
            {!isConnected && (
              <p className="text-center text-[12px] text-[#344d3f]">Connect your wallet to post a job.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
