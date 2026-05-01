export const STATS = [
  { n: '$214k', l: 'in escrow today'      },
  { n: '1,840', l: 'verified humans'      },
  { n: '98.4%', l: 'release success rate' },
  { n: '0%',    l: 'platform fee'         },
  { n: '30d',   l: 'max dispute window'   },
]

export const PROOF_CHIPS = [
  { icon: '🌍', val: 'World ID',        sub: 'Proof of personhood'   },
  { icon: '🔁', val: 'Uniswap V3',      sub: 'Any token → USDC'      },
  { icon: '⚡', val: 'KeeperHub',       sub: 'SLA-backed release'    },
  { icon: '🔐', val: 'On-chain Escrow', sub: 'Non-custodial USDC'    },
  { icon: '⛓',  val: 'Base L2',         sub: 'Fast, cheap, reliable' },
]

export const PROBLEMS = [
  { num: '01', icon: '👻', title: 'Sybil Attacks',           body: "Bad actors spin up 50 wallets, accept 50 jobs, and vanish. Without identity verification there's no friction at all.",         tag: 'No identity layer'      },
  { num: '02', icon: '🔥', title: 'Silent Payment Failures', body: 'Gas spikes cause release transactions to fail silently. Freelancers wait. Clients are confused. Nobody wins.',                 tag: 'No execution guarantee' },
  { num: '03', icon: '📉', title: 'Price Exposure',          body: "A client deposits ETH at $3k; by delivery it's $1.8k. The agreed dollar amount evaporates mid-project.",                      tag: 'No stablecoin floor'    },
  { num: '04', icon: '🏦', title: 'Centralized Platform Tax',body: "Upwork and Fiverr charge 10–20% on every transaction and still don't protect either side.",                                   tag: '10–20% fee drain'       },
]

export const HOW_STEPS = [
  { step: '1', tag: 'World ID',  title: 'Verify humanity',   body: 'Client and freelancer each prove uniqueness via ZK proof. One-time only.'                        },
  { step: '2', tag: 'Uniswap',   title: 'Deposit any token', body: 'Client deposits ETH, USDT, or DAI. Contract auto-swaps to USDC via Universal Router.'            },
  { step: '3', tag: 'On-chain',  title: 'Accept & work',     body: 'Verified freelancer accepts. USDC is locked. Deliverable pinned to IPFS.'                        },
  { step: '4', tag: 'KeeperHub', title: 'Approve & release', body: 'Client approves. KeeperHub executes the release with SLA guarantees — no silent failures.'       },
  { step: '5', tag: 'Timelock',  title: '30-day safety net', body: 'If the client disappears, the freelancer reclaims after 30 days. No arbitration needed.'         },
]

export const SPONSORS = [
  {
    badge: 'World ID',   num: '01',
    title: 'Proof of Personhood',
    body:  "Both parties verify they are unique humans via World ID's orb scan. The ZK proof is stored on-chain. No PII ever leaves your device.",
    code:  'mapping(address => bool) public verified;\n// set once via IDKit on-chain proof',
  },
  {
    badge: 'Uniswap V3', num: '02',
    title: 'Token-Agnostic Deposits',
    body:  'Clients deposit ETH, USDT, or DAI — whatever they hold. Universal Router swaps to USDC on entry. Freelancers always receive USDC.',
    code:  'ETH → USDC  ·  USDT → USDC\nDAI → USDC  via Universal Router',
  },
  {
    badge: 'KeeperHub',  num: '03',
    title: 'Guaranteed Execution',
    body:  'The approveAndRelease call is routed through KeeperHub. Gas spikes and reverts are handled with automatic retry and a full audit trail.',
    code:  'approveAndRelease(jobId)\n// SLA-backed · retry · audit log',
  },
]

export const FLOW = [
  { icon: '🔐', title: 'createEscrow(freelancer, amountUSDC, ipfsJobSpec)', body: 'Called by a verified client after USDC is approved. Locks funds and creates the job record on-chain.',     tag: '🌍 Requires World ID · 🔁 USDC via Uniswap' },
  { icon: '✋', title: 'acceptJob(jobId)',                                    body: 'Called by a verified freelancer. Marks the job InProgress and starts the 30-day timeout clock.',          tag: '🌍 Requires World ID'                        },
  { icon: '📦', title: 'submitWork(jobId, ipfsDeliverable)',                  body: 'Freelancer pins deliverables to IPFS and submits the CID on-chain. Job moves to Delivered state.',       tag: 'Only the accepted freelancer'                },
  { icon: '⚡', title: 'approveAndRelease(jobId)',                            body: 'Client approves; this call is routed through KeeperHub with SLA guarantees. USDC transfers to freelancer.', tag: '⚡ Via KeeperHub · SLA-guaranteed'          },
  { icon: '⏱', title: 'reclaimAfterTimeout(jobId)',                          body: 'If 30 days pass without client approval, the freelancer reclaims the full escrow. No jury, no arbitration.', tag: '30-day timelock · freelancer safety net'  },
]

export const QUOTES = [
  { q: "I've had three clients disappear without paying. With TrustLance the funds are locked before I write a single line. I only care about building now.", name: 'Phoebe O.', role: 'Fullstack Blockchain Dev · Lagos',    av: 'PO' },
  { q: "I hired three 'Solidity devs' on traditional platforms. Two were fake. TrustLance's World ID gate meant the freelancer I found was actually a person.", name: 'Marcus R.', role: 'DeFi Protocol Founder · Berlin',    av: 'MR' },
  { q: 'My previous escrow had the payment fail twice due to gas. With TrustLance the receipt appeared in my wallet before I closed the tab.',                 name: 'Aisha K.',  role: 'Smart Contract Auditor · Nairobi', av: 'AK' },
]

export const COMPARE_ROWS = [
  { f: 'Identity verification',   tl: 'ZK proof on-chain',       up: 'ID scan (centralized)', ce: 'None'             },
  { f: 'Sybil resistance',        tl: 'World ID gate',           up: 'Throwaway accounts',    ce: 'Throwaway wallets' },
  { f: 'Platform fee',            tl: '0%',                      up: '10–20%',                ce: '1–5%'             },
  { f: 'Multi-token deposits',    tl: 'ETH, USDT, DAI, USDC',   up: 'Fiat only',             ce: 'One token'        },
  { f: 'Stablecoin floor',        tl: 'Auto-converted to USDC',  up: '✓ Fiat stable',         ce: 'Volatile'         },
  { f: 'Guaranteed tx execution', tl: 'KeeperHub SLA',           up: '✓ Bank rails',          ce: 'Best-effort'      },
  { f: 'Dispute resolution',      tl: '30-day timelock',         up: 'Human arbitration',     ce: 'None'             },
  { f: 'Non-custodial',           tl: 'Funds stay on-chain',     up: 'Platform holds funds',  ce: 'Sometimes'        },
]
