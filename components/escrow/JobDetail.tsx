'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { base } from 'wagmi/chains'
import { parseUnits } from 'viem'
import type { Job, DepositToken } from '@/types'
import { DEPOSIT_TOKENS } from '@/types'
import { formatUSDC, shortAddress } from '@/lib/mockData'
import { TRUSTLANCE_ABI, TRUSTLANCE_ADDRESS, ERC20_ABI, USDC_ADDRESS } from '@/lib/contracts'
import { WorldIDVerifyModal } from './WorldIDVerifyModal'
import styles from './JobDetail.module.css'

const STATUS_LABELS: Record<string, string> = {
  Open: 'Open', InProgress: 'In Progress', Delivered: 'In Review',
  Completed: 'Completed', Reclaimed: 'Reclaimed',
}

const ETH_PRICE_USD = 2750  // mock — replace with Chainlink feed

interface TimelineStep {
  label: string
  sub: string
  state: 'done' | 'current' | 'upcoming'
}

function getTimeline(status: string): TimelineStep[] {
  const steps = [
    { label: 'Job Created',        sub: 'Funds deposited & locked in escrow' },
    { label: 'Client Verified',    sub: 'World ID confirmed — unique human'  },
    { label: 'Freelancer Accepts', sub: 'Verified freelancer accepts the job' },
    { label: 'Work Delivered',     sub: 'IPFS deliverable submitted'         },
    { label: 'Payment Released',   sub: 'Via KeeperHub — SLA guaranteed'     },
  ]
  const doneCount =
    status === 'Open'       ? 2 :
    status === 'InProgress' ? 3 :
    status === 'Delivered'  ? 4 :
    5

  return steps.map((s, i) => ({
    ...s,
    state: i < doneCount ? 'done' : i === doneCount ? 'current' : 'upcoming',
  }))
}

