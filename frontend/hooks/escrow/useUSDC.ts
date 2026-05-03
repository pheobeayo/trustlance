'use client'
import { useReadContracts, useWriteContract, useWaitForTransactionReceipt, useChainId } from 'wagmi'
import { parseUnits, maxUint256 } from 'viem'
import { ERC20_ABI, getUSDCAddress, getEscrowAddress } from '@/lib/contracts'

export function useUSDC(walletAddress: `0x${string}` | undefined) {
  const chainId     = useChainId()
  const usdcAddress = getUSDCAddress(chainId)
  const escrowAddr  = getEscrowAddress(chainId)

  const { data, refetch } = useReadContracts({
    contracts: [
      {
        address:      usdcAddress,
        abi:          ERC20_ABI,
        functionName: 'balanceOf',
        args:         walletAddress ? [walletAddress] : undefined,
      },
      {
        address:      usdcAddress,
        abi:          ERC20_ABI,
        functionName: 'allowance',
        args:         walletAddress ? [walletAddress, escrowAddr] : undefined,
      },
    ],
    query: {
      enabled:         !!walletAddress,
      refetchInterval: 8_000,
    },
  })

  const balance   = (data?.[0]?.result ?? 0n) as bigint
  const allowance = (data?.[1]?.result ?? 0n) as bigint

  const { writeContract, data: txHash, isPending } = useWriteContract()
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash: txHash })

  /** Approve exactly `amount` USDC to the escrow */
  function approve(amount: bigint) {
    writeContract({
      address:      usdcAddress,
      abi:          ERC20_ABI,
      functionName: 'approve',
      args:         [escrowAddr, amount],
    })
  }

  /** Approve unlimited USDC to the escrow */
  function approveMax() {
    writeContract({
      address:      usdcAddress,
      abi:          ERC20_ABI,
      functionName: 'approve',
      args:         [escrowAddr, maxUint256],
    })
  }

  /** True if escrow can already spend at least `amount` USDC */
  function hasAllowance(amount: bigint) {
    return allowance >= amount
  }

  /** Format USDC balance to human-readable string */
  function formatUSDC(raw: bigint) {
    return (Number(raw) / 1e6).toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
  }

  return {
    balance,
    allowance,
    formatUSDC,
    hasAllowance,
    approve,
    approveMax,
    isApproving:   isPending || isConfirming,
    approveSuccess: isSuccess,
    refetch,
  }
}
