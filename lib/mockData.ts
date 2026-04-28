import type { Job } from '@/types'

export const MOCK_JOBS: Job[] = [
  {
    id: 1,
    client: '0x7f3a4B2C9dE88f1a0234567890abcdef12345678',
    freelancer: null,
    amountUSDC: BigInt(2400 * 1e6),
    ipfsJobSpec: 'bafkreih7q2vhm4',
    ipfsDeliverable: null,
    status: 'Open',
    acceptedAt: 0,
    title: 'Build Uniswap V3 LP Management Dashboard',
    description:
      "We need an experienced Solidity + React dev to build a liquidity management dashboard for Uniswap V3 positions. The tool should let LPs track, rebalance, and auto-compound across multiple pools. Frontend in Next.js, subgraph via The Graph, on-chain reads via viem/wagmi. Display tick ranges, current price vs position, fee earnings, and IL estimates. Deliverables include position NFT fetching, pool price charts (7d/30d), single-click rebalance via a Solidity helper contract, and fee reinvestment logic.",
    category: 'Smart Contracts',
    skills: ['Solidity', 'Next.js', 'Uniswap V3', 'The Graph', 'viem/wagmi', 'TypeScript'],
    deadline: '2026-05-15',
    postedAt: '2026-04-25',
  },
  {
    id: 2,
    client: '0x3B9aC9ff0000000000000000000000000000cafe',
    freelancer: null,
    amountUSDC: BigInt(1800 * 1e6),
    ipfsJobSpec: 'bafkreih7q2vhm5',
    ipfsDeliverable: null,
    status: 'Open',
    acceptedAt: 0,
    title: 'DEX Swap Interface — React + Wagmi',
    description:
      'Senior frontend dev to build a clean, accessible swap UI connecting to an existing Solidity escrow backend. Real-time price feeds required. Mobile-responsive, dark-mode first.',
    category: 'Frontend',
    skills: ['React', 'TypeScript', 'wagmi', 'viem', 'TailwindCSS'],
    deadline: '2026-05-20',
    postedAt: '2026-04-27',
  },
  {
    id: 3,
    client: '0xdeadbeef00000000000000000000000000001234',
    freelancer: null,
    amountUSDC: BigInt(5500 * 1e6),
    ipfsJobSpec: 'bafkreih7q2vhm6',
    ipfsDeliverable: null,
    status: 'Open',
    acceptedAt: 0,
    title: 'Security Audit — ERC-4337 Paymaster Contract',
    description:
      'Full audit of a custom ERC-4337 paymaster for a B2B gasless transaction product. Detailed written report with severity ratings required. Must have prior audit experience with AA contracts.',
    category: 'Auditing',
    skills: ['Smart Contract Security', 'ERC-4337', 'Solidity', 'Static Analysis'],
    deadline: '2026-05-10',
    postedAt: '2026-04-23',
  },
  {
    id: 4,
    client: '0xAbCdEf0000000000000000000000000000009999',
    freelancer: null,
    amountUSDC: BigInt(3200 * 1e6),
    ipfsJobSpec: 'bafkreih7q2vhm7',
    ipfsDeliverable: null,
    status: 'Open',
    acceptedAt: 0,
    title: 'Solana Program: Token Vesting Schedule (Anchor)',
    description:
      'Write a production-quality Anchor program for token vesting supporting cliff, linear, and custom unlock schedules. Comprehensive test suite required. Must be deployable to mainnet-beta.',
    category: 'Rust / Solana',
    skills: ['Rust', 'Anchor', 'Solana', 'SPL Token'],
    deadline: '2026-05-25',
    postedAt: '2026-04-26',
  },
  {
    id: 5,
    client: '0x1111111111111111111111111111111111111111',
    freelancer: null,
    amountUSDC: BigInt(900 * 1e6),
    ipfsJobSpec: 'bafkreih7q2vhm8',
    ipfsDeliverable: null,
    status: 'Open',
    acceptedAt: 0,
    title: 'Developer Docs for ZK Proof SDK',
    description:
      'Technical writer with ZK knowledge needed. Write comprehensive docs for a zero-knowledge proof SDK targeting Web3 devs. Must understand Groth16/PLONK at a conceptual level.',
    category: 'Technical Writing',
    skills: ['ZK Proofs', 'Technical Writing', 'Markdown', 'API Docs'],
    deadline: '2026-05-08',
    postedAt: '2026-04-28',
  },
  {
    id: 6,
    client: '0x2222222222222222222222222222222222222222',
    freelancer: '0x3333333333333333333333333333333333333333',
    amountUSDC: BigInt(1600 * 1e6),
    ipfsJobSpec: 'bafkreih7q2vhm9',
    ipfsDeliverable: null,
    status: 'InProgress',
    acceptedAt: Math.floor(Date.now() / 1000) - 86400 * 5,
    title: 'ERC-20 Staking Contract with Reward Vesting',
    description:
      'Gas-efficient staking contract with configurable APR, withdrawal cooldown, and reward vesting over 6 months. Tests with Hardhat. OpenZeppelin base preferred.',
    category: 'Smart Contracts',
    skills: ['ERC-20', 'Staking', 'Hardhat', 'Solidity', 'OpenZeppelin'],
    deadline: '2026-05-18',
    postedAt: '2026-04-24',
  },
]

export function formatUSDC(amount: bigint): string {
  return (Number(amount) / 1e6).toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })
}

export function shortAddress(address: string): string {
  return `${address.slice(0, 6)}···${address.slice(-4)}`
}

export const CATEGORY_COLORS: Record<string, string> = {
  'Smart Contracts':   'teal',
  'Frontend':          'blue',
  'Auditing':          'amber',
  'Rust / Solana':     'coral',
  'Technical Writing': 'purple',
  'ZK / Crypto':       'pink',
}
