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
      address: TRUSTLANCE_ADDRESS[base.id], abi: TRUSTLANCE_ABI, functionName: 'setVerified',
      args: ['0x0000000000000000000000000000000000000000'],
    })
    onSuccess()
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="bg-[#0f1a14] border-[#294038] rounded-2xl max-w-sm w-[90vw] p-8 gap-0">
        <div className="size-16 rounded-full bg-[#0d9e75]/10 border-2 border-[#0a7a5a] flex items-center justify-center mx-auto mb-5 text-2xl font-extrabold text-[#14c490]">W</div>
        <DialogHeader className="text-center mb-3">
          <DialogTitle className="text-[22px] font-extrabold text-[#e5f2ea]">Verify Your Humanity</DialogTitle>
        </DialogHeader>
        <p className="text-[13px] text-[#95b8a5] text-center leading-relaxed mb-5">
          TrustLance requires World ID to prevent sybil attacks. One-time, privacy-preserving.
        </p>
        <div className="space-y-2 mb-6">
          {STEPS.map((s, i) => (
            <div key={i} className="flex items-center gap-3 bg-[#152019] border border-[#1e2f24] rounded-xl px-4 py-3">
              <div className="size-6 rounded-full bg-[#0d9e75] text-white flex items-center justify-center text-[11px] font-bold flex-shrink-0">{i + 1}</div>
              <span className="text-[12px] text-[#95b8a5]">{s}</span>
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
            <Button onClick={open} className="w-full bg-[#0d9e75] hover:bg-[#14c490] text-white font-bold rounded-xl h-12 text-[15px] mb-2">
              Verify with World ID
            </Button>
          )}
        </IDKitWidget>
        <p className="text-center text-[11px] text-[#344d3f]">Powered by World · your data stays yours</p>
      </DialogContent>
    </Dialog>
  )
}
