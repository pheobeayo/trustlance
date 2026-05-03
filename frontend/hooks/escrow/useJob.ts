'use client'
import { useReadContract, useChainId } from 'wagmi'
import { ESCROW_ABI, getEscrowAddress, isSupportedChain, JOB_STATUS_LABEL, JobStatus } from '@/lib/contracts'

export type Job = {
  client:          `0x${string}`
  freelancer:      `0x${string}`
  amountUSDC:      bigint
  createdAt:       bigint
  acceptedAt:      bigint
  approvedAt:      bigint
  status:          number
  statusLabel:     string
  keeperTaskId:    `0x${string}`
  ipfsJobSpec:     string
  ipfsDeliverable: string
}

export function useJob(jobId: bigint | undefined) {
  const chainId   = useChainId()
  const supported = isSupportedChain(chainId)

  const { data, isLoading, error, refetch } = useReadContract({
    address:      getEscrowAddress(chainId),
    abi:          ESCROW_ABI,
    functionName: 'getJob',
    args:         jobId !== undefined ? [jobId] : undefined,
    query: {
      enabled:         supported && jobId !== undefined && jobId > 0n,
      refetchInterval: 8_000,
      staleTime:       4_000,
    },
  })

  const job: Job | undefined = data
    ? {
        ...(data as any),
        status:      Number((data as any).status),
        statusLabel: JOB_STATUS_LABEL[Number((data as any).status)] ?? 'Unknown',
      }
    : undefined

  return { job, isLoading: supported ? isLoading : false, error, refetch }
}

export function useJobRole(job: Job | undefined, address: `0x${string}` | undefined) {
  if (!job || !address) return { isClient: false, isFreelancer: false }
  const addr = address.toLowerCase()
  return {
    isClient:     job.client.toLowerCase()     === addr,
    isFreelancer: job.freelancer.toLowerCase() === addr,
  }
}
