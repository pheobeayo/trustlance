'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft, ArrowRight, Zap, CheckCircle2 } from 'lucide-react'
import { useAccount } from 'wagmi'
import { parseUnits, zeroAddress } from 'viem'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { SlidingGrid } from '@/components/ui-custom/SlidingGrid'
import { useCreateJob, useUSDC, useMintUSDC } from '@/hooks/escrow'
import { cn } from '@/lib/utils'

const CATEGORIES = ['Smart Contracts','Frontend / React','Rust / Solana','Security Auditing','Technical Writing','ZK / Cryptography']
const STEPS      = ['Details','Amount','Deposit','Publish']
const POOL_FEE   = 3000 // 0.3% Uniswap V3 pool

export default function PostJobPage() {
  const router = useRouter()
  const { address, isConnected } = useAccount()

  // Form state
  const [title,       setTitle]       = useState('')
  const [category,    setCategory]    = useState('')
  const [description, setDescription] = useState('')
  const [skills,      setSkills]      = useState('')
  const [freelancer,  setFreelancer]  = useState('')
  const [usdcAmount,  setUsdcAmount]  = useState('')

  // Hooks
  const { balance, formatUSDC, hasAllowance, approve, isApproving } = useUSDC(address)
  const { createWithUSDC, isBusy, isSuccess, error, txHash }        = useCreateJob()
  const { mint, isBusy: isMinting, isSuccess: mintSuccess }         = useMintUSDC()

  const amountRaw = usdcAmount ? parseUnits(usdcAmount, 6) : 0n
  const needsApproval = amountRaw > 0n && !hasAllowance(amountRaw)
  const step = !title || !description ? 0 : !usdcAmount ? 1 : needsApproval ? 2 : 3

  // Redirect to job page on success
  useEffect(() => {
    if (isSuccess) {
      setTimeout(() => router.push('/jobs'), 2000)
    }
  }, [isSuccess, router])

  function buildSpec() {
    return JSON.stringify({ title, category, description, skills: skills.split(',').map(s => s.trim()).filter(Boolean) })
  }

  async function handleSubmit() {
    if (!address || !title || !description || amountRaw === 0n) return
    if (needsApproval) { approve(amountRaw); return }
    createWithUSDC({
      amountUSDC:  amountRaw,
      freelancer:  freelancer ? freelancer as `0x${string}` : undefined,
      ipfsJobSpec: buildSpec(),
    })
  }

  const stepCls = (i: number) => ({
    style: i < step
      ? { backgroundColor: 'var(--teal)', color: '#fff' }
      : i === step
      ? { backgroundColor: 'var(--bg-input)', border: '2px solid var(--teal-hi)', color: 'var(--teal-hi)' }
      : { backgroundColor: 'var(--bg-input)', border: '1px solid var(--border-strong)', color: 'var(--text-faint)' },
  })

  return (
    <div className="relative min-h-screen overflow-hidden transition-colors duration-300" style={{ backgroundColor: 'var(--bg-page)' }}>
      <SlidingGrid speed={0.2} opacity={0.2} />
      <div className="relative z-10 max-w-2xl mx-auto px-5 md:px-8 pt-24 pb-20">

        <Link href="/jobs" className="inline-flex items-center gap-2 text-[12px] mb-6 transition-colors"
          style={{ color: 'var(--text-faint)' }}
          onMouseEnter={e => (e.currentTarget.style.color = 'var(--teal-hi)')}
          onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-faint)')}>
          <ArrowLeft className="size-3.5" /> Back to jobs
        </Link>

        <div className="mb-8">
          <h1 className="text-[clamp(22px,3.5vw,28px)] font-extrabold tracking-tight mb-2 transition-colors" style={{ color: 'var(--text-primary)' }}>
            Post a New Job
          </h1>
          <p className="text-[13px] transition-colors" style={{ color: 'var(--text-muted)' }}>
            USDC is locked in escrow until you approve the deliverable.
          </p>
        </div>

        {/* Step bar */}
        <div className="flex items-start mb-10">
          {STEPS.map((s, i) => (
            <div key={i} className="flex-1 flex flex-col items-center relative">
              {i < STEPS.length - 1 && (
                <div className="absolute top-3 left-1/2 right-0 h-px z-0" style={{ backgroundColor: 'var(--border-strong)' }} />
              )}
              <div className="size-6 rounded-full flex items-center justify-center text-[10px] font-bold relative z-10" {...stepCls(i)}>
                {i < step ? '✓' : i + 1}
              </div>
              <div className="text-[10px] mt-2 text-center leading-tight" style={{ color: 'var(--text-faint)' }}>{s}</div>
            </div>
          ))}
        </div>

        {/* Form */}
        <div className="rounded-2xl p-6 space-y-5 transition-colors" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-base)' }}>

          {/* Title */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold uppercase tracking-widest" style={{ color: 'var(--text-faint)' }}>Job Title</label>
            <Input value={title} onChange={e => setTitle(e.target.value)}
              placeholder="e.g. Build Uniswap V3 LP Dashboard" className="h-11 rounded-xl" />
          </div>

          {/* Category */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold uppercase tracking-widest" style={{ color: 'var(--text-faint)' }}>Category</label>
            <Select onValueChange={setCategory}>
              <SelectTrigger className="h-11 rounded-xl"><SelectValue placeholder="Select category" /></SelectTrigger>
              <SelectContent>
                {CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold uppercase tracking-widest" style={{ color: 'var(--text-faint)' }}>Description</label>
            <Textarea value={description} onChange={e => setDescription(e.target.value)}
              placeholder="Describe deliverables, requirements, and scope clearly…"
              rows={5} className="rounded-xl" />
          </div>

          {/* Skills + Freelancer */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-widest" style={{ color: 'var(--text-faint)' }}>Skills</label>
              <Input value={skills} onChange={e => setSkills(e.target.value)} placeholder="Solidity, wagmi, The Graph" className="h-11 rounded-xl" />
            </div>
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-widest" style={{ color: 'var(--text-faint)' }}>
                Freelancer <span className="normal-case font-normal tracking-normal">(optional)</span>
              </label>
              <Input value={freelancer} onChange={e => setFreelancer(e.target.value)} placeholder="0x… or leave blank" className="h-11 rounded-xl font-mono" />
            </div>
          </div>

          {/* USDC Amount */}
          <div className="space-y-2">
            <div className="flex justify-between items-baseline">
              <label className="text-[11px] font-bold uppercase tracking-widest" style={{ color: 'var(--text-faint)' }}>USDC Amount</label>
              <span className="text-[11px]" style={{ color: 'var(--text-faint)' }}>
                Balance: {formatUSDC(balance)} USDC
              </span>
            </div>
            <Input type="number" min="0" value={usdcAmount} onChange={e => setUsdcAmount(e.target.value)}
              placeholder="100.00" className="h-11 rounded-xl" />
            {amountRaw > balance && balance > 0n && (
              <p className="text-[11px] text-red-400">Insufficient balance</p>
            )}
          </div>

          {/* Dev: Mint USDC */}
          {isConnected && address && (
            <div className="flex items-center gap-3 rounded-xl px-4 py-3 transition-colors"
              style={{ backgroundColor: 'var(--bg-input)', border: '1px solid var(--border-base)' }}>
              <span className="text-[11px]" style={{ color: 'var(--text-muted)' }}>🧪 Testnet — need USDC?</span>
              <Button size="sm" variant="outline" disabled={isMinting}
                className="rounded-lg text-[11px] h-7 px-3"
                style={{ borderColor: 'var(--teal)', color: 'var(--teal-hi)' }}
                onClick={() => mint(address, '1000')}>
                {isMinting ? 'Minting…' : 'Mint 1,000 USDC'}
              </Button>
              {mintSuccess && <span className="text-[11px]" style={{ color: 'var(--teal-hi)' }}>✓ Minted!</span>}
            </div>
          )}

          {/* KeeperHub note */}
          <div className="flex gap-3 rounded-xl px-4 py-3 transition-colors"
            style={{ backgroundColor: 'var(--bg-input)', border: '1px solid var(--border-base)' }}>
            <Zap className="size-4 flex-shrink-0 mt-0.5" style={{ color: 'var(--teal)' }} />
            <p className="text-[12px] leading-relaxed transition-colors" style={{ color: 'var(--text-muted)' }}>
              <span className="font-semibold" style={{ color: 'var(--text-secondary)' }}>Release via KeeperHub</span> — when you approve work, payment is routed through KeeperHub for SLA-backed execution with automatic retry.
            </p>
          </div>

          {/* Submit / Approve */}
          {needsApproval && amountRaw > 0n ? (
            <Button className="w-full h-12 font-bold rounded-xl text-[15px] gap-2 text-white"
              style={{ backgroundColor: 'var(--teal)' }}
              onClick={() => approve(amountRaw)}
              disabled={isApproving || !isConnected}>
              {isApproving ? 'Approving USDC…' : `Approve ${usdcAmount} USDC`}
            </Button>
          ) : (
            <Button className="w-full h-12 font-bold rounded-xl text-[15px] gap-2 text-white disabled:opacity-40"
              style={{ backgroundColor: 'var(--teal)' }}
              onClick={handleSubmit}
              disabled={!title || !description || amountRaw === 0n || !isConnected || isBusy || amountRaw > balance}>
              {isBusy ? 'Creating job…' : <><span>Create Escrow & Publish</span><ArrowRight className="size-4" /></>}
            </Button>
          )}

          {isSuccess && (
            <div className="flex items-center justify-center gap-2 text-[13px] font-semibold rounded-xl p-3"
              style={{ color: 'var(--teal-hi)', background: 'rgba(13,158,117,0.1)', border: '1px solid rgba(13,158,117,0.3)' }}>
              <CheckCircle2 className="size-4" /> Job created! Redirecting…
            </div>
          )}
          {error && (
            <p className="text-center text-[12px] text-red-400">
              {(error as any).shortMessage ?? error.message}
            </p>
          )}
          {!isConnected && (
            <p className="text-center text-[12px]" style={{ color: 'var(--text-faint)' }}>
              Connect your wallet to post a job.
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
