'use client'
import { useReadContracts, useReadContract, useChainId } from 'wagmi'
import { ESCROW_ABI, getEscrowAddress, isSupportedChain, JOB_STATUS_LABEL } from '@/lib/contracts'
import type { Job } from './useJob'

export function useJobs(nextJobId: bigint | undefined, count = 20) {
  const chainId   = useChainId()
  const supported = isSupportedChain(chainId)
  const address   = getEscrowAddress(chainId)

  const ids: bigint[] = []
  if (supported && nextJobId !== undefined && nextJobId > 1n) {
    const from = nextJobId - 1n
    const to   = from - BigInt(count) + 1n
    for (let id = from; id >= (to > 0n ? to : 1n); id--) {
      ids.push(id)
    }
  }

  const { data, isLoading, error } = useReadContracts({
    contracts: ids.map(jobId => ({
      address,
      abi:          ESCROW_ABI,
      functionName: 'getJob' as const,
      args:         [jobId] as const,
    })),
    query: {
      enabled:         supported && ids.length > 0,
      refetchInterval: 10_000,
      staleTime:       5_000,
    },
  })

  const jobs: (Job & { id: bigint })[] = []
  data?.forEach((result, i) => {
    if (result.status === 'success' && result.result) {
      const raw = result.result as any
      jobs.push({
        id:          ids[i],
        ...raw,
        status:      Number(raw.status),
        statusLabel: JOB_STATUS_LABEL[Number(raw.status)] ?? 'Unknown',
      })
    }
  })

  return { jobs, isLoading, error }
}

export function useNextJobId() {
  const chainId   = useChainId()
  const supported = isSupportedChain(chainId)

  const { data, isLoading } = useReadContract({
    address:      getEscrowAddress(chainId),
    abi:          ESCROW_ABI,
    functionName: 'nextJobId',
    query: {
      enabled:         supported,
      refetchInterval: 10_000,
    },
  })
  return { nextJobId: data as bigint | undefined, isLoading }
}
