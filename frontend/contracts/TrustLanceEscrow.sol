// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title TrustLanceEscrow
 * @notice Sybil-resistant freelance escrow. Both parties must hold
 *         a World ID verification. Funds are held in USDC; clients
 *         deposit any whitelisted token — the swap to USDC is done
 *         via Uniswap in the frontend before calling createEscrow.
 *         Payment release is routed through KeeperHub for SLA-backed execution.
 */
contract TrustLanceEscrow is ReentrancyGuard {
    using SafeERC20 for IERC20;

    // ─── Types ────────────────────────────────────────────────────────────────

    enum Status { Open, InProgress, Delivered, Completed, Reclaimed }

    struct Job {
        address client;
        address freelancer;      // address(0) until accepted
        uint256 amountUSDC;
        string  ipfsJobSpec;     // IPFS CID of the job description
        string  ipfsDeliverable; // IPFS CID set on submitWork
        Status  status;
        uint256 acceptedAt;      // timestamp of acceptJob — starts 30-day clock
    }

    // ─── State ────────────────────────────────────────────────────────────────

    IERC20  public immutable USDC;
    address public immutable keeper;   // KeeperHub executor address (for approveAndRelease)

    uint256 public nextJobId = 1;
    uint256 public constant TIMEOUT = 30 days;

    mapping(uint256 => Job)     public jobs;
    mapping(address => bool)    public verified; // set by World ID callback

    // ─── Events ───────────────────────────────────────────────────────────────

    event Verified(address indexed user);
    event JobCreated(uint256 indexed jobId, address indexed client, uint256 amountUSDC, string ipfsJobSpec);
    event JobAccepted(uint256 indexed jobId, address indexed freelancer);
    event WorkSubmitted(uint256 indexed jobId, string ipfsDeliverable);
    event PaymentReleased(uint256 indexed jobId, address indexed freelancer, uint256 amount);
    event PaymentReclaimed(uint256 indexed jobId, address indexed freelancer, uint256 amount);

    // ─── Errors ───────────────────────────────────────────────────────────────

    error NotVerified();
    error JobNotFound();
    error WrongStatus(Status expected, Status actual);
    error NotClient();
    error NotFreelancer();
    error TimeoutNotReached();
    error NotKeeper();

    // ─── Modifiers ────────────────────────────────────────────────────────────

    modifier onlyVerified() {
        if (!verified[msg.sender]) revert NotVerified();
        _;
    }

    modifier jobExists(uint256 jobId) {
        if (jobId == 0 || jobId >= nextJobId) revert JobNotFound();
        _;
    }

    modifier inStatus(uint256 jobId, Status expected) {
        if (jobs[jobId].status != expected)
            revert WrongStatus(expected, jobs[jobId].status);
        _;
    }

    // ─── Constructor ──────────────────────────────────────────────────────────

    constructor(address _usdc, address _keeper) {
        USDC   = IERC20(_usdc);
        keeper = _keeper;
    }

    // ─── World ID callback ────────────────────────────────────────────────────

    /**
     * @notice Called by the World ID IDKit after successful on-chain proof
     *         verification. In production this should be gated to the
     *         WorldIDRouter contract — simplified here for demo clarity.
     */
    function setVerified(address user) external {
        // TODO: replace with WorldIDRouter.verifyProof call
        verified[user] = true;
        emit Verified(user);
    }

    // ─── Core escrow functions ────────────────────────────────────────────────

    /**
     * @notice Client creates a job and locks USDC into the contract.
     *         The Uniswap swap (any token → USDC) must happen before
     *         this call; the frontend approves USDC spend first.
     * @param freelancer  Known counterparty (or address(0) for open listing)
     * @param amountUSDC  Payout in USDC (6 decimals)
     * @param ipfsJobSpec IPFS CID of the job specification JSON
     */
    function createEscrow(
        address freelancer,
        uint256 amountUSDC,
        string calldata ipfsJobSpec
    ) external onlyVerified nonReentrant returns (uint256 jobId) {
        require(amountUSDC > 0, "Amount must be > 0");

        USDC.safeTransferFrom(msg.sender, address(this), amountUSDC);

        jobId = nextJobId++;
        jobs[jobId] = Job({
            client:          msg.sender,
            freelancer:      freelancer,
            amountUSDC:      amountUSDC,
            ipfsJobSpec:     ipfsJobSpec,
            ipfsDeliverable: "",
            status:          Status.Open,
            acceptedAt:      0
        });

        emit JobCreated(jobId, msg.sender, amountUSDC, ipfsJobSpec);
    }

    /**
     * @notice Verified freelancer accepts an open job.
     *         If the job has a specific freelancer set, only that address may accept.
     */
    function acceptJob(uint256 jobId)
        external
        onlyVerified
        jobExists(jobId)
        inStatus(jobId, Status.Open)
        nonReentrant
    {
        Job storage job = jobs[jobId];
        if (job.freelancer != address(0) && job.freelancer != msg.sender)
            revert NotFreelancer();
        require(msg.sender != job.client, "Client cannot be freelancer");

        job.freelancer = msg.sender;
        job.status     = Status.InProgress;
        job.acceptedAt = block.timestamp;

        emit JobAccepted(jobId, msg.sender);
    }

    /**
     * @notice Freelancer submits deliverable IPFS CID.
     */
    function submitWork(uint256 jobId, string calldata ipfsDeliverable)
        external
        jobExists(jobId)
        inStatus(jobId, Status.InProgress)
    {
        Job storage job = jobs[jobId];
        if (job.freelancer != msg.sender) revert NotFreelancer();

        job.ipfsDeliverable = ipfsDeliverable;
        job.status          = Status.Delivered;

        emit WorkSubmitted(jobId, ipfsDeliverable);
    }

    /**
     * @notice Client approves work and releases USDC to freelancer.
     *         This function is intended to be called via KeeperHub for
     *         SLA-backed, retry-safe execution.
     *         Either the client OR the KeeperHub executor may call this.
     */
    function approveAndRelease(uint256 jobId)
        external
        jobExists(jobId)
        inStatus(jobId, Status.Delivered)
        nonReentrant
    {
        Job storage job = jobs[jobId];
        if (msg.sender != job.client && msg.sender != keeper)
            revert NotClient();

        uint256 amount     = job.amountUSDC;
        address freelancer = job.freelancer;

        job.status     = Status.Completed;
        job.amountUSDC = 0;

        USDC.safeTransfer(freelancer, amount);

        emit PaymentReleased(jobId, freelancer, amount);
    }

    /**
     * @notice If client never approves and 30 days have passed since acceptance,
     *         the freelancer may reclaim the full escrow amount.
     *         This is the entire dispute resolution mechanism — keep it simple.
     */
    function reclaimAfterTimeout(uint256 jobId)
        external
        jobExists(jobId)
        nonReentrant
    {
        Job storage job = jobs[jobId];
        if (job.freelancer != msg.sender) revert NotFreelancer();
        if (job.status != Status.InProgress && job.status != Status.Delivered)
            revert WrongStatus(Status.Delivered, job.status);
        if (block.timestamp < job.acceptedAt + TIMEOUT)
            revert TimeoutNotReached();

        uint256 amount = job.amountUSDC;
        job.status     = Status.Reclaimed;
        job.amountUSDC = 0;

        USDC.safeTransfer(msg.sender, amount);

        emit PaymentReclaimed(jobId, msg.sender, amount);
    }

    // ─── View helpers ─────────────────────────────────────────────────────────

    function getJob(uint256 jobId) external view returns (Job memory) {
        return jobs[jobId];
    }

    function isVerified(address user) external view returns (bool) {
        return verified[user];
    }

    function timeoutAt(uint256 jobId) external view returns (uint256) {
        return jobs[jobId].acceptedAt + TIMEOUT;
    }
}
