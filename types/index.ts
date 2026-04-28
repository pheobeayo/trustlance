export type JobStatus = 'Open' | 'InProgress' | 'Delivered' | 'Completed' | 'Reclaimed'

export interface Job {
  id: number
  client: string
  freelancer: string | null
  amountUSDC: bigint
  ipfsJobSpec: string
  ipfsDeliverable: string | null
  status: JobStatus
  acceptedAt: number
  // decoded from IPFS spec
  title?: string
  description?: string
  category?: string
  skills?: string[]
  deadline?: string
  postedAt?: string
}

export interface JobSpec {
  title: string
  description: string
  category: string
  skills: string[]
  deadline: string
  postedAt: string
}

export type DepositToken = 'ETH' | 'USDC' | 'USDT' | 'DAI'

export const DEPOSIT_TOKENS: DepositToken[] = ['ETH', 'USDC', 'USDT', 'DAI']

export const TOKEN_ADDRESSES: Record<string, Record<DepositToken, string>> = {
  // Base Mainnet
  '8453': {
    ETH:  '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE', // native
    USDC: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
    USDT: '0xfde4C96c8593536E31F229EA8f37b2ADa2699bb2',
    DAI:  '0x50c5725949A6F0c72E6C4a641F24049A917DB0Cb',
  },
}

export const USDC_DECIMALS = 6
