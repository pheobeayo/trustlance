import hre from "hardhat"

const ENV = {
  usdc:          process.env.USDC_ADDRESS           ?? "",
  uniswapRouter: process.env.UNISWAP_ROUTER_ADDRESS ?? "",
  permit2:       process.env.PERMIT2_ADDRESS        ?? "",
  weth:          process.env.WETH_ADDRESS           ?? "",
  keeperHub:     process.env.KEEPERHUB_ADDRESS      ?? "",
  keeper:        process.env.KEEPERHUB_EXECUTOR     ?? "",
}

const ZERO = "0x0000000000000000000000000000000000000000"

async function main() {
  // ── Connect to selected network ──────────────────────────────────────────
  const networkName = hre.config.defaultNetwork ?? "hardhat"
  const { ethers }  = await hre.network.connect()

  const [deployer] = await ethers.getSigners()
  const balance    = await ethers.provider.getBalance(deployer.address)

  console.log(`\n╔═══════════════════════════════════════════════════════`)
  console.log(`║  TrustLance — Deploy`)
  console.log(`╠═══════════════════════════════════════════════════════`)
  console.log(`║  Deployer: ${deployer.address}`)
  console.log(`║  Balance:  ${ethers.formatEther(balance)} OG`)
  console.log(`╚═══════════════════════════════════════════════════════\n`)

  // ── Auto-deploy mocks if addresses are missing ───────────────────────────
  const isMainnet = networkName === "0g-mainnet"

  if (!isMainnet) {
    if (!ENV.usdc) {
      console.log("  Deploying MockERC20 (USDC)...")
      const F    = await ethers.getContractFactory("MockERC20")
      const usdc = await F.deploy("USD Coin", "USDC", 6)
      await usdc.waitForDeployment()
      ENV.usdc = await usdc.getAddress()
      console.log(`  ✓ MockERC20 (USDC) → ${ENV.usdc}`)
    }

    if (!ENV.weth) {
      console.log("  Deploying MockERC20 (WETH)...")
      const F    = await ethers.getContractFactory("MockERC20")
      const weth = await F.deploy("Wrapped Ether", "WETH", 18)
      await weth.waitForDeployment()
      ENV.weth = await weth.getAddress()
      console.log(`  ✓ MockERC20 (WETH) → ${ENV.weth}`)
    }

    if (!ENV.uniswapRouter) {
      console.log("  Deploying MockUniversalRouter...")
      const rate   = 2_750_000_000n           // 2750 USDC per ETH
      const F      = await ethers.getContractFactory("MockUniversalRouter")
      const router = await F.deploy(ENV.usdc, rate)
      await router.waitForDeployment()
      ENV.uniswapRouter = await router.getAddress()
      // Fund router with USDC so swaps work
      const usdc = await ethers.getContractAt("MockERC20", ENV.usdc)
      await (usdc as any).mint(ENV.uniswapRouter, ethers.parseUnits("1000000", 6))
      console.log(`  ✓ MockUniversalRouter → ${ENV.uniswapRouter}`)
    }

    if (!ENV.permit2) {
      console.log("  Deploying MockPermit2...")
      const F  = await ethers.getContractFactory("MockPermit2")
      const p2 = await F.deploy()
      await p2.waitForDeployment()
      ENV.permit2 = await p2.getAddress()
      console.log(`  ✓ MockPermit2 → ${ENV.permit2}`)
    }

    if (!ENV.keeperHub) {
      console.log("  Deploying MockKeeperHub...")
      const F  = await ethers.getContractFactory("MockKeeperHub")
      const kh = await F.deploy()
      await kh.waitForDeployment()
      ENV.keeperHub = await kh.getAddress()
      console.log(`  ✓ MockKeeperHub → ${ENV.keeperHub}`)
    }

    if (!ENV.keeper) {
      const signers = await ethers.getSigners()
      ENV.keeper = signers[3]?.address ?? deployer.address
      console.log(`  ✓ Keeper EOA (signer[3]) → ${ENV.keeper}`)
    }

    console.log()
  }

  // Warn about any still-missing mainnet addresses
  const missing = Object.entries(ENV).filter(([, v]) => !v).map(([k]) => k)
  if (missing.length) {
    console.warn(`  ⚠  Missing addresses: ${missing.join(", ")}`)
    console.warn(`     Contract will deploy but those integrations will fail.\n`)
  }

  // ── Deploy TrustLanceEscrow ───────────────────────────────────────────────
  console.log("  Deploying TrustLanceEscrow...")
  const Factory = await ethers.getContractFactory("TrustLanceEscrow")
  const escrow  = await Factory.deploy(
    ENV.usdc          || ZERO,
    ENV.uniswapRouter || ZERO,
    ENV.permit2       || ZERO,
    ENV.weth          || ZERO,
    ENV.keeperHub     || ZERO,
    ENV.keeper        || ZERO,
  )
  await escrow.waitForDeployment()
  const address = await escrow.getAddress()
  const txHash  = escrow.deploymentTransaction()?.hash

  console.log(`\n✓  TrustLanceEscrow deployed`)
  console.log(`   Address: ${address}`)
  console.log(`   Tx:      ${txHash}\n`)

  // ── Print the .env lines to add ───────────────────────────────────────────
  console.log(`──────────────────────────────────────────────────────────`)
  console.log(`  Add to your Next.js .env:`)
  console.log(`  NEXT_PUBLIC_TRUSTLANCE_ADDRESS_0G_TESTNET="${address}"`)
  console.log(``)
  console.log(`  Update lib/contracts.ts:`)
  console.log(`  TRUSTLANCE_ADDRESS[16602] = "${address}"`)
  if (ENV.usdc !== ZERO && ENV.usdc) {
    console.log(``)
    console.log(`  NEXT_PUBLIC_TESTNET_USDC="${ENV.usdc}"`)
    console.log(`  TRUSTLANCE_ADDRESS usdc: "${ENV.usdc}"`)
  }
  console.log(`──────────────────────────────────────────────────────────\n`)
}

main().catch(e => { console.error(e); process.exit(1) })
