# Builder Feedback

Feedback on the Uniswap Developer Platform and KeeperHub, written during the ETHGlobal Open Agents hackathon.

---

## Uniswap — Universal Router

### What worked well

The Universal Router command encoding pattern is clean once you understand it. The concept of composing commands as a byte string with a matching inputs array is elegant and flexible. The `CMD_WRAP_ETH` + `CMD_V3_SWAP_EXACT_IN` composition for native ETH swaps worked exactly as documented.

The Permit2 separation of concerns is also well-designed. Approving once to Permit2 and then granting the router a scoped allowance per-transaction is a better UX model than repeated token approvals, even if the initial setup is more complex.

### What was difficult

**Path encoding is not obvious.** The V3 swap path format (`abi.encodePacked(tokenIn, fee, tokenOut)`) is correct but nowhere in the main integration guide is it made explicit that `fee` is a `uint24` packed directly, not a `uint256`. This caused a silent failure — the router call succeeded but produced zero USDC output. Found the fix by reading the Solidity source rather than the docs.

**The Universal Router address varies by chain.** There is no canonical registry or SDK method to resolve the router address for a given chain ID. For 0G Chain specifically, the router is not deployed yet, requiring us to deploy a mock. A simple `getUniversalRouterAddress(chainId)` utility in the `@uniswap/universal-router-sdk` package would save builders significant time.

**`payerIsUser` semantics.** The boolean flag in the V3_SWAP_EXACT_IN input encoding controls whether Permit2 pulls from the caller or from the router itself. The distinction between "user is caller" and "router holds tokens" is not well-explained in the integration guide. It requires reading the Universal Router source to understand when each should be used.

**Quoter contract is separate from the router.** Getting a price estimate before sending a swap requires calling the QuoterV2 contract, which is a completely separate integration. The docs mention this briefly but don't show a complete before/after pattern (get quote, then execute swap with that quote as minAmountOut). A full end-to-end example covering both steps would reduce friction significantly.

**No testnet support for newer chains.** The Uniswap AI repo and developer platform tools are built around mainnet Ethereum and a handful of established L2s. For a hackathon targeting 0G Chain, there is no Uniswap deployment to integrate against, so we had to write a `MockUniversalRouter` that decodes the exact calldata format and simulates swap output at a configurable rate. This took several hours and is a real blocker for any hackathon using a newer chain.

### Bugs encountered

- The path encoding produces incorrect output if `fee` is passed as `uint256` rather than `uint24` before packing. The router silently returns 0 output tokens rather than reverting with a useful error. A revert with `InvalidPath` or similar would be far easier to debug.
- The `execute()` function on the Universal Router does not return the amounts received. You have to read the balance delta before and after the call to know how much you actually got. An output array in the return value would be a meaningful improvement.

### Missing endpoints / features

- A `simulateSwap(chainId, tokenIn, tokenOut, amountIn, fee)` endpoint on the developer platform that returns expected output and gas estimate would remove the need to deploy or call QuoterV2 directly.
- Multicall support for approve + swap in a single transaction from the user's perspective — similar to what Permit2 enables but surfaced at the SDK level.
- A chain registry in the SDK: `UniversalRouter.getAddress(chainId)` returning the deployed address or throwing a clear error for unsupported chains.

---

## KeeperHub

### What worked well

The concept maps directly to what freelance escrow needs: you want the release to happen eventually, with retry, without requiring the client to manually retry a failed transaction. Registering a task on-chain and having an external executor pick it up is exactly the right model.

The `registerTask(target, calldata, deadline, gasLimit)` interface is minimal and easy to integrate. No SDK needed for the on-chain side — it is a simple contract call.

The `MockKeeperHub` we wrote for testing (which mirrors the real interface) let us run full end-to-end tests including the `executeTask()` call from the keeper EOA. This architecture made the contract easy to verify in tests.

### What was difficult

**No on-chain deployment on 0G testnet.** The real KeeperHub registry contract is not deployed on 0G Galileo Testnet (chain ID 16602). This meant writing a full mock that mirrors the interface for both the contract and tests. The mock works correctly, but it means the live demo uses a mock keeper rather than the real KeeperHub execution layer. For hackathons targeting newer chains, having a testnet deployment or a deployable reference contract in the repo would be a significant improvement.

**Documentation is sparse on the on-chain interface.** The KeeperHub docs focus heavily on the MCP server and CLI. The `IKeeperHub` interface for on-chain task registration — which is what a smart contract integration needs — is not documented at `docs.keeperhub.com`. We derived the interface from the KeeperHub website description and the prize brief. A Solidity interface file in the docs (similar to how OpenZeppelin publishes interfaces) would remove this ambiguity entirely.

**No event format documented for TaskRegistered / TaskExecuted.** We designed our own events for the mock. If the real contract emits events with a specific format, the frontend should subscribe to those for a reliable audit trail. Without knowing the real event signatures, we indexed the task by `taskId` returned from `registerTask()` and stored it in the Job struct instead.

**Deadline mechanics are unclear.** The `registerTask` call includes a deadline. What happens when the deadline passes without execution is not documented. Does KeeperHub retry until the deadline? Does it mark the task as Failed? For a financial application this distinction matters — a missed deadline on a payment release has real consequences for the freelancer.

### Feature requests

- A deployable reference `KeeperHub.sol` contract for testnets not yet supported, so builders can self-host the execution layer during development and switch to the real one for mainnet.
- An `IKeeperHub.sol` interface file published to npm or the docs, the same way Uniswap publishes `IUniversalRouter`.
- A dashboard showing registered tasks by contract address, with their current status. During the hackathon we had no way to verify whether a task was actually registered on the real KeeperHub without a block explorer deep-dive.
- Clearer documentation of what happens to tasks that exceed their deadline — does the system retry, fail silently, or emit a failure event?

### Bugs encountered

No bugs in the KeeperHub integration itself since we used a mock. The only issue was that the `IKeeperHub` interface we derived may differ from the real one — this should be verified against the production contract before mainnet deployment.

---

## Summary

Both integrations work correctly in the context of TrustLance. The primary blocker for both was the absence of deployments on 0G Chain, which required writing mocks that faithfully reproduce the interface. For future hackathons on newer chains, having a testnet deployment or a self-hostable reference implementation would remove the largest source of friction.

The Uniswap Universal Router path encoding and the KeeperHub on-chain interface are both areas where better documentation would save builders several hours each.