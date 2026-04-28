'use client'
import { useWriteContract } from 'wagmi'
import { base } from 'wagmi/chains'
import { IDKitWidget, VerificationLevel, type ISuccessResult } from '@worldcoin/idkit'
import { TRUSTLANCE_ABI, TRUSTLANCE_ADDRESS } from '@/lib/contracts'
import styles from './WorldIDVerifyModal.module.css'

interface Props {
  onClose:   () => void
  onSuccess: () => void
}

const STEPS = [
  'Open the World App on your phone',
  'Scan the QR code that appears below',
  'ZK proof stored on-chain — never repeated',
]

export function WorldIDVerifyModal({ onClose, onSuccess }: Props) {
  const { writeContract } = useWriteContract()

  async function handleVerify(result: ISuccessResult) {
    // After IDKit succeeds, call setVerified on our contract
    // In production, also call WorldIDRouter.verifyProof with the proof data
    writeContract({
      address: TRUSTLANCE_ADDRESS[base.id],
      abi: TRUSTLANCE_ABI,
      functionName: 'setVerified',
      // TODO: replace with actual WorldID proof verification call
      args: ['0x0000000000000000000000000000000000000000'],
    })
    onSuccess()
  }

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <button className={styles.close} onClick={onClose} aria-label="Close">✕</button>

        <div className={styles.icon}>W</div>
        <h2 className={styles.heading}>Verify Your Humanity</h2>
        <p className={styles.sub}>
          TrustLance requires World ID to prevent sybil attacks.
          One-time, privacy-preserving — no personal data stored.
        </p>

        <div className={styles.steps}>
          {STEPS.map((s, i) => (
            <div key={i} className={styles.step}>
              <div className={styles.stepNum}>{i + 1}</div>
              <div className={styles.stepText}>{s}</div>
            </div>
          ))}
        </div>

        <IDKitWidget
          app_id={process.env.NEXT_PUBLIC_WORLD_APP_ID as `app_${string}` ?? 'app_staging_demo'}
          action="verify-human"
          verification_level={VerificationLevel.Orb}
          onSuccess={handleVerify}
        >
          {({ open }) => (
            <button className={styles.cta} onClick={open}>
              Verify with World ID
            </button>
          )}
        </IDKitWidget>

        <p className={styles.footer}>Powered by World · your data stays yours</p>
      </div>
    </div>
  )
}
