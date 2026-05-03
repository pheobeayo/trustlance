# TrustLance — Verified Freelance Escrow

Trustless freelance escrow on 0G Chain. Clients deposit any token, Uniswap swaps it to USDC, work is delivered and approved, KeeperHub executes the release with SLA-backed guarantees.

Built for ETHGlobal Open Agents.

---

## Sponsors

| Sponsor | Prize Track | Integration |
|---|---|---|
| Uniswap Foundation | Best Uniswap API Integration — $5,000 | Universal Router for token-to-USDC swaps on deposit |
| KeeperHub | Best Use of KeeperHub — $4,500 | On-chain task registration and SLA-backed payment release |
| 0G | Best Autonomous Agents — $7,500 | Contract deployed on 0G Galileo Testnet (chain ID 16602) |

---

## The Problem

Crypto freelance escrow fails in two predictable ways:

1. Gas spikes cause release transactions to fail silently. Freelancers wait. Clients are confused. Nobody wins.
2. Clients deposit ETH at $3,000. By the time work is delivered the price is $1,800. The agreed dollar amount evaporates mid-project.

TrustLance solves both. Every deposit is swapped to USDC on the way in. Every release is executed by KeeperHub with retry logic and a full audit trail.

---

## How It Works

```
Client deposits any token (ETH, DAI, USDT)
  └── Uniswap Universal Router swaps inline to USDC
        └── USDC locked in TrustLanceEscrow on 0G Chain
              └── Freelancer accepts job (30-day safety clock starts)
                    └── Freelancer submits IPFS deliverable CID
                          └── Client calls approveWork()
                                └── KeeperHub task registered on-chain
                                      └── KeeperHub executor calls _executeRelease()
                                            └── USDC sent to freelancer
```

Dispute resolution is a 30-day timelock. If the client disappears, the freelancer reclaims the full amount after 30 days. No arbitration. No platform.

---

## Sponsor Integrations

### Uniswap Foundation

Files: `contracts/TrustLanceEscrow.sol` functions `_swapETHtoUSDC()` and `_swapERC20toUSDC()`
Frontend: `hooks/escrow/useCreateJob.ts`

When a client deposits any ERC-20 token or native ETH, the contract calls Uniswap Universal Router inline before locking funds:

- ETH path: `CMD_WRAP_ETH (0x0b)` followed by `CMD_V3_SWAP_EXACT_IN (0x00)`
- ERC-20 path: Permit2 allowance grant followed by `CMD_V3_SWAP_EXACT_IN`
- USDC path: direct pull, no swap

The client sets a `minUSDC` parameter for slippage protection. Pool fee tier is configurable (500 / 3000 / 10000). Freelancers always receive USDC regardless of what the client deposited.

### KeeperHub

Files: `contracts/TrustLanceEscrow.sol` functions `approveWork()` and `_executeRelease()`
Frontend: `hooks/escrow/useJobActions.ts`

When a client approves delivered work, the contract does not immediately transfer funds. Instead it calls `keeperHub.registerTask()` with the encoded calldata for `_executeRelease(jobId)`. KeeperHub monitors the task and executes it with SLA-backed delivery, automatic retry on gas spikes, and a full on-chain audit trail. The taskId is stored in the Job struct and indexed via `taskToJob` mapping.

The `_executeRelease` function is gated by `onlyKeeper` — only the whitelisted KeeperHub executor EOA can call it. This matches the Focus Area 1 prize criteria: a real problem (silent payment failures in freelance escrow) solved with a meaningful KeeperHub integration.

### 0G Chain

Deployed on 0G Galileo Testnet (chain ID 16602, RPC: `https://evmrpc-testnet.0g.ai`).

0G is an EVM-compatible AI Layer 1. TrustLance uses 0G as its execution environment — all escrow state lives on-chain, all job interactions are on-chain transactions, and KeeperHub automation runs against 0G's RPC. The frontend is configured in `components/layout/Providers.tsx` with custom `defineChain` entries for both testnet and mainnet.

---

## Deployed Contracts — 0G Galileo Testnet

