// ─── 0G Chain IDs ─────────────────────────────────────────────────────────────
export const CHAIN_ID = {
  OG_TESTNET: 16602,
  OG_MAINNET: 16661,
  LOCAL:      31337,
} as const

// Fallback zero address — used when chain has no deployment
const ZERO = '0x0000000000000000000000000000000000000000' as `0x${string}`

// ─── Deployed addresses ───────────────────────────────────────────────────────
export const DEPLOYED: Record<number, {
  TrustLanceEscrow: `0x${string}`
  MockUSDC:         `0x${string}`
  MockWETH:         `0x${string}`
  MockRouter:       `0x${string}`
  MockPermit2:      `0x${string}`
  MockKeeperHub:    `0x${string}`
}> = {
  // 0G Galileo Testnet — live deployment
  [CHAIN_ID.OG_TESTNET]: {
    TrustLanceEscrow: '0xfE75E4472359968f5EEd507021616Ee8Fb6BD540',
    MockUSDC:         '0x592ABb32AeFBcD2457cC6f3818FAb471db8160fB',
    MockWETH:         '0xaf89d4F79c93E787FeD8Deac82Cc6D4c61c4bB1e',
    MockRouter:       '0x7e9e22e4D05B15C640b251Da2624e56a3cC2295B',
    MockPermit2:      '0xDA49e1bCc513226Dfa9c80FA16b04f104f6EBAe4',
    MockKeeperHub:    '0x2b8166fd6Ae1a4a216b3A2ABC80063147A65fb08',
  },
}

// ─── Safe address helpers — never throw, return ZERO for unknown chains ───────
export function getEscrowAddress(chainId: number): `0x${string}` {
  return DEPLOYED[chainId]?.TrustLanceEscrow ?? ZERO
}

export function getUSDCAddress(chainId: number): `0x${string}` {
  return DEPLOYED[chainId]?.MockUSDC ?? ZERO
}

/** True when the connected chain has a live TrustLance deployment */
export function isSupportedChain(chainId: number): boolean {
  return !!DEPLOYED[chainId]
}

