'use client'
import { useReadContract, useChainId } from 'wagmi'
import { useEffect, useState } from 'react'
import { ESCROW_ABI, getEscrowAddress } from '@/lib/contracts'

export function useTimeout(jobId: bigint | undefined) {
  const chainId    = useChainId()
  const escrowAddr = getEscrowAddress(chainId)

  const { data: remaining, refetch } = useReadContract({
    address:      escrowAddr,
    abi:          ESCROW_ABI,
    functionName: 'timeoutRemainingSeconds',
    args:         jobId ? [jobId] : undefined,
    query: {
      enabled:         !!jobId,
      refetchInterval: 30_000,
    },
  })

  const [localRemaining, setLocalRemaining] = useState<bigint>(0n)

  useEffect(() => {
    if (remaining !== undefined) setLocalRemaining(remaining as bigint)
  }, [remaining])

  // Count down locally every second
  useEffect(() => {
    if (localRemaining <= 0n) return
    const t = setInterval(() => {
      setLocalRemaining(r => (r > 0n ? r - 1n : 0n))
    }, 1000)
    return () => clearInterval(t)
  }, [localRemaining])

  const canReclaim = localRemaining === 0n && !!jobId
  const days    = Number(localRemaining) / 86400
  const hours   = (Number(localRemaining) % 86400) / 3600
  const minutes = (Number(localRemaining) % 3600) / 60
  const seconds = Number(localRemaining) % 60

  function formatRemaining() {
    if (localRemaining === 0n) return 'Timeout elapsed'
    if (days >= 1) return `${Math.floor(days)}d ${Math.floor(hours % 24)}h remaining`
    if (hours >= 1) return `${Math.floor(hours)}h ${Math.floor(minutes)}m remaining`
    return `${Math.floor(minutes)}m ${Math.floor(seconds)}s remaining`
  }

  return {
    remainingSeconds: localRemaining,
    canReclaim,
    formatRemaining,
    refetch,
  }
}
