export const TRUSTLANCE_ADDRESS = {
  8453: '0x0000000000000000000000000000000000000000', // TODO: deploy to Base
} as const

export const TRUSTLANCE_ABI = [
  // Write
  {
    name: 'setVerified',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [{ name: 'user', type: 'address' }],
    outputs: [],
  },
  {
    name: 'createEscrow',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'freelancer', type: 'address' },
      { name: 'amountUSDC', type: 'uint256' },
      { name: 'ipfsJobSpec', type: 'string' },
    ],
    outputs: [{ name: 'jobId', type: 'uint256' }],
  },
  {
    name: 'acceptJob',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [{ name: 'jobId', type: 'uint256' }],
    outputs: [],
  },
  {
    name: 'submitWork',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'jobId', type: 'uint256' },
      { name: 'ipfsDeliverable', type: 'string' },
    ],
    outputs: [],
  },
  {
    name: 'approveAndRelease',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [{ name: 'jobId', type: 'uint256' }],
    outputs: [],
  },
  {
    name: 'reclaimAfterTimeout',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [{ name: 'jobId', type: 'uint256' }],
    outputs: [],
  },
  // Read
  {
    name: 'getJob',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'jobId', type: 'uint256' }],
    outputs: [
      {
        name: '',
        type: 'tuple',
        components: [
          { name: 'client',          type: 'address' },
          { name: 'freelancer',      type: 'address' },
          { name: 'amountUSDC',      type: 'uint256' },
          { name: 'ipfsJobSpec',     type: 'string'  },
          { name: 'ipfsDeliverable', type: 'string'  },
          { name: 'status',          type: 'uint8'   },
          { name: 'acceptedAt',      type: 'uint256' },
        ],
      },
    ],
  },
  {
    name: 'isVerified',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'user', type: 'address' }],
    outputs: [{ name: '', type: 'bool' }],
  },
  {
    name: 'nextJobId',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'uint256' }],
  },
  {
    name: 'timeoutAt',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'jobId', type: 'uint256' }],
    outputs: [{ name: '', type: 'uint256' }],
  },
  // Events
  {
    name: 'JobCreated',
    type: 'event',
    inputs: [
      { name: 'jobId',       type: 'uint256', indexed: true  },
      { name: 'client',      type: 'address', indexed: true  },
      { name: 'amountUSDC',  type: 'uint256', indexed: false },
      { name: 'ipfsJobSpec', type: 'string',  indexed: false },
    ],
  },
  {
    name: 'PaymentReleased',
    type: 'event',
    inputs: [
      { name: 'jobId',      type: 'uint256', indexed: true  },
      { name: 'freelancer', type: 'address', indexed: true  },
      { name: 'amount',     type: 'uint256', indexed: false },
    ],
  },
] as const

// USDC on Base
export const USDC_ADDRESS = '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913'

export const ERC20_ABI = [
  {
    name: 'approve',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [{ name: 'spender', type: 'address' }, { name: 'amount', type: 'uint256' }],
    outputs: [{ name: '', type: 'bool' }],
  },
  {
    name: 'allowance',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'owner', type: 'address' }, { name: 'spender', type: 'address' }],
    outputs: [{ name: '', type: 'uint256' }],
  },
  {
    name: 'balanceOf',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'account', type: 'address' }],
    outputs: [{ name: '', type: 'uint256' }],
  },
] as const