// ─── TrustLanceEscrow ABI ─────────────────────────────────────────────────────
export const ESCROW_ABI = [
  // ── Write ──────────────────────────────────────────────────────────────────
  {
    name: 'depositAndCreate', type: 'function', stateMutability: 'payable',
    inputs: [
      { name: 'tokenIn',    type: 'address' },
      { name: 'amountIn',   type: 'uint256' },
      { name: 'minUSDC',    type: 'uint256' },
      { name: 'poolFee',    type: 'uint24'  },
      { name: 'freelancer', type: 'address' },
      { name: 'ipfsJobSpec',type: 'string'  },
    ],
    outputs: [{ name: 'jobId', type: 'uint256' }],
  },
  {
    name: 'createWithUSDC', type: 'function', stateMutability: 'nonpayable',
    inputs: [
      { name: 'amountUSDC', type: 'uint256' },
      { name: 'freelancer', type: 'address' },
      { name: 'ipfsJobSpec',type: 'string'  },
    ],
    outputs: [{ name: 'jobId', type: 'uint256' }],
  },
  {
    name: 'acceptJob', type: 'function', stateMutability: 'nonpayable',
    inputs: [{ name: 'jobId', type: 'uint256' }], outputs: [],
  },
  {
    name: 'submitWork', type: 'function', stateMutability: 'nonpayable',
    inputs: [
      { name: 'jobId',           type: 'uint256' },
      { name: 'ipfsDeliverable', type: 'string'  },
    ],
    outputs: [],
  },
  {
    name: 'approveWork', type: 'function', stateMutability: 'nonpayable',
    inputs: [{ name: 'jobId', type: 'uint256' }], outputs: [],
  },
  {
    name: '_executeRelease', type: 'function', stateMutability: 'nonpayable',
    inputs: [{ name: 'jobId', type: 'uint256' }], outputs: [],
  },
  {
    name: 'reclaimAfterTimeout', type: 'function', stateMutability: 'nonpayable',
    inputs: [{ name: 'jobId', type: 'uint256' }], outputs: [],
  },
  {
    name: 'cancelJob', type: 'function', stateMutability: 'nonpayable',
    inputs: [{ name: 'jobId', type: 'uint256' }], outputs: [],
  },
  {
    name: 'setFee', type: 'function', stateMutability: 'nonpayable',
    inputs: [{ name: 'newBps', type: 'uint256' }], outputs: [],
  },
  {
    name: 'withdrawFees', type: 'function', stateMutability: 'nonpayable',
    inputs: [], outputs: [],
  },
  // ── Read ───────────────────────────────────────────────────────────────────
  {
    name: 'getJob', type: 'function', stateMutability: 'view',
    inputs: [{ name: 'jobId', type: 'uint256' }],
    outputs: [{
      name: '', type: 'tuple',
      components: [
        { name: 'client',          type: 'address' },
        { name: 'freelancer',      type: 'address' },
        { name: 'amountUSDC',      type: 'uint256' },
        { name: 'createdAt',       type: 'uint256' },
        { name: 'acceptedAt',      type: 'uint256' },
        { name: 'approvedAt',      type: 'uint256' },
        { name: 'status',          type: 'uint8'   },
        { name: 'keeperTaskId',    type: 'bytes32'  },
        { name: 'ipfsJobSpec',     type: 'string'  },
        { name: 'ipfsDeliverable', type: 'string'  },
      ],
    }],
  },
  {
    name: 'nextJobId', type: 'function', stateMutability: 'view',
    inputs: [], outputs: [{ name: '', type: 'uint256' }],
  },
  {
    name: 'feeBps', type: 'function', stateMutability: 'view',
    inputs: [], outputs: [{ name: '', type: 'uint256' }],
  },
  {
    name: 'accruedFees', type: 'function', stateMutability: 'view',
    inputs: [], outputs: [{ name: '', type: 'uint256' }],
  },
  {
    name: 'keeper', type: 'function', stateMutability: 'view',
    inputs: [], outputs: [{ name: '', type: 'address' }],
  },
  {
    name: 'taskToJob', type: 'function', stateMutability: 'view',
    inputs: [{ name: 'taskId', type: 'bytes32' }],
    outputs: [{ name: '', type: 'uint256' }],
  },
  {
    name: 'timeoutRemainingSeconds', type: 'function', stateMutability: 'view',
    inputs: [{ name: 'jobId', type: 'uint256' }],
    outputs: [{ name: '', type: 'uint256' }],
  },
  {
    name: 'totalLockedUSDC', type: 'function', stateMutability: 'view',
    inputs: [], outputs: [{ name: '', type: 'uint256' }],
  },
  {
    name: 'netPayout', type: 'function', stateMutability: 'view',
    inputs: [{ name: 'gross', type: 'uint256' }],
    outputs: [
      { name: 'net', type: 'uint256' },
      { name: 'fee', type: 'uint256' },
    ],
  },
  {
    name: 'paused', type: 'function', stateMutability: 'view',
    inputs: [], outputs: [{ name: '', type: 'bool' }],
  },
  // ── Events ─────────────────────────────────────────────────────────────────
  {
    name: 'JobCreated', type: 'event',
    inputs: [
      { name: 'jobId',        type: 'uint256', indexed: true  },
      { name: 'client',       type: 'address', indexed: true  },
      { name: 'amountUSDC',   type: 'uint256', indexed: false },
      { name: 'depositToken', type: 'address', indexed: false },
      { name: 'ipfsJobSpec',  type: 'string',  indexed: false },
    ],
  },
  {
    name: 'JobAccepted', type: 'event',
    inputs: [
      { name: 'jobId',      type: 'uint256', indexed: true  },
      { name: 'freelancer', type: 'address', indexed: true  },
      { name: 'acceptedAt', type: 'uint256', indexed: false },
    ],
  },
  {
    name: 'WorkSubmitted', type: 'event',
    inputs: [
      { name: 'jobId',           type: 'uint256', indexed: true  },
      { name: 'freelancer',      type: 'address', indexed: true  },
      { name: 'ipfsDeliverable', type: 'string',  indexed: false },
    ],
  },
  {
    name: 'WorkApproved', type: 'event',
    inputs: [
      { name: 'jobId',        type: 'uint256', indexed: true  },
      { name: 'client',       type: 'address', indexed: true  },
      { name: 'keeperTaskId', type: 'bytes32', indexed: false },
    ],
  },
  {
    name: 'PaymentReleased', type: 'event',
    inputs: [
      { name: 'jobId',      type: 'uint256', indexed: true  },
      { name: 'freelancer', type: 'address', indexed: true  },
      { name: 'net',        type: 'uint256', indexed: false },
      { name: 'fee',        type: 'uint256', indexed: false },
    ],
  },
  {
    name: 'PaymentReclaimed', type: 'event',
    inputs: [
      { name: 'jobId',      type: 'uint256', indexed: true  },
      { name: 'freelancer', type: 'address', indexed: true  },
      { name: 'amount',     type: 'uint256', indexed: false },
    ],
  },
  {
    name: 'JobCancelled', type: 'event',
    inputs: [
      { name: 'jobId',  type: 'uint256', indexed: true  },
      { name: 'client', type: 'address', indexed: true  },
      { name: 'refund', type: 'uint256', indexed: false },
    ],
  },
  {
    name: 'SwapExecuted', type: 'event',
    inputs: [
      { name: 'jobId',        type: 'uint256', indexed: true  },
      { name: 'tokenIn',      type: 'address', indexed: false },
      { name: 'amountIn',     type: 'uint256', indexed: false },
      { name: 'usdcReceived', type: 'uint256', indexed: false },
    ],
  },
] as const

