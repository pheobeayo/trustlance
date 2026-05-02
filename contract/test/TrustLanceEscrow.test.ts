import hre from "hardhat"
import { expect } from "chai"
import type { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers"
import { ethers } from "hardhat";

// ─── Constants ────────────────────────────────────────────────────────────────
const ONE_USDC     = 1_000_000n              // 1 USDC (6 decimals)
const HUNDRED_USDC = 100_000_000n            // 100 USDC
const THOUSAND     = 1_000_000_000n          // 1000 USDC
const ONE_ETH      = 1_000_000_000_000_000_000n
const THIRTY_DAYS  = 30 * 24 * 60 * 60

const IPFS_SPEC = "bafkreispec000"
const IPFS_WORK = "bafkreiwork111"

// Rate: 1 ETH (1e18 wei) → 2750 USDC (2750e6)
const ETH_TO_USDC_RATE = 2_750_000_000n
// Rate: 1 DAI (1e18) → 1 USDC (1e6)
const DAI_TO_USDC_RATE = 1_000_000n

// ─── Network connection (shared across all tests) ─────────────────────────────
// In Hardhat v3, ethers + networkHelpers come from hre.network.connect()


// ─── Fixture ──────────────────────────────────────────────────────────────────
async function deploy() {
  const [owner, client, freelancer, keeper, other] = await ethers.getSigners()

  // Tokens
  const ERC20 = await ethers.getContractFactory("MockERC20")
  const usdc  = await ERC20.deploy("USD Coin",       "USDC", 6)
  const weth  = await ERC20.deploy("Wrapped Ether",  "WETH", 18)
  const dai   = await ERC20.deploy("Dai Stablecoin", "DAI",  18)

  // Uniswap mocks
  const RouterF = await ethers.getContractFactory("MockUniversalRouter")
  const router  = await RouterF.deploy(await usdc.getAddress(), ETH_TO_USDC_RATE)

  const P2F    = await ethers.getContractFactory("MockPermit2")
  const permit2 = await P2F.deploy()

  // KeeperHub mock
  const KHF      = await ethers.getContractFactory("MockKeeperHub")
  const keeperHub = await KHF.deploy()

  // ─── FIX for failure 4 ───────────────────────────────────────────────────
  // keeper immutable must equal the address that calls _executeRelease.
  // When MockKeeperHub.executeTask() triggers the call, msg.sender = keeperHub
  // address — so we pass keeperHub.getAddress() as the keeper argument, not
  // the EOA. Direct-call tests route through keeperHub.directCall() instead.
  const EscrowF = await ethers.getContractFactory("TrustLanceEscrow")
  const escrow  = await EscrowF.deploy(
    await usdc.getAddress(),
    await router.getAddress(),
    await permit2.getAddress(),
    await weth.getAddress(),
    await keeperHub.getAddress(),
    await keeperHub.getAddress()   // ← keeper = keeperHub contract address
  )
  // ────────────────────────────────────────────────────────────────────────

  const escrowAddr = await escrow.getAddress()
  const routerAddr = await router.getAddress()

  // Fund router with USDC so it can pay out swaps
  await usdc.mint(routerAddr, THOUSAND * 1000n)

  // Fund actors
  await usdc.mint(client.address,     THOUSAND * 10n)
  await dai.mint(client.address,      ethers.parseEther("10000"))

  return {
    escrow, usdc, weth, dai, router, permit2, keeperHub,
    owner, client, freelancer, keeper, other,
    escrowAddr, routerAddr,
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
async function createUSDCJob(
  s: Awaited<ReturnType<typeof deploy>>,
  amount    = HUNDRED_USDC,
  freelancer = ethers.ZeroAddress,
  spec       = IPFS_SPEC
): Promise<bigint> {
  await s.usdc.connect(s.client).approve(s.escrowAddr, amount)
  const tx      = await s.escrow.connect(s.client).createWithUSDC(amount, freelancer, spec)
  const receipt = await tx.wait()
  const log = receipt!.logs
    .map((l: any) => { try { return s.escrow.interface.parseLog(l) } catch { return null } })
    .find((e: any) => e?.name === "JobCreated")
  return log!.args.jobId as bigint
}

async function toDelivered(s: Awaited<ReturnType<typeof deploy>>) {
  const jobId = await createUSDCJob(s)
  await s.escrow.connect(s.freelancer).acceptJob(jobId)
  await s.escrow.connect(s.freelancer).submitWork(jobId, IPFS_WORK)
  return jobId
}

async function toApproved(s: Awaited<ReturnType<typeof deploy>>) {
  const jobId = await toDelivered(s)
  await s.escrow.connect(s.client).approveWork(jobId)
  return jobId
}

// ─── Helper: trigger _executeRelease via keeperHub (the authorized keeper) ───
// Since keeper immutable = keeperHub.address, we can't call _executeRelease
// directly from an EOA. Route through keeperHub.directCall() instead.
async function keeperRelease(
  s: Awaited<ReturnType<typeof deploy>>,
  jobId: bigint
) {
  const data = s.escrow.interface.encodeFunctionData("_executeRelease", [jobId])
  await s.keeperHub.connect(s.keeper).directCall(s.escrowAddr, data)
}

// ─── Tests ────────────────────────────────────────────────────────────────────
describe("TrustLanceEscrow", () => {

  // ── Deployment ──────────────────────────────────────────────────────────────
  describe("Deployment", () => {
    it("stores immutables correctly", async () => {
      const { escrow, usdc, router, permit2, weth, keeperHub } = await deploy()
      expect(await escrow.USDC()).to.equal(await usdc.getAddress())
      expect(await escrow.uniswapRouter()).to.equal(await router.getAddress())
      expect(await escrow.permit2()).to.equal(await permit2.getAddress())
      expect(await escrow.WETH()).to.equal(await weth.getAddress())
      expect(await escrow.keeperHub()).to.equal(await keeperHub.getAddress())
      // keeper immutable is now keeperHub address
      expect(await escrow.keeper()).to.equal(await keeperHub.getAddress())
    })

    it("starts with nextJobId=1, feeBps=0, accruedFees=0", async () => {
      const { escrow } = await deploy()
      expect(await escrow.nextJobId()).to.equal(1n)
      expect(await escrow.feeBps()).to.equal(0n)
      expect(await escrow.accruedFees()).to.equal(0n)
    })
  })

  // ── createWithUSDC ──────────────────────────────────────────────────────────
  describe("createWithUSDC", () => {
    it("locks USDC and emits JobCreated", async () => {
      const s = await deploy()
      await s.usdc.connect(s.client).approve(s.escrowAddr, HUNDRED_USDC)
      await expect(
        s.escrow.connect(s.client).createWithUSDC(HUNDRED_USDC, ethers.ZeroAddress, IPFS_SPEC)
      )
        .to.emit(s.escrow, "JobCreated")
        .withArgs(1n, s.client.address, HUNDRED_USDC, await s.usdc.getAddress(), IPFS_SPEC)

      expect(await s.usdc.balanceOf(s.escrowAddr)).to.equal(HUNDRED_USDC)
    })

    it("increments nextJobId on each call", async () => {
      const s = await deploy()
      await createUSDCJob(s)
      await createUSDCJob(s)
      expect(await s.escrow.nextJobId()).to.equal(3n)
    })

    it("reverts when amount is zero", async () => {
      const s = await deploy()
      await expect(s.escrow.connect(s.client).createWithUSDC(0n, ethers.ZeroAddress, IPFS_SPEC))
        .to.be.revertedWithCustomError(s.escrow, "AmountZero")
    })

    it("reverts when paused", async () => {
      const s = await deploy()
      await s.escrow.connect(s.owner).pause()
      await expect(createUSDCJob(s))
        .to.be.revertedWithCustomError(s.escrow, "EnforcedPause")
    })
  })

  // ── depositAndCreate (Uniswap) ──────────────────────────────────────────────
  describe("depositAndCreate — Uniswap swap", () => {
    it("swaps ETH → USDC and creates job", async () => {
      const s = await deploy()
      await expect(
        s.escrow.connect(s.client).depositAndCreate(
          ethers.ZeroAddress, ONE_ETH, 2_700_000_000n, 3000,
          ethers.ZeroAddress, IPFS_SPEC, { value: ONE_ETH }
        )
      )
        .to.emit(s.escrow, "SwapExecuted")
        .to.emit(s.escrow, "JobCreated")

      const job = await s.escrow.getJob(1n)
      expect(job.amountUSDC).to.equal(ETH_TO_USDC_RATE)
    })

    it("direct USDC deposit skips swap", async () => {
      const s = await deploy()
      await s.usdc.connect(s.client).approve(s.escrowAddr, HUNDRED_USDC)
      await s.escrow.connect(s.client).depositAndCreate(
        await s.usdc.getAddress(), HUNDRED_USDC, HUNDRED_USDC, 3000,
        ethers.ZeroAddress, IPFS_SPEC
      )
      const job = await s.escrow.getJob(1n)
      expect(job.amountUSDC).to.equal(HUNDRED_USDC)
    })

    it("reverts when slippage too high", async () => {
      const s = await deploy()
      await expect(
        s.escrow.connect(s.client).depositAndCreate(
          ethers.ZeroAddress, ONE_ETH, 9_999_000_000n, 3000,
          ethers.ZeroAddress, IPFS_SPEC, { value: ONE_ETH }
        )
      ).to.be.revertedWithCustomError(s.escrow, "SlippageTooHigh")
    })

    it("reverts when amountIn is zero", async () => {
      const s = await deploy()
      await expect(
        s.escrow.connect(s.client).depositAndCreate(
          ethers.ZeroAddress, 0n, 0n, 3000, ethers.ZeroAddress, IPFS_SPEC, { value: 0n }
        )
      ).to.be.revertedWithCustomError(s.escrow, "AmountZero")
    })

    it("reverts when paused", async () => {
      const s = await deploy()
      await s.escrow.connect(s.owner).pause()
      await expect(
        s.escrow.connect(s.client).depositAndCreate(
          ethers.ZeroAddress, ONE_ETH, 0n, 3000, ethers.ZeroAddress, IPFS_SPEC, { value: ONE_ETH }
        )
      ).to.be.revertedWithCustomError(s.escrow, "EnforcedPause")
    })
  })

  // ── acceptJob ───────────────────────────────────────────────────────────────
  describe("acceptJob", () => {
    it("sets freelancer, status=InProgress, starts clock", async () => {
      const s = await deploy()
      const jobId = await createUSDCJob(s)
      await s.escrow.connect(s.freelancer).acceptJob(jobId)
      const job = await s.escrow.getJob(jobId)
      expect(job.freelancer).to.equal(s.freelancer.address)
      expect(job.status).to.equal(1n) // InProgress
      expect(job.acceptedAt).to.be.gt(0n)
    })

    it("emits JobAccepted", async () => {
      const s = await deploy()
      const jobId = await createUSDCJob(s)
      await expect(s.escrow.connect(s.freelancer).acceptJob(jobId))
        .to.emit(s.escrow, "JobAccepted")
    })

    // ─── FIX failure 3: .reverted → .rejected ────────────────────────────────
    it("any freelancer can accept open listing (address 0)", async () => {
      const s = await deploy()
      const jobId = await createUSDCJob(s, HUNDRED_USDC, ethers.ZeroAddress)
      await expect(s.escrow.connect(s.other).acceptJob(jobId)).to.not.be.rejected
    })

    it("enforces specific freelancer when set", async () => {
      const s = await deploy()
      const jobId = await createUSDCJob(s, HUNDRED_USDC, s.freelancer.address)
      await expect(s.escrow.connect(s.other).acceptJob(jobId))
        .to.be.revertedWithCustomError(s.escrow, "FreelancerMismatch")
    })

    it("client cannot accept their own job", async () => {
      const s = await deploy()
      const jobId = await createUSDCJob(s)
      await expect(s.escrow.connect(s.client).acceptJob(jobId))
        .to.be.revertedWithCustomError(s.escrow, "ClientCannotBeFreelancer")
    })

    it("reverts on wrong status", async () => {
      const s = await deploy()
      const jobId = await createUSDCJob(s)
      await s.escrow.connect(s.freelancer).acceptJob(jobId)
      await expect(s.escrow.connect(s.other).acceptJob(jobId))
        .to.be.revertedWithCustomError(s.escrow, "WrongStatus")
    })

    it("reverts when paused", async () => {
      const s = await deploy()
      const jobId = await createUSDCJob(s)
      await s.escrow.connect(s.owner).pause()
      await expect(s.escrow.connect(s.freelancer).acceptJob(jobId))
        .to.be.revertedWithCustomError(s.escrow, "EnforcedPause")
    })
  })

  // ── submitWork ──────────────────────────────────────────────────────────────
  describe("submitWork", () => {
    it("stores CID, sets status=Delivered, emits WorkSubmitted", async () => {
      const s = await deploy()
      const jobId = await createUSDCJob(s)
      await s.escrow.connect(s.freelancer).acceptJob(jobId)
      await expect(s.escrow.connect(s.freelancer).submitWork(jobId, IPFS_WORK))
        .to.emit(s.escrow, "WorkSubmitted")
        .withArgs(jobId, s.freelancer.address, IPFS_WORK)
      const job = await s.escrow.getJob(jobId)
      expect(job.ipfsDeliverable).to.equal(IPFS_WORK)
      expect(job.status).to.equal(2n) // Delivered
    })

    it("reverts if not freelancer", async () => {
      const s = await deploy()
      const jobId = await createUSDCJob(s)
      await s.escrow.connect(s.freelancer).acceptJob(jobId)
      await expect(s.escrow.connect(s.client).submitWork(jobId, IPFS_WORK))
        .to.be.revertedWithCustomError(s.escrow, "NotFreelancer")
    })

    it("reverts on wrong status", async () => {
      const s = await deploy()
      const jobId = await createUSDCJob(s)
      await expect(s.escrow.connect(s.freelancer).submitWork(jobId, IPFS_WORK))
        .to.be.revertedWithCustomError(s.escrow, "WrongStatus")
    })
  })

  // ── approveWork + KeeperHub ─────────────────────────────────────────────────
  describe("approveWork — KeeperHub registration", () => {
    it("registers task, sets status=Approved, stores taskId", async () => {
      const s = await deploy()
      const jobId = await toDelivered(s)
      await expect(s.escrow.connect(s.client).approveWork(jobId))
        .to.emit(s.escrow, "WorkApproved")
      const job = await s.escrow.getJob(jobId)
      expect(job.status).to.equal(3n) // Approved
      expect(job.keeperTaskId).to.not.equal(ethers.ZeroHash)
    })

    it("taskToJob mapping is correct", async () => {
      const s = await deploy()
      const jobId = await toDelivered(s)
      await s.escrow.connect(s.client).approveWork(jobId)
      const job = await s.escrow.getJob(jobId)
      expect(await s.escrow.taskToJob(job.keeperTaskId)).to.equal(jobId)
    })

    it("reverts if not client", async () => {
      const s = await deploy()
      const jobId = await toDelivered(s)
      await expect(s.escrow.connect(s.freelancer).approveWork(jobId))
        .to.be.revertedWithCustomError(s.escrow, "NotClient")
    })

    it("reverts on wrong status", async () => {
      const s = await deploy()
      const jobId = await createUSDCJob(s)
      await s.escrow.connect(s.freelancer).acceptJob(jobId)
      await expect(s.escrow.connect(s.client).approveWork(jobId))
        .to.be.revertedWithCustomError(s.escrow, "WrongStatus")
    })
  })

  // ── _executeRelease (KeeperHub) ─────────────────────────────────────────────
  describe("_executeRelease", () => {
    it("keeper releases USDC to freelancer, status=Completed", async () => {
      const s = await deploy()
      const jobId = await toApproved(s)
      const before = await s.usdc.balanceOf(s.freelancer.address)
      // Route through keeperHub.directCall — keeperHub is the authorized keeper
      await keeperRelease(s, jobId)
      expect(await s.usdc.balanceOf(s.freelancer.address) - before).to.equal(HUNDRED_USDC)
      expect((await s.escrow.getJob(jobId)).status).to.equal(4n) // Completed
    })

    it("emits PaymentReleased", async () => {
      const s = await deploy()
      const jobId = await toApproved(s)
      const data = s.escrow.interface.encodeFunctionData("_executeRelease", [jobId])
      await expect(s.keeperHub.connect(s.keeper).directCall(s.escrowAddr, data))
        .to.emit(s.escrow, "PaymentReleased")
        .withArgs(jobId, s.freelancer.address, HUNDRED_USDC, 0n)
    })

    it("deducts fee when feeBps > 0", async () => {
      const s = await deploy()
      await s.escrow.connect(s.owner).setFee(200n) // 2%
      const jobId = await toApproved(s)
      const fee = (HUNDRED_USDC * 200n) / 10_000n
      const net = HUNDRED_USDC - fee
      const before = await s.usdc.balanceOf(s.freelancer.address)
      await keeperRelease(s, jobId)
      expect(await s.usdc.balanceOf(s.freelancer.address) - before).to.equal(net)
      expect(await s.escrow.accruedFees()).to.equal(fee)
    })

    it("reverts if not keeper", async () => {
      const s = await deploy()
      const jobId = await toApproved(s)
      // client is not the keeper (keeperHub address), so this should revert
      await expect(s.escrow.connect(s.client)._executeRelease(jobId))
        .to.be.revertedWithCustomError(s.escrow, "NotKeeper")
    })

    // ─── FIX failure 4: full flow via MockKeeperHub.executeTask() ─────────────
    it("full flow via MockKeeperHub.executeTask()", async () => {
      const s = await deploy()
      const jobId = await toDelivered(s)
      await s.escrow.connect(s.client).approveWork(jobId)
      const taskId = (await s.escrow.getJob(jobId)).keeperTaskId

      const before = await s.usdc.balanceOf(s.freelancer.address)
      // executeTask() calls escrow._executeRelease() with msg.sender = keeperHub ✓
      await s.keeperHub.connect(s.keeper).executeTask(taskId)
      expect(await s.usdc.balanceOf(s.freelancer.address) - before).to.equal(HUNDRED_USDC)
      expect((await s.escrow.getJob(jobId)).status).to.equal(4n) // Completed
    })
  })

  // ── reclaimAfterTimeout ─────────────────────────────────────────────────────
  describe("reclaimAfterTimeout", () => {
    it("reverts before 30 days", async () => {
      const s = await deploy()
      const jobId = await createUSDCJob(s)
      await s.escrow.connect(s.freelancer).acceptJob(jobId)
      await expect(s.escrow.connect(s.freelancer).reclaimAfterTimeout(jobId))
        .to.be.revertedWithCustomError(s.escrow, "TimeoutNotReached")
    })

    it("allows reclaim after TIMEOUT, transfers USDC, status=Reclaimed", async () => {
      const s = await deploy()
      const jobId = await createUSDCJob(s)
      await s.escrow.connect(s.freelancer).acceptJob(jobId)
      await networkHelpers.time.increase(THIRTY_DAYS + 1)
      const before = await s.usdc.balanceOf(s.freelancer.address)
      await expect(s.escrow.connect(s.freelancer).reclaimAfterTimeout(jobId))
        .to.emit(s.escrow, "PaymentReclaimed")
        .withArgs(jobId, s.freelancer.address, HUNDRED_USDC)
      expect(await s.usdc.balanceOf(s.freelancer.address) - before).to.equal(HUNDRED_USDC)
      expect((await s.escrow.getJob(jobId)).status).to.equal(5n) // Reclaimed
    })

    it("also works from Delivered status", async () => {
      const s = await deploy()
      const jobId = await toDelivered(s)
      await networkHelpers.time.increase(THIRTY_DAYS + 1)
      const before = await s.usdc.balanceOf(s.freelancer.address)
      await s.escrow.connect(s.freelancer).reclaimAfterTimeout(jobId)
      expect(await s.usdc.balanceOf(s.freelancer.address) - before).to.equal(HUNDRED_USDC)
    })

    it("reverts if not freelancer", async () => {
      const s = await deploy()
      const jobId = await createUSDCJob(s)
      await s.escrow.connect(s.freelancer).acceptJob(jobId)
      await networkHelpers.time.increase(THIRTY_DAYS + 1)
      await expect(s.escrow.connect(s.other).reclaimAfterTimeout(jobId))
        .to.be.revertedWithCustomError(s.escrow, "NotFreelancer")
    })

    it("timeoutRemainingSeconds reaches 0 after timeout", async () => {
      const s = await deploy()
      const jobId = await createUSDCJob(s)
      await s.escrow.connect(s.freelancer).acceptJob(jobId)
      const initial = await s.escrow.timeoutRemainingSeconds(jobId)
      expect(initial).to.be.closeTo(BigInt(THIRTY_DAYS), 5n)
      await networkHelpers.time.increase(THIRTY_DAYS + 1)
      expect(await s.escrow.timeoutRemainingSeconds(jobId)).to.equal(0n)
    })
  })

  // ── cancelJob ───────────────────────────────────────────────────────────────
  describe("cancelJob", () => {
    it("refunds client in full, status=Cancelled", async () => {
      const s = await deploy()
      const jobId = await createUSDCJob(s)
      const before = await s.usdc.balanceOf(s.client.address)
      await expect(s.escrow.connect(s.client).cancelJob(jobId))
        .to.emit(s.escrow, "JobCancelled")
        .withArgs(jobId, s.client.address, HUNDRED_USDC)
      expect(await s.usdc.balanceOf(s.client.address) - before).to.equal(HUNDRED_USDC)
      expect((await s.escrow.getJob(jobId)).status).to.equal(6n) // Cancelled
    })

    it("reverts if not client", async () => {
      const s = await deploy()
      const jobId = await createUSDCJob(s)
      await expect(s.escrow.connect(s.other).cancelJob(jobId))
        .to.be.revertedWithCustomError(s.escrow, "NotClient")
    })

    it("reverts once freelancer has accepted", async () => {
      const s = await deploy()
      const jobId = await createUSDCJob(s)
      await s.escrow.connect(s.freelancer).acceptJob(jobId)
      await expect(s.escrow.connect(s.client).cancelJob(jobId))
        .to.be.revertedWithCustomError(s.escrow, "WrongStatus")
    })
  })

  // ── Fee management ──────────────────────────────────────────────────────────
  describe("Fee management", () => {
    it("owner can set fee up to 5%", async () => {
      const { escrow, owner } = await deploy()
      await expect(escrow.connect(owner).setFee(500n))
        .to.emit(escrow, "FeeUpdated").withArgs(0n, 500n)
      expect(await escrow.feeBps()).to.equal(500n)
    })

    it("reverts if fee > 5%", async () => {
      const { escrow, owner } = await deploy()
      await expect(escrow.connect(owner).setFee(501n))
        .to.be.revertedWithCustomError(escrow, "FeeTooHigh")
    })

    it("owner can withdraw accrued fees", async () => {
      const s = await deploy()
      await s.escrow.connect(s.owner).setFee(200n)
      const jobId = await toApproved(s)
      await keeperRelease(s, jobId)
      const fee = (HUNDRED_USDC * 200n) / 10_000n
      const before = await s.usdc.balanceOf(s.owner.address)
      await expect(s.escrow.connect(s.owner).withdrawFees())
        .to.emit(s.escrow, "FeesWithdrawn")
        .withArgs(s.owner.address, fee)
      expect(await s.usdc.balanceOf(s.owner.address) - before).to.equal(fee)
    })

    it("reverts withdrawFees when nothing accrued", async () => {
      const { escrow, owner } = await deploy()
      await expect(escrow.connect(owner).withdrawFees())
        .to.be.revertedWithCustomError(escrow, "NoFeesToWithdraw")
    })
  })

  // ── Pause ───────────────────────────────────────────────────────────────────
  describe("Pause", () => {
    it("owner can pause and unpause", async () => {
      const { escrow, owner } = await deploy()
      await escrow.connect(owner).pause()
      expect(await escrow.paused()).to.be.true
      await escrow.connect(owner).unpause()
      expect(await escrow.paused()).to.be.false
    })

    it("non-owner cannot pause", async () => {
      const { escrow, other } = await deploy()
      await expect(escrow.connect(other).pause())
        .to.be.revertedWithCustomError(escrow, "OwnableUnauthorizedAccount")
    })

    // ─── FIX failure 5: .revert(ethers) → .rejected ──────────────────────────
    it("_executeRelease still works when paused", async () => {
      const s = await deploy()
      const jobId = await toApproved(s)
      await s.escrow.connect(s.owner).pause()
      const data = s.escrow.interface.encodeFunctionData("_executeRelease", [jobId])
      await expect(
        s.keeperHub.connect(s.keeper).directCall(s.escrowAddr, data)
      ).to.not.be.rejected
    })
  })

  // ── CEI / reentrancy ────────────────────────────────────────────────────────
  describe("CEI — state zeroed before transfers", () => {
    it("amountUSDC is 0 after release", async () => {
      const s = await deploy()
      const jobId = await toApproved(s)
      await keeperRelease(s, jobId)
      expect((await s.escrow.getJob(jobId)).amountUSDC).to.equal(0n)
    })

    it("amountUSDC is 0 after reclaim", async () => {
      const s = await deploy()
      const jobId = await createUSDCJob(s)
      await s.escrow.connect(s.freelancer).acceptJob(jobId)
      await networkHelpers.time.increase(THIRTY_DAYS + 1)
      await s.escrow.connect(s.freelancer).reclaimAfterTimeout(jobId)
      expect((await s.escrow.getJob(jobId)).amountUSDC).to.equal(0n)
    })

    it("amountUSDC is 0 after cancel", async () => {
      const s = await deploy()
      const jobId = await createUSDCJob(s)
      await s.escrow.connect(s.client).cancelJob(jobId)
      expect((await s.escrow.getJob(jobId)).amountUSDC).to.equal(0n)
    })
  })

  // ── Concurrent jobs ─────────────────────────────────────────────────────────
  describe("Concurrent jobs", () => {
    it("three jobs resolve independently", async () => {
      const s = await deploy()
      const j1 = await createUSDCJob(s)
      const j2 = await createUSDCJob(s)
      const j3 = await createUSDCJob(s)
      expect(await s.escrow.totalLockedUSDC()).to.equal(HUNDRED_USDC * 3n)

      // j1 → complete via keeperRelease
      await s.escrow.connect(s.freelancer).acceptJob(j1)
      await s.escrow.connect(s.freelancer).submitWork(j1, IPFS_WORK)
      await s.escrow.connect(s.client).approveWork(j1)
      await keeperRelease(s, j1)

      // j2 → cancelled
      await s.escrow.connect(s.client).cancelJob(j2)

      // j3 → reclaimed
      await s.escrow.connect(s.freelancer).acceptJob(j3)
      await networkHelpers.time.increase(THIRTY_DAYS + 1)
      await s.escrow.connect(s.freelancer).reclaimAfterTimeout(j3)

      expect((await s.escrow.getJob(j1)).status).to.equal(4n) // Completed
      expect((await s.escrow.getJob(j2)).status).to.equal(6n) // Cancelled
      expect((await s.escrow.getJob(j3)).status).to.equal(5n) // Reclaimed
      expect(await s.escrow.totalLockedUSDC()).to.equal(0n)
    })
  })

})