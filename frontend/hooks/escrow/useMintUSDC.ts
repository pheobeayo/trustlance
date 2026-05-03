'use client'
import { useWriteContract, useWaitForTransactionReceipt, useChainId } from 'wagmi'
import { parseUnits } from 'viem'
import { ERC20_ABI, getUSDCAddress } from '@/lib/contracts'

/**
 * Dev-only: mint USDC from the MockERC20 contract.
 * This function only exists on the testnet MockERC20 — not on real USDC.
 */
export function useMintUSDC() {
  const chainId     = useChainId()
  const usdcAddress = getUSDCAddress(chainId)

  const { writeContract, data: txHash, isPending } = useWriteContract()
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash: txHash })

  function mint(to: `0x${string}`, amountHuman: string) {
    writeContract({
      address:      usdcAddress,
      abi:          ERC20_ABI,
      functionName: 'mint',
      args:         [to, parseUnits(amountHuman, 6)],
    })
  }

  return {
    mint,
    isBusy:    isPending || isConfirming,
    isSuccess,
    txHash,
  }
}
