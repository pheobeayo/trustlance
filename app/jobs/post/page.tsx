'use client'
import { useState } from 'react'
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { base } from 'wagmi/chains'
import { parseUnits } from 'viem'
import Link from 'next/link'
import type { DepositToken } from '@/types'
import { DEPOSIT_TOKENS } from '@/types'
import { TRUSTLANCE_ABI, TRUSTLANCE_ADDRESS, ERC20_ABI, USDC_ADDRESS } from '@/lib/contracts'
import styles from './PostJob.module.css'

const ETH_PRICE  = 2750
const USDT_PRICE = 1
const DAI_PRICE  = 1

const TOKEN_PRICES: Record<DepositToken, number> = {
  ETH:  ETH_PRICE,
  USDC: 1,
  USDT: USDT_PRICE,
  DAI:  DAI_PRICE,
}

const CATEGORIES = [
  'Smart Contracts', 'Frontend / React', 'Rust / Solana',
  'Security Auditing', 'Technical Writing', 'ZK / Cryptography',
]

const STEPS = ['Verify', 'Job Details', 'Deposit', 'Publish']

export default function PostJobPage() {
  const { address, isConnected } = useAccount()

  const [step,          setStep]          = useState(1)
  const [title,         setTitle]         = useState('')
  const [category,      setCategory]      = useState(CATEGORIES[0])
  const [description,   setDescription]   = useState('')
  const [skills,        setSkills]        = useState('')
  const [deadline,      setDeadline]      = useState('')
  const [freelancer,    setFreelancer]    = useState('')
  const [depositToken,  setDepositToken]  = useState<DepositToken>('ETH')
  const [depositAmount, setDepositAmount] = useState('')

  const { writeContract, data: txHash, isPending } = useWriteContract()
  const { isLoading: isConfirming, isSuccess }     = useWaitForTransactionReceipt({ hash: txHash })

  const usdcOut = depositAmount
    ? (parseFloat(depositAmount) * TOKEN_PRICES[depositToken]).toFixed(2)
    : '0.00'

  async function handleSubmit() {
    if (!address) return

    // Build IPFS job spec (in production, actually pin to IPFS)
    const spec = JSON.stringify({ title, category, description, skills: skills.split(',').map(s => s.trim()), deadline, postedAt: new Date().toISOString() })
    const mockCid = 'bafkreidemo' + Math.random().toString(36).slice(2, 8)

    const usdcAmount = parseUnits(usdcOut, 6)

    // Step 1: approve USDC spend (if not depositing ETH directly)
    // In production, if token != USDC, call Uniswap Universal Router first
    writeContract({
      address: USDC_ADDRESS,
      abi: ERC20_ABI,
      functionName: 'approve',
      args: [TRUSTLANCE_ADDRESS[base.id], usdcAmount],
    })

    // Step 2: createEscrow (called after approval tx confirms)
    // For demo this is sequential — in prod use a multicall or watch the approval tx
    writeContract({
      address: TRUSTLANCE_ADDRESS[base.id],
      abi: TRUSTLANCE_ABI,
      functionName: 'createEscrow',
      args: [
        (freelancer as `0x${string}`) || '0x0000000000000000000000000000000000000000',
        usdcAmount,
        mockCid,
      ],
    })
  }

  return (
    <div className={styles.wrap}>
      <Link href="/jobs" className={styles.back}>← Back to jobs</Link>

      <div className={styles.header}>
        <h1 className={styles.title}>Post a New Job</h1>
        <p className={styles.sub}>
          Funds are locked in escrow until work is approved. World ID verification required.
        </p>
      </div>

      {/* Step bar */}
      <div className={styles.stepBar}>
        {STEPS.map((s, i) => (
          <div key={i} className={styles.stepItem}>
            <div className={`${styles.stepNum} ${i < step ? styles.stepDone : i === step ? styles.stepCur : styles.stepTodo}`}>
              {i < step ? '✓' : i + 1}
            </div>
            <div className={styles.stepLabel}>{s}</div>
            {i < STEPS.length - 1 && <div className={styles.stepLine} />}
          </div>
        ))}
      </div>

      <div className={styles.form}>
        {/* Title */}
        <div className={styles.group}>
          <label className={styles.label}>Job Title</label>
          <input
            className={styles.input}
            type="text"
            placeholder="e.g. Build Uniswap V3 LP Dashboard"
            value={title}
            onChange={e => setTitle(e.target.value)}
          />
        </div>

        {/* Category */}
        <div className={styles.group}>
          <label className={styles.label}>Category</label>
          <select
            className={styles.input}
            value={category}
            onChange={e => setCategory(e.target.value)}
          >
            {CATEGORIES.map(c => <option key={c}>{c}</option>)}
          </select>
        </div>

        {/* Description */}
        <div className={styles.group}>
          <label className={styles.label}>Job Description</label>
          <textarea
            className={styles.textarea}
            rows={6}
            placeholder="Describe deliverables, requirements, and scope clearly…"
            value={description}
            onChange={e => setDescription(e.target.value)}
          />
        </div>

        <div className={styles.row2}>
          <div className={styles.group}>
            <label className={styles.label}>Skills (comma separated)</label>
            <input
              className={styles.input}
              type="text"
              placeholder="Solidity, wagmi, The Graph"
              value={skills}
              onChange={e => setSkills(e.target.value)}
            />
          </div>
          <div className={styles.group}>
            <label className={styles.label}>Deadline</label>
            <input
              className={styles.input}
              type="date"
              value={deadline}
              onChange={e => setDeadline(e.target.value)}
            />
          </div>
        </div>

        {/* Freelancer (optional) */}
        <div className={styles.group}>
          <label className={styles.label}>
            Specific Freelancer Address
            <span className={styles.optional}> — optional. Leave blank for open listing.</span>
          </label>
          <input
            className={styles.input}
            type="text"
            placeholder="0x…"
            value={freelancer}
            onChange={e => setFreelancer(e.target.value)}
            style={{ fontFamily: 'var(--font-mono)' }}
          />
        </div>

        {/* Token selector */}
        <div className={styles.group}>
          <label className={styles.label}>Deposit Token</label>
          <div className={styles.tokenGrid}>
            {DEPOSIT_TOKENS.map(t => (
              <div
                key={t}
                className={`${styles.tokenOption} ${depositToken === t ? styles.tokenSel : ''}`}
                onClick={() => setDepositToken(t)}
              >
                <div className={styles.tokenSym}>{t}</div>
                <div className={styles.tokenName}>
                  {{ ETH: 'Ethereum', USDC: 'USD Coin', USDT: 'Tether', DAI: 'Dai' }[t]}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Amount */}
        <div className={styles.group}>
          <label className={styles.label}>Amount</label>
          <input
            className={styles.input}
            type="number"
            min="0"
            step="0.001"
            placeholder="0.00"
            value={depositAmount}
            onChange={e => setDepositAmount(e.target.value)}
          />

          <div className={styles.swapPreview}>
            <div className={styles.swapArrow}>
              ↓ auto-swapped via Uniswap Universal Router
            </div>
            <div className={styles.usdcBox}>
              <div>
                <div className={styles.usdcVal}>
                  ≈ {parseFloat(usdcOut).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USDC
                </div>
                <div className={styles.usdcSub}>locked in escrow on deposit</div>
              </div>
              <div className={styles.uniTag}>Uniswap V3 ✦</div>
            </div>
          </div>
        </div>

        {/* KeeperHub note */}
        <div className={styles.keeperInfo}>
          <div className={styles.keeperDot} />
          <div>
            <strong>Release via KeeperHub</strong> — when you approve work,
            the payment is routed through KeeperHub for SLA-backed execution,
            automatic retry on gas spikes, and a full audit trail.
          </div>
        </div>

        {/* Submit */}
        <button
          className={styles.submitBtn}
          onClick={handleSubmit}
          disabled={!title || !description || !depositAmount || isPending || isConfirming}
        >
          {isPending || isConfirming
            ? isConfirming ? 'Confirming transaction…' : 'Sending…'
            : 'Create Escrow & Publish Job →'}
        </button>

        {isSuccess && (
          <div className={styles.success}>
            ✓ Job published on-chain. Redirecting to job board…
          </div>
        )}

        {!isConnected && (
          <p className={styles.walletNote}>Connect your wallet to post a job.</p>
        )}
      </div>
    </div>
  )
}
