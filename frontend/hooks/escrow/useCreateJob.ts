'use client'
import { useWriteContract, useWaitForTransactionReceipt, useChainId } from 'wagmi'
import { parseUnits, zeroAddress } from 'viem'
import { ESCROW_ABI, getEscrowAddress } from '@/lib/contracts'

interface CreateWithUSDCArgs {
  amountUSDC: bigint        // e.g. parseUnits("100", 6)
  freelancer?: `0x${string}`
  ipfsJobSpec: string       // IPFS CID or JSON string
}

interface CreateWithETHArgs {
  amountETH:  bigint        // e.g. parseEther("0.1")
  minUSDC:    bigint        // slippage floor
  poolFee?:   number        // default 3000 (0.3%)
  freelancer?: `0x${string}`
  ipfsJobSpec: string
}

export function useCreateJob() {
  const chainId    = useChainId()
  const escrowAddr = getEscrowAddress(chainId)

  const { writeContract, data: txHash, isPending, error } = useWriteContract()
  const { isLoading: isConfirming, isSuccess, data: receipt } = useWaitForTransactionReceipt({ hash: txHash })

  function createWithUSDC({ amountUSDC, freelancer, ipfsJobSpec }: CreateWithUSDCArgs) {
    writeContract({
      address:      escrowAddr,
      abi:          ESCROW_ABI,
      functionName: 'createWithUSDC',
      args: [
        amountUSDC,
        freelancer ?? zeroAddress,
        ipfsJobSpec,
      ],
    })
  }

  function createWithETH({ amountETH, minUSDC, poolFee = 3000, freelancer, ipfsJobSpec }: CreateWithETHArgs) {
    writeContract({
      address:      escrowAddr,
      abi:          ESCROW_ABI,
      functionName: 'depositAndCreate',
      args: [
        zeroAddress,             // tokenIn = address(0) = native ETH
        amountETH,
        minUSDC,
        poolFee,
        freelancer ?? zeroAddress,
        ipfsJobSpec,
      ],
      value: amountETH,
    })
  }

  // Extract jobId from JobCreated event in the receipt
  const jobId = receipt?.logs
    .map(log => {
      try {
        // JobCreated is topic[0], jobId is topic[1] (indexed)
        if (log.topics[0] === '0x' + '0'.repeat(63) + '1') return null // placeholder
        const id = log.topics[1]
        return id ? BigInt(id) : null
      } catch { return null }
    })
    .find(id => id !== null && id !== undefined)

  return {
    createWithUSDC,
    createWithETH,
    txHash,
    isPending,
    isConfirming,
    isSuccess,
    error,
    jobId,
    isBusy: isPending || isConfirming,
  }
}
