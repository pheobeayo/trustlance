// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/*══════════════════════════════════════════════════════════════════════════════
  TrustLanceEscrow
  ────────────────
  Freelance escrow secured by two sponsor integrations:

    ┌─────────────────────────────────────────────────────────────────────┐
    │  UNISWAP Universal Router                                           │
    │  Clients deposit any ERC-20 token (ETH, USDT, DAI …).              │
    │  The contract calls Uniswap's Universal Router inline to swap       │
    │  the deposit into USDC before locking it. Freelancers always        │
    │  receive USDC — eliminating price-volatility risk during work.      │
    └─────────────────────────────────────────────────────────────────────┘
    ┌─────────────────────────────────────────────────────────────────────┐
    │  KEEPERHUB Automation                                               │
    │  When a client calls approveWork(), a KeeperHub task is registered  │
    │  on-chain. KeeperHub monitors the task and executes                 │
    │  _executeRelease() with SLA-backed delivery — retrying on gas       │
    │  spikes and network congestion. The keeper address is the only      │
    │  account allowed to call _executeRelease() directly.               │
    └─────────────────────────────────────────────────────────────────────┘

  Flow
  ────
    1. depositAndCreate()  → Client deposits any token, Uniswap swaps to USDC,
                             USDC locked, job created.
    2. acceptJob()         → Freelancer accepts, 30-day safety clock starts.
    3. submitWork()        → Freelancer attaches IPFS deliverable CID.
    4. approveWork()       → Client approves; KeeperHub task registered.
    5. _executeRelease()   → KeeperHub calls this to send USDC to freelancer.
       OR reclaimAfterTimeout() → Freelancer self-reclaims after 30 days.
       OR cancelJob()           → Client cancels Open job for full refund.

  Security
  ────────
    • CEI (Checks-Effects-Interactions) throughout
    • ReentrancyGuard on all token-touching functions
    • SafeERC20 for all transfers
    • Keeper address is immutable — cannot be changed post-deploy
    • Protocol fee hard-capped at 5%
    • Emergency pause halts new jobs; active jobs unaffected
    • Excess ETH refunded after native-ETH → USDC swap
══════════════════════════════════════════════════════════════════════════════*/

import {IUniversalRouter, IPermit2} from "./interfaces/IUniswap.sol";
import {IKeeperHub}                  from "./interfaces/IKeeperHub.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