| Contract | Address |
|---|---|
| TrustLanceEscrow | `0xfE75E4472359968f5EEd507021616Ee8Fb6BD540` |
| MockUSDC | `0x592ABb32AeFBcD2457cC6f3818FAb471db8160fB` |
| MockWETH | `0xaf89d4F79c93E787FeD8Deac82Cc6D4c61c4bB1e` |
| MockUniversalRouter | `0x7e9e22e4D05B15C640b251Da2624e56a3cC2295B` |
| MockPermit2 | `0xDA49e1bCc513226Dfa9c80FA16b04f104f6EBAe4` |
| MockKeeperHub | `0x2b8166fd6Ae1a4a216b3A2ABC80063147A65fb08` |

Explorer: https://chainscan-galileo.0g.ai

---

## Architecture

```
trustlance/                          Next.js 16 frontend
├── app/
│   ├── layout.tsx                   Root layout, ThemeProvider, UnsupportedChainBanner
│   ├── globals.css                  Design tokens, dark/light CSS vars
│   ├── page.tsx                     Landing page
│   └── jobs/
│       ├── page.tsx                 Job board — reads live on-chain data
│       ├── post/page.tsx            Create job + USDC approve flow
│       └── [id]/page.tsx            Job detail + all contract interactions
├── components/
│   ├── layout/
│   │   ├── Navbar.tsx               Sticky nav, RainbowKit connect, theme toggle
│   │   ├── Providers.tsx            wagmi + RainbowKit + React Query, 0G chains
│   │   └── UnsupportedChain.tsx     Banner + auto-switch for wrong network
│   ├── escrow/
│   │   ├── JobGrid.tsx              Live on-chain job cards
│   │   └── JobDetail.tsx            Full detail, timeline, role-aware action buttons
│   └── landing/                     Landing page sections
├── hooks/escrow/
│   ├── useJob.ts                    Read single job from contract
│   ├── useJobs.ts                   Batch-read latest N jobs
│   ├── useUSDC.ts                   Balance, allowance, approve
│   ├── useCreateJob.ts              createWithUSDC + depositAndCreate (Uniswap)
│   ├── useJobActions.ts             accept / submit / approve / reclaim / cancel
│   ├── useEscrowStats.ts            Protocol-level stats
│   ├── useTimeout.ts                30-day countdown with local tick
│   └── useMintUSDC.ts               Testnet USDC faucet
└── lib/
    └── contracts.ts                 ABI, deployed addresses, chain helpers

trustlance-contracts/                Hardhat project
├── contracts/
│   ├── TrustLanceEscrow.sol         Main escrow contract
│   ├── interfaces/
│   │   ├── IUniswap.sol             Universal Router + Permit2
│   │   └── IKeeperHub.sol           KeeperHub registry
│   └── test/
│       ├── MockUniversalRouter.sol  Simulates Uniswap swaps at configurable rate
│       ├── MockPermit2.sol
│       └── MockKeeperHub.sol        Simulates KeeperHub with executeTask()
├── test/
│   └── TrustLanceEscrow.test.ts     45 tests, full coverage
└── scripts/
    └── deploy.ts                    Auto-deploys mocks + escrow to 0G
```

---

## Setup

```bash
git clone <repo-url>
cd trustlance
npm install
echo "NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_id" > .env.local
npm run dev
```

The app runs at http://localhost:3000. Connect MetaMask to 0G Galileo Testnet (chain ID 16602). An auto-switch banner appears if the wallet is on the wrong network.

---

## Contract Setup

```bash
cd trustlance-contracts
npm install
cp .env.example .env
# Add DEPLOYER_PRIVATE_KEY to .env

npx hardhat test
npx hardhat run scripts/deploy.ts --network 0g-testnet
```

---

## Demo Script (90 seconds)

1. Open `/jobs`. Show the live job board reading from 0G chain.
2. Click "Post a Job". Enter title and description. Click "Mint 1,000 USDC" (testnet faucet). Approve then create escrow.
3. Switch wallet. Open the job. Click "Accept Job". 30-day clock starts on-chain.
4. Submit an IPFS deliverable CID. Switch back to client wallet.
5. Click "Approve & Release via KeeperHub". KeeperHub task is registered on-chain. Executor calls `_executeRelease`. USDC arrives in freelancer wallet.
6. Show the escrow timeline: all 5 steps complete.

---

## Links

- Live demo: [to be added]
- Demo video: [to be added]
- Contract on 0G Explorer: https://chainscan-galileo.0g.ai/address/0xfE75E4472359968f5EEd507021616Ee8Fb6BD540
- Uniswap docs: https://developers.uniswap.org
- KeeperHub docs: https://docs.keeperhub.com
- 0G Builder Hub: https://build.0g.ai