export function JobDetail({ job }: { job: Job }) {
  const { address, isConnected } = useAccount()
  const [selectedToken, setSelectedToken] = useState<DepositToken>('ETH')
  const [showVerifyModal, setShowVerifyModal] = useState(false)
  const [deliverableUrl, setDeliverableUrl] = useState('')

  /* ── Verification check ─────────────────────────────────────────────── */
  const { data: isVerified } = useReadContract({
    address: TRUSTLANCE_ADDRESS[base.id],
    abi: TRUSTLANCE_ABI,
    functionName: 'isVerified',
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  })

  /* ── Contract writes ────────────────────────────────────────────────── */
  const { writeContract, data: txHash, isPending } = useWriteContract()
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash: txHash })

  const isClient    = address?.toLowerCase() === job.client.toLowerCase()
  const isFreelancer = address && job.freelancer
    ? address.toLowerCase() === job.freelancer.toLowerCase()
    : false

  /* ── Actions ────────────────────────────────────────────────────────── */
  function handleAcceptJob() {
    if (!isVerified) { setShowVerifyModal(true); return }
    writeContract({
      address: TRUSTLANCE_ADDRESS[base.id],
      abi: TRUSTLANCE_ABI,
      functionName: 'acceptJob',
      args: [BigInt(job.id)],
    })
  }

  function handleSubmitWork() {
    if (!deliverableUrl) return
    writeContract({
      address: TRUSTLANCE_ADDRESS[base.id],
      abi: TRUSTLANCE_ABI,
      functionName: 'submitWork',
      args: [BigInt(job.id), deliverableUrl],
    })
  }

  function handleApproveRelease() {
    // In production, this call is routed via KeeperHub SDK
    writeContract({
      address: TRUSTLANCE_ADDRESS[base.id],
      abi: TRUSTLANCE_ABI,
      functionName: 'approveAndRelease',
      args: [BigInt(job.id)],
    })
  }

  function handleReclaim() {
    writeContract({
      address: TRUSTLANCE_ADDRESS[base.id],
      abi: TRUSTLANCE_ABI,
      functionName: 'reclaimAfterTimeout',
      args: [BigInt(job.id)],
    })
  }

  /* ── Derived ────────────────────────────────────────────────────────── */
  const usdcAmt  = formatUSDC(job.amountUSDC)
  const ethAmt   = (Number(job.amountUSDC) / 1e6 / ETH_PRICE_USD).toFixed(4)
  const timeline = getTimeline(job.status)

  /* ── CTA button logic ───────────────────────────────────────────────── */
  function renderCTA() {
    const busy = isPending || isConfirming
    const busyLabel = isConfirming ? 'Confirming…' : 'Sending…'

    if (!isConnected) return (
      <div className={styles.ctaNote}>Connect your wallet to interact</div>
    )

    if (job.status === 'Open' && !isClient) return (
      <button
        className={styles.ctaBtn}
        onClick={handleAcceptJob}
        disabled={busy}
      >
        {busy ? busyLabel : isVerified ? 'Accept Job' : 'Verify & Accept →'}
      </button>
    )

    if (job.status === 'InProgress' && isFreelancer) return (
      <div className={styles.submitWrap}>
        <input
          className={styles.delivInput}
          placeholder="IPFS CID or deliverable URL"
          value={deliverableUrl}
          onChange={e => setDeliverableUrl(e.target.value)}
        />
        <button
          className={styles.ctaBtn}
          onClick={handleSubmitWork}
          disabled={busy || !deliverableUrl}
        >
          {busy ? busyLabel : 'Submit Deliverable'}
        </button>
      </div>
    )

    if (job.status === 'Delivered' && isClient) return (
      <div>
        <button className={styles.ctaBtn} onClick={handleApproveRelease} disabled={busy}>
          {busy ? busyLabel : 'Approve & Release via KeeperHub'}
        </button>
        <p className={styles.keeperNote}>
          <span className={styles.keeperDot} />
          SLA-backed execution · automatic retry · audit trail
        </p>
      </div>
    )

    if ((job.status === 'InProgress' || job.status === 'Delivered') && isFreelancer) {
      const timeoutDate = new Date((job.acceptedAt + 30 * 86400) * 1000)
      const canReclaim  = Date.now() > timeoutDate.getTime()
      return (
        <div>
          {canReclaim ? (
            <button className={styles.ctaBtn} onClick={handleReclaim} disabled={busy}>
              {busy ? busyLabel : 'Reclaim After Timeout'}
            </button>
          ) : (
            <div className={styles.ctaNote}>
              Timeout available: {timeoutDate.toLocaleDateString()}
            </div>
          )}
        </div>
      )
    }

    if (isSuccess) return (
      <div className={styles.successMsg}>✓ Transaction confirmed</div>
    )

    return null
  }

  return (
    <>
      <div className={styles.layout}>
        {/* ── Main panel ── */}
        <div className={styles.main}>
          <Link href="/jobs" className={styles.back}>
            ← Back to jobs
          </Link>

          <div className={styles.metaRow}>
            <span className={styles.catPill}>{job.category}</span>
            <span className={`${styles.status} ${styles[`status_${job.status}`]}`}>
              <span className={styles.statusDot} />
              {STATUS_LABELS[job.status]}
            </span>
          </div>

          <h1 className={styles.title}>{job.title}</h1>

          <div className={styles.metaGrid}>
            <div className={styles.metaItem}>
              <strong>{job.deadline ? new Date(job.deadline).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : '—'}</strong>
              <span>Deadline</span>
            </div>
            <div className={styles.metaItem}>
              <strong>{job.postedAt ? new Date(job.postedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '—'}</strong>
              <span>Posted</span>
            </div>
            <div className={styles.metaItem}>
              <strong>{shortAddress(job.client)}</strong>
              <span>Client</span>
            </div>
          </div>

          <hr className={styles.divider} />

          <div className={styles.body}>
            {job.description?.split('\n').map((p, i) => <p key={i}>{p}</p>)}
          </div>

          <div className={styles.skillsSection}>
            <div className={styles.sectionLabel}>Required Skills</div>
            <div className={styles.skillsRow}>
              {job.skills?.map(s => (
                <span key={s} className={styles.skill}>{s}</span>
              ))}
            </div>
          </div>

          <hr className={styles.divider} />

          <div className={styles.sectionLabel} style={{ marginBottom: '16px' }}>Escrow Timeline</div>
          <div className={styles.timeline}>
            {timeline.map((step, i) => (
              <div key={i} className={styles.tlRow}>
                <div className={styles.tlCol}>
                  <div className={`${styles.tlDot} ${styles[`tl_${step.state}`]}`}>
                    {step.state === 'done' ? '✓' : i + 1}
                  </div>
                  {i < timeline.length - 1 && <div className={styles.tlLine} />}
                </div>
                <div className={styles.tlInfo}>
                  <div className={styles.tlLabel}>{step.label}</div>
                  <div className={step.state === 'done' ? styles.tlDoneText : styles.tlSubText}>
                    {step.sub}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Sidebar ── */}
        <aside className={styles.sidebar}>
          {/* Escrow amount */}
          <div className={styles.sCard}>
            <div className={styles.sCardTitle}>Escrow Amount</div>
            <div className={styles.priceBig}>
              ${usdcAmt} <sub>USDC</sub>
            </div>
            <div className={styles.priceNote}>≈ {ethAmt} ETH at current rate</div>
            <p className={styles.swapNote}>
              Deposit in any token — auto-swapped via Uniswap Universal Router
            </p>
            <div className={styles.tokenGrid}>
              {DEPOSIT_TOKENS.map(t => (
                <button
                  key={t}
                  className={`${styles.tokBtn} ${selectedToken === t ? styles.tokSel : ''}`}
                  onClick={() => setSelectedToken(t)}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Client */}
          <div className={styles.sCard}>
            <div className={styles.sCardTitle}>Client</div>
            <div className={styles.clientRow}>
              <div className={styles.avatarLg}>
                {job.client.slice(2, 4).toUpperCase()}
              </div>
              <div>
                <div className={styles.clientName}>{shortAddress(job.client)}</div>
                <div className={styles.clientTag}>✓ World ID Verified</div>
              </div>
            </div>
            <div className={styles.worldRow}>
              <div className={styles.worldOrb}>W</div>
              Unique human · sybil-resistant
            </div>
          </div>

          {/* CTA */}
          <div className={styles.ctaArea}>
            {renderCTA()}
          </div>
        </aside>
      </div>

      {/* World ID Verify Modal */}
      {showVerifyModal && (
        <WorldIDVerifyModal
          onClose={() => setShowVerifyModal(false)}
          onSuccess={() => {
            setShowVerifyModal(false)
            handleAcceptJob()
          }}
        />
      )}
    </>
  )
}