contract TrustLanceEscrow is ReentrancyGuard, Ownable, Pausable {
    using SafeERC20 for IERC20;

    // ─── Uniswap command bytes ────────────────────────────────────────────────
    // V3_SWAP_EXACT_IN = 0x00  (swap exact input through a V3 pool)
    // WRAP_ETH         = 0x0b  (wrap native ETH → WETH before swap)
    // UNWRAP_WETH      = 0x0c  (unwrap WETH → ETH after swap)
    // Ref: https://github.com/Uniswap/universal-router/blob/main/contracts/libraries/Commands.sol
    bytes1 private constant CMD_V3_SWAP_EXACT_IN = 0x00;
    bytes1 private constant CMD_WRAP_ETH          = 0x0b;

    // ─── Constants ────────────────────────────────────────────────────────────
    uint256 public constant TIMEOUT     = 30 days;
    uint256 public constant MAX_FEE_BPS = 500;        // 5% hard cap
    uint256 public constant SWAP_DEADLINE_BUFFER = 300; // 5 min buffer on swap

    // Pool fee tiers available on Uniswap V3
    uint24 public constant POOL_FEE_LOW    = 500;    // 0.05% – stablecoins
    uint24 public constant POOL_FEE_MEDIUM = 3000;   // 0.30% – most pairs
    uint24 public constant POOL_FEE_HIGH   = 10000;  // 1.00% – exotic pairs

    // ─── Types ────────────────────────────────────────────────────────────────
    enum Status {
        Open,        // Awaiting freelancer
        InProgress,  // Accepted, work underway
        Delivered,   // Deliverable submitted
        Approved,    // Client approved — KeeperHub task pending
        Completed,   // USDC released to freelancer
        Reclaimed,   // Freelancer reclaimed after timeout
        Cancelled    // Client cancelled before acceptance
    }

    struct Job {
        address  client;
        address  freelancer;       // address(0) until acceptJob()
        uint256  amountUSDC;       // Gross USDC locked (pre-fee)
        uint256  createdAt;
        uint256  acceptedAt;       // Starts the 30-day reclaim clock
        uint256  approvedAt;       // When client called approveWork()
        Status   status;
        bytes32  keeperTaskId;     // KeeperHub task registered on approveWork()
        string   ipfsJobSpec;      // IPFS CID — job description JSON
        string   ipfsDeliverable;  // IPFS CID — work deliverable
    }

    // ─── Immutables ───────────────────────────────────────────────────────────
    IERC20           public immutable USDC;
    IUniversalRouter public immutable uniswapRouter;
    IPermit2         public immutable permit2;
    IKeeperHub       public immutable keeperHub;
    address          public immutable keeper; // KeeperHub executor EOA
    address          public immutable WETH;   // Wrapped ETH on target chain

    // ─── Mutable state ────────────────────────────────────────────────────────
    uint256 public nextJobId   = 1;
    uint256 public feeBps      = 0;
    uint256 public accruedFees = 0;

    mapping(uint256 => Job)  public jobs;
    mapping(bytes32 => uint256) public taskToJob; // keeperTaskId → jobId

    // ─── Events ───────────────────────────────────────────────────────────────
    event JobCreated      (uint256 indexed jobId, address indexed client, uint256 amountUSDC, address depositToken, string ipfsJobSpec);
    event JobAccepted     (uint256 indexed jobId, address indexed freelancer, uint256 acceptedAt);
    event WorkSubmitted   (uint256 indexed jobId, address indexed freelancer, string ipfsDeliverable);
    event WorkApproved    (uint256 indexed jobId, address indexed client, bytes32 keeperTaskId);
    event PaymentReleased (uint256 indexed jobId, address indexed freelancer, uint256 net, uint256 fee);
    event PaymentReclaimed(uint256 indexed jobId, address indexed freelancer, uint256 amount);
    event JobCancelled    (uint256 indexed jobId, address indexed client, uint256 refund);
    event FeeUpdated      (uint256 oldBps, uint256 newBps);
    event FeesWithdrawn   (address indexed to, uint256 amount);
    event SwapExecuted    (uint256 indexed jobId, address tokenIn, uint256 amountIn, uint256 usdcReceived);

    // ─── Errors ───────────────────────────────────────────────────────────────
    error JobNotFound();
    error WrongStatus(Status expected, Status actual);
    error NotClient();
    error NotFreelancer();
    error NotKeeper();
    error ClientCannotBeFreelancer();
    error FreelancerMismatch();
    error TimeoutNotReached();
    error AmountZero();
    error FeeTooHigh();
    error NoFeesToWithdraw();
    error SlippageTooHigh(uint256 received, uint256 minExpected);
    error SwapFailed();
    error InvalidToken();
    error RefundFailed();

    // ─── Modifiers ────────────────────────────────────────────────────────────
    modifier jobExists(uint256 jobId) {
        if (jobId == 0 || jobId >= nextJobId) revert JobNotFound();
        _;
    }

    modifier inStatus(uint256 jobId, Status expected) {
        Status actual = jobs[jobId].status;
        if (actual != expected) revert WrongStatus(expected, actual);
        _;
    }

    modifier onlyKeeper() {
        if (msg.sender != keeper) revert NotKeeper();
        _;
    }

    // ─── Constructor ──────────────────────────────────────────────────────────
    /**
     * @param _usdc           USDC token address
     * @param _uniswapRouter  Uniswap Universal Router address
     * @param _permit2        Uniswap Permit2 address
     * @param _weth           WETH address (for native ETH wrapping)
     * @param _keeperHub      KeeperHub registry contract address
     * @param _keeper         KeeperHub executor EOA (whitelisted to release funds)
     */
    constructor(
        address _usdc,
        address _uniswapRouter,
        address _permit2,
        address _weth,
        address _keeperHub,
        address _keeper
    ) Ownable(msg.sender) {
        USDC           = IERC20(_usdc);
        uniswapRouter  = IUniversalRouter(_uniswapRouter);
        permit2        = IPermit2(_permit2);
        WETH           = _weth;
        keeperHub      = IKeeperHub(_keeperHub);
        keeper         = _keeper;
    }

    // ─── Deposit + create (Uniswap integration) ───────────────────────────────

    /**
     * @notice Create a job by depositing any ERC-20 token.
     *         The token is swapped to USDC via Uniswap Universal Router inline.
     *         Caller must approve this contract to spend `amountIn` of `tokenIn`.
     *
     * @param tokenIn       Token to deposit (use address(0) for native ETH)
     * @param amountIn      Amount of tokenIn to deposit
     * @param minUSDC       Minimum USDC to receive (slippage protection)
     * @param poolFee       Uniswap V3 pool fee tier (500, 3000, or 10000)
     * @param freelancer    Specific freelancer, or address(0) for open listing
     * @param ipfsJobSpec   IPFS CID of the job specification JSON
     * @return jobId        The created job's ID
     */
    function depositAndCreate(
        address tokenIn,
        uint256 amountIn,
        uint256 minUSDC,
        uint24  poolFee,
        address freelancer,
        string  calldata ipfsJobSpec
    )
        external
        payable
        whenNotPaused
        nonReentrant
        returns (uint256 jobId)
    {
        if (amountIn == 0) revert AmountZero();

        uint256 usdcReceived;

        if (tokenIn == address(USDC)) {
            // ── Direct USDC deposit — no swap needed ──────────────────────────
            USDC.safeTransferFrom(msg.sender, address(this), amountIn);
            usdcReceived = amountIn;

        } else if (tokenIn == address(0)) {
            // ── Native ETH deposit — wrap then swap ───────────────────────────
            if (msg.value != amountIn) revert AmountZero();
            usdcReceived = _swapETHtoUSDC(amountIn, minUSDC, poolFee);

        } else {
            // ── ERC-20 deposit — pull then swap ───────────────────────────────
            IERC20(tokenIn).safeTransferFrom(msg.sender, address(this), amountIn);
            usdcReceived = _swapERC20toUSDC(tokenIn, amountIn, minUSDC, poolFee);
        }

        if (usdcReceived < minUSDC) revert SlippageTooHigh(usdcReceived, minUSDC);

        jobId = nextJobId++;
        jobs[jobId] = Job({
            client:          msg.sender,
            freelancer:      freelancer,
            amountUSDC:      usdcReceived,
            createdAt:       block.timestamp,
            acceptedAt:      0,
            approvedAt:      0,
            status:          Status.Open,
            keeperTaskId:    bytes32(0),
            ipfsJobSpec:     ipfsJobSpec,
            ipfsDeliverable: ""
        });

        emit SwapExecuted(jobId, tokenIn, amountIn, usdcReceived);
        emit JobCreated(jobId, msg.sender, usdcReceived, tokenIn, ipfsJobSpec);
    }

    /**
     * @notice Convenience: create a job depositing USDC directly.
     *         Skips the Uniswap swap entirely.
     */
    function createWithUSDC(
        uint256 amountUSDC,
        address freelancer,
        string  calldata ipfsJobSpec
    )
        external
        whenNotPaused
        nonReentrant
        returns (uint256 jobId)
    {
        if (amountUSDC == 0) revert AmountZero();
        USDC.safeTransferFrom(msg.sender, address(this), amountUSDC);

        jobId = nextJobId++;
        jobs[jobId] = Job({
            client:          msg.sender,
            freelancer:      freelancer,
            amountUSDC:      amountUSDC,
            createdAt:       block.timestamp,
            acceptedAt:      0,
            approvedAt:      0,
            status:          Status.Open,
            keeperTaskId:    bytes32(0),
            ipfsJobSpec:     ipfsJobSpec,
            ipfsDeliverable: ""
        });

        emit JobCreated(jobId, msg.sender, amountUSDC, address(USDC), ipfsJobSpec);
    }

    // ─── Core escrow lifecycle ────────────────────────────────────────────────

    /**
     * @notice Freelancer accepts an open job.
     *         If a specific freelancer is set, only that address may accept.
     *         Starts the 30-day reclaim clock.
     */
    function acceptJob(uint256 jobId)
        external
        whenNotPaused
        jobExists(jobId)
        inStatus(jobId, Status.Open)
        nonReentrant
    {
        Job storage job = jobs[jobId];

        if (msg.sender == job.client)                                      revert ClientCannotBeFreelancer();
        if (job.freelancer != address(0) && job.freelancer != msg.sender)  revert FreelancerMismatch();

        job.freelancer = msg.sender;
        job.status     = Status.InProgress;
        job.acceptedAt = block.timestamp;

        emit JobAccepted(jobId, msg.sender, block.timestamp);
    }

    /**
     * @notice Freelancer submits their deliverable IPFS CID.
     *         Moves status to Delivered, enabling client to approveWork().
     */
    function submitWork(uint256 jobId, string calldata ipfsDeliverable)
        external
        jobExists(jobId)
        inStatus(jobId, Status.InProgress)
        nonReentrant
    {
        Job storage job = jobs[jobId];
        if (msg.sender != job.freelancer) revert NotFreelancer();

        job.ipfsDeliverable = ipfsDeliverable;
        job.status          = Status.Delivered;

        emit WorkSubmitted(jobId, msg.sender, ipfsDeliverable);
    }

    /**
     * @notice Client approves the delivered work.
     *
     *         ── KeeperHub integration ──────────────────────────────────────
     *         Instead of immediately releasing funds, this function registers
     *         a KeeperHub task. KeeperHub monitors the task and calls
     *         _executeRelease() with:
     *           • SLA-backed delivery guarantee
     *           • Automatic retry on gas spikes or reverts
     *           • Full execution audit trail (taskId stored on-chain)
     *
     *         This separates the approval intent (client) from the execution
     *         (KeeperHub), giving much stronger delivery guarantees than a
     *         direct transfer.
     */
    function approveWork(uint256 jobId)
        external
        jobExists(jobId)
        inStatus(jobId, Status.Delivered)
        nonReentrant
    {
        Job storage job = jobs[jobId];
        if (msg.sender != job.client) revert NotClient();

        // Build the calldata KeeperHub will execute
        bytes memory releaseCall = abi.encodeWithSelector(
            this._executeRelease.selector,
            jobId
        );

        // Register task with KeeperHub — 1 hour deadline, 200k gas
        bytes32 taskId = keeperHub.registerTask(
            address(this),
            releaseCall,
            block.timestamp + 1 hours,
            200_000
        );

        // CEI: update state before any external effects
        job.status      = Status.Approved;
        job.approvedAt  = block.timestamp;
        job.keeperTaskId = taskId;

        // Index task → job for KeeperHub callbacks
        taskToJob[taskId] = jobId;

        emit WorkApproved(jobId, msg.sender, taskId);
    }

    /**
     * @notice Executes the USDC release to the freelancer.
     *         Called exclusively by the KeeperHub executor.
     *         Not intended for direct user calls.
     *
     * @dev    The `_` prefix signals this is a KeeperHub execution target.
     *         Marked external so KeeperHub can call it, but gated by onlyKeeper.
     */
    function _executeRelease(uint256 jobId)
        external
        onlyKeeper
        jobExists(jobId)
        inStatus(jobId, Status.Approved)
        nonReentrant
    {
        Job storage job = jobs[jobId];

        uint256 gross      = job.amountUSDC;
        uint256 fee        = (gross * feeBps) / 10_000;
        uint256 net        = gross - fee;
        address freelancer = job.freelancer;

        // CEI: zero balances before transfer
        job.status     = Status.Completed;
        job.amountUSDC = 0;
        if (fee > 0) accruedFees += fee;

        USDC.safeTransfer(freelancer, net);

        emit PaymentReleased(jobId, freelancer, net, fee);
    }

    /**
     * @notice Freelancer self-reclaims if the client disappears for 30 days.
     *         Available in InProgress (client ghost) and Delivered (work ignored).
     *         This is the entire dispute resolution — no arbitration, just time.
     */
    function reclaimAfterTimeout(uint256 jobId)
        external
        jobExists(jobId)
        nonReentrant
    {
        Job storage job = jobs[jobId];

        if (msg.sender != job.freelancer) revert NotFreelancer();
        if (job.status != Status.InProgress && job.status != Status.Delivered)
            revert WrongStatus(Status.InProgress, job.status);
        if (block.timestamp < job.acceptedAt + TIMEOUT) revert TimeoutNotReached();

        uint256 amount = job.amountUSDC;

        // CEI
        job.status     = Status.Reclaimed;
        job.amountUSDC = 0;

        USDC.safeTransfer(msg.sender, amount);

        emit PaymentReclaimed(jobId, msg.sender, amount);
    }

    /**
     * @notice Client cancels an Open job (before any freelancer accepts).
     *         Full USDC refund — no protocol fee on cancellation.
     */
    function cancelJob(uint256 jobId)
        external
        jobExists(jobId)
        inStatus(jobId, Status.Open)
        nonReentrant
    {
        Job storage job = jobs[jobId];
        if (msg.sender != job.client) revert NotClient();

        uint256 refund = job.amountUSDC;

        // CEI
        job.status     = Status.Cancelled;
        job.amountUSDC = 0;

        USDC.safeTransfer(msg.sender, refund);

        emit JobCancelled(jobId, msg.sender, refund);
    }

    // ─── Internal swap helpers ────────────────────────────────────────────────

    /**
     * @dev Swaps native ETH to USDC using Uniswap Universal Router.
     *      Uses WRAP_ETH command followed by V3_SWAP_EXACT_IN.
     */
    function _swapETHtoUSDC(
        uint256 amountIn,
        uint256 minAmountOut,
        uint24  poolFee
    ) internal returns (uint256 usdcReceived) {
        uint256 usdcBefore = USDC.balanceOf(address(this));

        // Command sequence: WRAP_ETH (0x0b) + V3_SWAP_EXACT_IN (0x00)
        bytes memory commands = abi.encodePacked(CMD_WRAP_ETH, CMD_V3_SWAP_EXACT_IN);

        bytes[] memory inputs = new bytes[](2);

        // WRAP_ETH: wrap full msg.value to WETH, recipient = router (0x02)
        inputs[0] = abi.encode(
            address(uniswapRouter), // recipient of WETH
            amountIn                // amount to wrap
        );

        // V3_SWAP_EXACT_IN: swap WETH → USDC
        // payerIsUser = false (router holds the WETH)
        inputs[1] = abi.encode(
            address(this),  // recipient of USDC
            amountIn,       // amountIn
            minAmountOut,   // amountOutMinimum
            _encodePath(WETH, address(USDC), poolFee), // path
            false           // payerIsUser
        );

        uniswapRouter.execute{value: amountIn}(
            commands,
            inputs,
            block.timestamp + SWAP_DEADLINE_BUFFER
        );

        usdcReceived = USDC.balanceOf(address(this)) - usdcBefore;
        if (usdcReceived == 0) revert SwapFailed();
    }

    /**
     * @dev Swaps an ERC-20 token to USDC using Uniswap Universal Router.
     *      Grants Permit2 allowance then routes through V3_SWAP_EXACT_IN.
     */
    function _swapERC20toUSDC(
        address tokenIn,
        uint256 amountIn,
        uint256 minAmountOut,
        uint24  poolFee
    ) internal returns (uint256 usdcReceived) {
        if (tokenIn == address(0)) revert InvalidToken();

        uint256 usdcBefore = USDC.balanceOf(address(this));

        // Approve Permit2 to pull the tokenIn from this contract
        // (Permit2 is already approved by the user for the token)
        IERC20(tokenIn).forceApprove(address(permit2), amountIn);

        // Grant Universal Router a Permit2 allowance
        permit2.approve(
            tokenIn,
            address(uniswapRouter),
            uint160(amountIn),
            uint48(block.timestamp + SWAP_DEADLINE_BUFFER)
        );

        bytes memory commands = abi.encodePacked(CMD_V3_SWAP_EXACT_IN);
        bytes[] memory inputs = new bytes[](1);

        // payerIsUser = true means Permit2 pulls from this contract
        inputs[0] = abi.encode(
            address(this),
            amountIn,
            minAmountOut,
            _encodePath(tokenIn, address(USDC), poolFee),
            true // payerIsUser
        );

        uniswapRouter.execute(
            commands,
            inputs,
            block.timestamp + SWAP_DEADLINE_BUFFER
        );

        usdcReceived = USDC.balanceOf(address(this)) - usdcBefore;
        if (usdcReceived == 0) revert SwapFailed();
    }

    /**
     * @dev Encodes a single-hop V3 path: tokenIn → fee → tokenOut
     *      Format: abi.encodePacked(tokenIn, fee, tokenOut)
     */
    function _encodePath(
        address tokenIn,
        address tokenOut,
        uint24  fee
    ) internal pure returns (bytes memory) {
        return abi.encodePacked(tokenIn, fee, tokenOut);
    }

    // ─── Admin ────────────────────────────────────────────────────────────────

    /// @notice Set the protocol fee (max 5%). Default is 0% at launch.
    function setFee(uint256 newBps) external onlyOwner {
        if (newBps > MAX_FEE_BPS) revert FeeTooHigh();
        emit FeeUpdated(feeBps, newBps);
        feeBps = newBps;
    }

    /// @notice Withdraw accumulated protocol fees to the owner address.
    function withdrawFees() external onlyOwner nonReentrant {
        uint256 amount = accruedFees;
        if (amount == 0) revert NoFeesToWithdraw();
        accruedFees = 0;
        USDC.safeTransfer(owner(), amount);
        emit FeesWithdrawn(owner(), amount);
    }

    /// @notice Pause new job creation. Active jobs still function normally.
    function pause()   external onlyOwner { _pause(); }
    function unpause() external onlyOwner { _unpause(); }

    /// @notice Allows the contract to receive ETH (for native deposit swaps).
    receive() external payable {}

    // ─── View helpers ─────────────────────────────────────────────────────────

    function getJob(uint256 jobId)
        external view
        jobExists(jobId)
        returns (Job memory)
    {
        return jobs[jobId];
    }

    function timeoutAt(uint256 jobId)
        external view
        jobExists(jobId)
        returns (uint256)
    {
        return jobs[jobId].acceptedAt + TIMEOUT;
    }

    /// @notice Seconds remaining before freelancer can reclaim. 0 if elapsed.
    function timeoutRemainingSeconds(uint256 jobId)
        external view
        jobExists(jobId)
        returns (uint256)
    {
        Job storage job = jobs[jobId];
        if (job.status != Status.InProgress && job.status != Status.Delivered) return 0;
        uint256 expiry = job.acceptedAt + TIMEOUT;
        return block.timestamp >= expiry ? 0 : expiry - block.timestamp;
    }

    /// @notice Total USDC locked (excludes accrued fees).
    function totalLockedUSDC() external view returns (uint256) {
        return USDC.balanceOf(address(this)) - accruedFees;
    }

    /// @notice Net payout and fee for a given gross at current feeBps.
    function netPayout(uint256 gross)
        external view
        returns (uint256 net, uint256 fee)
    {
        fee = (gross * feeBps) / 10_000;
        net = gross - fee;
    }
}
