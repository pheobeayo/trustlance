# TrustLance — Verified Freelance Escrow

> Sybil-resistant freelance marketplace built for ETHGlobal Open.
> World ID · Uniswap Universal Router · KeeperHub

---

## Overview

TrustLance solves two root problems with crypto freelance escrow:

1. **Sybil attacks** — bad actors spin up throwaway wallets and scam clients.  
   Fixed with **World ID** (proof-of-personhood gate on both sides).

2. **Silent tx failures** — gas spikes cause release transactions to fail,
   leaving freelancers waiting.  
   Fixed with **KeeperHub** (SLA-backed execution with retry + audit trail).

Bonus: clients can deposit ETH, USDT, or DAI — **Uniswap Universal Router** auto-swaps to USDC on the way in. Freelancers always receive USDC.

---

## Architecture

```
Next.js 15 App
├── /jobs            → Job board (list of open escrows)
├── /jobs/[id]       → Job detail + all contract interactions
└── /jobs/post       → Create a new job / escrow

Smart Contracts (Base)
└── TrustLanceEscrow.sol
    ├── createEscrow(freelancer, amountUSDC, ipfsJobSpec)
    ├── acceptJob(jobId)
    ├── submitWork(jobId, ipfsDeliverable)
    ├── approveAndRelease(jobId)   ← called via KeeperHub
    └── reclaimAfterTimeout(jobId) ← 30-day timelock

Sponsor integrations
├── World ID IDKit  → setVerified() after on-chain ZK proof
├── Uniswap V3      → Universal Router swap on deposit
└── KeeperHub       → approveAndRelease routed for SLA execution
```

---

## Quick Start

```bash
# 1. Install deps
npm install

# 2. Copy env file and fill in values
cp .env.example .env.local

# 3. Run dev server
npm run dev
```

---

## Environment Variables

Create `.env.local`:

```bash
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id
NEXT_PUBLIC_WORLD_APP_ID=app_staging_XXXXXXXX
NEXT_PUBLIC_KEEPERHUB_API_KEY=your_keeperhub_key
```

---

## Contract Deployment (Hardhat)

```bash
# Compile
npx hardhat compile

# Deploy to Base testnet
npx hardhat run scripts/deploy.ts --network base-sepolia

# Verify
npx hardhat verify --network base-sepolia DEPLOYED_ADDRESS USDC_ADDRESS KEEPER_ADDRESS
```

Update `lib/contracts.ts` with your deployed address.

---

## Sponsor Integration Notes

### World ID
- IDKit React component wraps the "Accept Job" and "Post Job" CTAs
- On successful verification, frontend calls `setVerified(user)` on the contract
- In production, replace stub with `WorldIDRouter.verifyProof` call

### Uniswap Universal Router
- Token selector on PostJob page shows ETH / USDC / USDT / DAI
- If token ≠ USDC: call Universal Router `execute()` with `V3_SWAP_EXACT_IN` command
- Resulting USDC is then approved and passed to `createEscrow()`
- Swap preview uses mock price; replace with Uniswap V3 quoter contract

### KeeperHub
- `approveAndRelease` is the target function
- Register the function signature with KeeperHub dashboard
- Replace direct `writeContract` call with `KeeperHub.submitTask()` SDK call
- KeeperHub provides receipt URL shown in the UI after release

---

## File Structure

```
trustlance/
├── app/
│   ├── layout.tsx              Root layout + providers
│   ├── globals.css             Design tokens + base styles
│   ├── jobs/
│   │   ├── page.tsx            /jobs — job board
│   │   ├── post/page.tsx       /jobs/post — create job form
│   │   └── [id]/page.tsx       /jobs/[id] — job detail
│
├── components/
│   ├── layout/
│   │   ├── Navbar.tsx/.css     Sticky nav + wallet connect
│   │   └── Providers.tsx       wagmi + RainbowKit + React Query
│   └── escrow/
│       ├── Hero.tsx/.css       Landing hero with stats
│       ├── SponsorStrip.tsx    World ID / Uniswap / KeeperHub strip
│       ├── JobFilters.tsx      Category + status filter chips
│       ├── JobGrid.tsx/.css    Animated job card grid
│       ├── JobDetail.tsx/.css  Full detail + sidebar + all actions
│       └── WorldIDVerifyModal  IDKit integration modal
│
├── lib/
│   ├── contracts.ts            ABI + addresses
│   └── mockData.ts             Dev-mode seed data + helpers
│
├── types/index.ts              Shared TypeScript types
└── contracts/
    └── TrustLanceEscrow.sol    ~100 line escrow contract
```

---

## Demo Script (90 seconds)

1. **(0–10s)** Open `/jobs`. "Freelance scams happen because there's no way to verify humans on-chain. TrustLance fixes that."
2. **(10–30s)** Click "Post a Job". Fill title, select ETH, enter 0.5 ETH. Show swap preview → 1,375 USDC. Click "Create Escrow". World ID modal appears, scan with phone.
3. **(30–50s)** Switch to freelancer wallet. Open job detail. Click "Verify & Accept". World ID modal. Accept confirmed on-chain.
4. **(50–70s)** Freelancer submits IPFS deliverable CID. Client switches back, clicks "Approve & Release via KeeperHub". KeeperHub receipt appears in UI.
5. **(70–90s)** Show escrow timeline: all 5 steps complete. KeeperHub audit trail. "Three primitives — World ID, Uniswap, KeeperHub. One trustless workflow."

---