// ─── ERC-20 ABI ───────────────────────────────────────────────────────────────
export const ERC20_ABI = [
  {
    name: 'approve', type: 'function', stateMutability: 'nonpayable',
    inputs: [
      { name: 'spender', type: 'address' },
      { name: 'amount',  type: 'uint256' },
    ],
    outputs: [{ name: '', type: 'bool' }],
  },
  {
    name: 'allowance', type: 'function', stateMutability: 'view',
    inputs: [
      { name: 'owner',   type: 'address' },
      { name: 'spender', type: 'address' },
    ],
    outputs: [{ name: '', type: 'uint256' }],
  },
  {
    name: 'balanceOf', type: 'function', stateMutability: 'view',
    inputs: [{ name: 'account', type: 'address' }],
    outputs: [{ name: '', type: 'uint256' }],
  },
  {
    name: 'decimals', type: 'function', stateMutability: 'view',
    inputs: [], outputs: [{ name: '', type: 'uint8' }],
  },
  {
    name: 'mint', type: 'function', stateMutability: 'nonpayable',
    inputs: [
      { name: 'to',     type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
    outputs: [],
  },
] as const

// ─── Job status ───────────────────────────────────────────────────────────────
export const JobStatus = {
  Open:       0,
  InProgress: 1,
  Delivered:  2,
  Approved:   3,
  Completed:  4,
  Reclaimed:  5,
  Cancelled:  6,
} as const

export type JobStatusKey   = keyof typeof JobStatus
export type JobStatusValue = (typeof JobStatus)[JobStatusKey]

export const JOB_STATUS_LABEL: Record<number, string> = {
  0: 'Open',
  1: 'In Progress',
  2: 'Delivered',
  3: 'Approved',
  4: 'Completed',
  5: 'Reclaimed',
  6: 'Cancelled',
}

export const DEPOSIT_TOKENS = ['ETH', 'USDC'] as const
export type DepositToken = (typeof DEPOSIT_TOKENS)[number]
