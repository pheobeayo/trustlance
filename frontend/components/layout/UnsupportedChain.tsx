'use client'
import { useChainId, useSwitchChain } from 'wagmi'
import { isSupportedChain, CHAIN_ID } from '@/lib/contracts'

export function UnsupportedChainBanner() {
  const chainId = useChainId()
  const { switchChain } = useSwitchChain()

  // No wallet connected yet — don't show anything
  if (!chainId) return null

  // On supported chain — don't show anything
  if (isSupportedChain(chainId)) return null

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-4 rounded-2xl px-5 py-3 shadow-xl text-[13px] font-semibold"
      style={{ backgroundColor: 'var(--bg-card)', border: '1px solid #c8921e', color: '#c8921e' }}>
      <span>⚠ Switch to 0G Galileo Testnet to use TrustLance</span>
      <button
        onClick={() => switchChain({ chainId: CHAIN_ID.OG_TESTNET })}
        className="rounded-lg px-3 py-1 text-[12px] font-bold text-white"
        style={{ backgroundColor: '#c8921e' }}>
        Switch Network
      </button>
    </div>
  )
}
