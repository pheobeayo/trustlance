'use client'
import { useWriteContract, useWaitForTransactionReceipt, useChainId } from 'wagmi'
import { ESCROW_ABI, getEscrowAddress } from '@/lib/contracts'

/**
 * useJobActions — wraps every write function that acts on an existing job:
 *   acceptJob · submitWork · approveWork · reclaimAfterTimeout · cancelJob
 *
 * Each action shares the same tx tracking state — only one pending at a time.
 */
export function useJobActions(jobId: bigint | undefined) {
  const chainId    = useChainId()
  const escrowAddr = getEscrowAddress(chainId)

  const { writeContract, data: txHash, isPending, error, reset } = useWriteContract()
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash: txHash })

  const isBusy = isPending || isConfirming

  function write(functionName: string, extraArgs: unknown[] = []) {
    if (!jobId) return
    writeContract({
      address:      escrowAddr,
      abi:          ESCROW_ABI,
      functionName: functionName as any,
      args:         [jobId, ...extraArgs] as any,
    })
  }

  return {
    /** Freelancer accepts an open job. Starts 30-day clock. */
    acceptJob: () => write('acceptJob'),

    /** Freelancer submits IPFS deliverable CID. */
    submitWork: (ipfsDeliverable: string) => write('submitWork', [ipfsDeliverable]),

    /** Client approves delivered work — registers KeeperHub task. */
    approveWork: () => write('approveWork'),

    /** Freelancer self-reclaims after 30-day timeout. */
    reclaimAfterTimeout: () => write('reclaimAfterTimeout'),

    /** Client cancels an Open job for full USDC refund. */
    cancelJob: () => write('cancelJob'),

    // tx state
    txHash,
    isPending,
    isConfirming,
    isSuccess,
    isBusy,
    error,
    reset,
  }
}
