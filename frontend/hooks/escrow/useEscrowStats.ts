'use client'
import { useReadContracts, useChainId } from 'wagmi'
import { ESCROW_ABI, getEscrowAddress } from '@/lib/contracts'

export function useEscrowStats() {
  const chainId    = useChainId()
  const escrowAddr = getEscrowAddress(chainId)

  const { data, isLoading } = useReadContracts({
    contracts: [
      { address: escrowAddr, abi: ESCROW_ABI, functionName: 'totalLockedUSDC' },
      { address: escrowAddr, abi: ESCROW_ABI, functionName: 'feeBps' },
      { address: escrowAddr, abi: ESCROW_ABI, functionName: 'nextJobId' },
      { address: escrowAddr, abi: ESCROW_ABI, functionName: 'accruedFees' },
      { address: escrowAddr, abi: ESCROW_ABI, functionName: 'paused' },
    ],
    query: { refetchInterval: 15_000 },
  })

  const totalLockedRaw = (data?.[0]?.result ?? 0n) as bigint
  const feeBps         = (data?.[1]?.result ?? 0n) as bigint
  const nextJobId      = (data?.[2]?.result ?? 1n) as bigint
  const accruedFees    = (data?.[3]?.result ?? 0n) as bigint
  const paused         = (data?.[4]?.result ?? false) as boolean

  const totalJobs = nextJobId > 1n ? Number(nextJobId) - 1 : 0

  function fmt(raw: bigint) {
    return (Number(raw) / 1e6).toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
  }

  return {
    totalLockedUSDC:       totalLockedRaw,
    totalLockedFormatted:  fmt(totalLockedRaw),
    feeBps,
    feePercent:            `${Number(feeBps) / 100}%`,
    nextJobId,
    totalJobs,
    accruedFees,
    accruedFeesFormatted:  fmt(accruedFees),
    paused,
    isLoading,
  }
}
