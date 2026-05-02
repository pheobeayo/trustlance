import { buildModule } from "@nomicfoundation/hardhat-ignition/modules"

const TrustLanceModule = buildModule("TrustLanceModule", (m) => {

  // ── Deploy mock dependencies ───────────────────────────────────────────────
  const mockUSDC = m.contract("MockERC20", ["USD Coin", "USDC", 6], {
    id: "MockUSDC",
  })

  const mockWETH = m.contract("MockERC20", ["Wrapped Ether", "WETH", 18], {
    id: "MockWETH",
  })

  // Rate: 1 ETH (1e18 wei) → 2750 USDC (2750e6)
  const mockRouter = m.contract("MockUniversalRouter", [mockUSDC, 2_750_000_000n], {
    id: "MockRouter",
  })

  const mockPermit2 = m.contract("MockPermit2", [], {
    id: "MockPermit2",
  })

  const mockKeeperHub = m.contract("MockKeeperHub", [], {
    id: "MockKeeperHub",
  })

  // ── Seed router with USDC so swaps pay out ─────────────────────────────────
  const SEED_USDC = 1_000_000_000_000n // 1,000,000 USDC (6 decimals)
  m.call(mockUSDC, "mint", [mockRouter, SEED_USDC], {
    id: "seedRouterUSDC",
  })

  // ── Deploy main escrow ─────────────────────────────────────────────────────
  // keeper = mockKeeperHub (matches test setup — hub is msg.sender on release)
  const escrow = m.contract("TrustLanceEscrow", [
    mockUSDC,
    mockRouter,
    mockPermit2,
    mockWETH,
    mockKeeperHub,
    mockKeeperHub,  // keeper immutable = keeperHub address
  ])

  return {
    escrow,
    mockUSDC,
    mockWETH,
    mockRouter,
    mockPermit2,
    mockKeeperHub,
  }
})

export default TrustLanceModule