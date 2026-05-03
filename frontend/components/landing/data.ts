export const STATS = [
  { n: '$214k', l: 'in escrow today'     },
  { n: '1,840', l: 'active jobs'         },
  { n: '98.4%', l: 'release success rate'},
  { n: '0%',    l: 'platform fee'        },
  { n: '30d',   l: 'max dispute window'  },
]

export const PROOF_CHIPS = [
  { val: 'Uniswap V3',      sub: 'Any token → USDC swap'    },
  { val: 'KeeperHub',       sub: 'SLA-backed release'        },
  { val: 'On-chain Escrow', sub: 'Non-custodial USDC lock'   },
  { val: '0G Chain',        sub: 'AI-native L1 blockchain'   },
  { val: 'CEI Security',    sub: 'Reentrancy protected'      },
]

export const PROBLEMS = [
  {
    num:   '01',
    title: 'Silent Payment Failures',
    body:  'Gas spikes cause release transactions to fail silently. Freelancers wait, clients are confused. Nobody wins.',
    tag:   'No execution guarantee',
  },
  {
    num:   '02',
    title: 'Price Exposure',
    body:  "A client deposits ETH at $3k — by delivery it's $1.8k. The agreed dollar amount evaporates mid-project.",
    tag:   'No stablecoin floor',
  },
  {
    num:   '03',
    title: 'Ghost Clients',
    body:  'Freelancers complete work and clients disappear. No recourse, no arbitration, no refund.',
    tag:   'No timeout protection',
  },
  {
    num:   '04',
    title: 'Centralized Platform Tax',
    body:  "Upwork and Fiverr charge 10–20% on every transaction and still don't protect either side.",
    tag:   '10–20% fee drain',
  },
]

export const HOW_STEPS = [
  { tag: 'Uniswap',   title: 'Deposit any token', body: 'Client deposits ETH, USDT, or DAI. The contract auto-swaps to USDC via Uniswap Universal Router.'  },
  { tag: 'On-chain',  title: 'Job created',        body: 'USDC is locked in the escrow contract. Job is open for freelancers to accept.'                       },
  { tag: 'Escrow',    title: 'Accept & work',       body: 'Freelancer accepts. A 30-day safety clock starts. Deliverable is pinned to IPFS.'                    },
  { tag: 'KeeperHub', title: 'Approve & release',   body: 'Client approves. KeeperHub executes the USDC release with SLA guarantees — no silent failures.'      },
  { tag: 'Timelock',  title: '30-day safety net',   body: 'If the client disappears, the freelancer reclaims the full amount after 30 days. No arbitration.'    },
]

export const SPONSORS = [
  {
    badge: 'UNISWAP',
    num:   '01',
    title: 'Token-Agnostic Deposits',
    body:  'Clients deposit ETH, DAI, USDT, or any ERC-20. The Universal Router swaps inline to USDC before locking — freelancers always receive stable value.',
    code:  'CMD_WRAP_ETH + CMD_V3_SWAP_EXACT_IN\n→ USDC locked in escrow',
  },
  {
    badge: 'KEEPERHUB',
    num:   '02',
    title: 'SLA-Backed Execution',
    body:  'When a client approves, a KeeperHub task is registered on-chain. KeeperHub retries on gas spikes and guarantees execution — no silent failures.',
    code:  'approveWork() → registerTask()\nKeeperHub → _executeRelease()',
  },
  {
    badge: '0G CHAIN',
    num:   '03',
    title: 'AI-Native Layer 1',
    body:  'Deployed on 0G Chain — an EVM-compatible L1 built for AI agents. Fast finality, low fees, and native support for on-chain agent automation.',
    code:  'chainId: 16602 (testnet)\nRPC: evmrpc-testnet.0g.ai',
  },
]

export const FLOW = [
  { title: 'depositAndCreate()',     body: 'Client deposits any token. Uniswap swaps to USDC. Job struct created with USDC locked.',                              tag: 'payable · whenNotPaused'        },
  { title: 'acceptJob(jobId)',       body: 'Freelancer accepts the job. Sets status to InProgress. Starts the 30-day reclaim clock.',                              tag: 'whenNotPaused · nonReentrant'   },
  { title: 'submitWork(jobId, cid)', body: 'Freelancer submits IPFS CID of deliverable. Status moves to Delivered.',                                              tag: 'nonReentrant'                   },
  { title: 'approveWork(jobId)',     body: 'Client approves. Registers a KeeperHub task on-chain. Status moves to Approved.',                                     tag: 'nonReentrant · KeeperHub'       },
  { title: '_executeRelease(jobId)', body: 'KeeperHub calls this. USDC sent to freelancer minus protocol fee. Status = Completed.',                               tag: 'onlyKeeper · nonReentrant'      },
]

export const QUOTES = [
  { q: 'First time I got paid the exact amount we agreed on, in stablecoins, automatically. No chasing.',    av: 'RA', name: 'Rahul A.',   role: 'Smart Contract Dev'   },
  { q: 'The 30-day reclaim was the thing. I knew if the client ghosted I had a guaranteed out.',              av: 'MO', name: 'Miriam O.',  role: 'Technical Writer'     },
  { q: 'Deposited ETH, escrow held USDC. By the time I delivered, zero price slippage on my payout.',        av: 'CS', name: 'Carlos S.',  role: 'Solidity Auditor'     },
]

export const COMPARE_ROWS = [
  { f: 'Payment token',         tl: 'USDC (stable)',           up: 'Fiat / crypto (volatile)', ce: 'Varies'               },
  { f: 'Execution guarantee',   tl: 'KeeperHub SLA',           up: 'None',                     ce: 'Manual'               },
  { f: 'Platform fee',          tl: '0%',                      up: '10–20%',                   ce: '1–5%'                 },
  { f: 'Dispute resolution',    tl: '30-day timelock',         up: 'Centralized arbitration',  ce: 'Manual / legal'       },
  { f: 'Token flexibility',     tl: 'Any ERC-20 via Uniswap',  up: 'Fiat only',                ce: 'ETH/USDC only'        },
  { f: 'Non-custodial',         tl: 'Yes — on-chain contract', up: 'No — platform holds funds','ce': 'Partial'            },
  { f: 'Deployed on',           tl: '0G Chain (AI L1)',        up: 'Centralized servers',      ce: 'Ethereum mainnet'     },
]
