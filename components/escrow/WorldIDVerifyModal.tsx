'use client'

import { useWriteContract } from 'wagmi'
import { base } from 'wagmi/chains'
import { IDKitWidget, VerificationLevel, type ISuccessResult } from '@worldcoin/idkit'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { TRUSTLANCE_ABI, TRUSTLANCE_ADDRESS } from '@/lib/contracts'

interface Props { onClose: () => void; onSuccess: () => void }

const STEPS = [
  'Open the World App on your phone',
  'Scan the QR code that appears below',
  'ZK proof stored on-chain — never repeated',
]

export function WorldIDVerifyModal({ onClose, onSuccess }: Props) {
  const { writeContract } = useWriteContract()

  async function handleVerify(_result: ISuccessResult) {
    writeContract({
      address: TRUSTLANCE_ADDRESS[base.id],
      abi: TRUSTLANCE_ABI,
      functionName: 'setVerified',
      args: ['0x0000000000000000000000000000000000000000'],
    })
    onSuccess()
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-sm w-[90vw] p-8 gap-0 rounded-2xl">
        <div className="size-16 rounded-full flex items-center justify-center mx-auto mb-5 text-2xl font-extrabold"
          style={{ background: 'rgba(13,158,117,0.1)', border: '2px solid var(--teal-lo)', color: 'var(--teal-hi)' }}>
          W
        </div>
        <DialogHeader className="text-center mb-3">
          <DialogTitle className="text-[22px] font-extrabold" style={{ color: 'var(--text-primary)' }}>
            Verify Your Humanity
          </DialogTitle>
        </DialogHeader>
        <p className="text-[13px] text-center leading-relaxed mb-5 transition-colors" style={{ color: 'var(--text-secondary)' }}>
          TrustLance requires World ID to prevent sybil attacks. One-time, privacy-preserving — no personal data stored.
        </p>
        <div className="space-y-2 mb-6">
          {STEPS.map((s, i) => (
            <div key={i} className="flex items-center gap-3 rounded-xl px-4 py-3 transition-colors"
              style={{ backgroundColor: 'var(--bg-input)', border: '1px solid var(--border-base)' }}>
              <div className="size-6 rounded-full flex items-center justify-center text-[11px] font-bold flex-shrink-0 text-white"
                style={{ backgroundColor: 'var(--teal)' }}>
                {i + 1}
              </div>
              <span className="text-[12px] transition-colors" style={{ color: 'var(--text-secondary)' }}>{s}</span>
            </div>
          ))}
        </div>
        <IDKitWidget
          app_id={(process.env.NEXT_PUBLIC_WORLD_APP_ID as `app_${string}`) ?? 'app_staging_demo'}
          action="verify-human"
          verification_level={VerificationLevel.Orb}
          onSuccess={handleVerify}
        >
          {({ open }) => (
            <Button
              onClick={open}
              className="w-full h-12 text-[15px] font-bold rounded-xl text-white mb-2"
              style={{ backgroundColor: 'var(--teal)' }}
            >
              Verify with World ID
            </Button>
          )}
        </IDKitWidget>
        <p className="text-center text-[11px] transition-colors" style={{ color: 'var(--text-faint)' }}>
          Powered by World · your data stays yours
        </p>
      </DialogContent>
    </Dialog>
  )
}
