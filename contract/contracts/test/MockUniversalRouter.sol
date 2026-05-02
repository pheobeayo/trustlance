// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

/// @notice Mock Uniswap Universal Router for testing.
///         Matches IUniversalRouter: execute(bytes, bytes[], uint256)
///         Simulates a token swap by transferring a configurable
///         amountOut of USDC to the recipient encoded in inputs[].
contract MockUniversalRouter {
    using SafeERC20 for IERC20;

    address public usdc;
    uint256 public rate; // amountOut = (amountIn * rate) / 1e18

    constructor(address _usdc, uint256 _rate) {
        usdc = _usdc;
        rate = _rate;
    }

    function setRate(uint256 _rate) external { rate = _rate; }

    /// @notice Matches selector: execute(bytes,bytes[],uint256) = 0x3593564c
    function execute(
        bytes calldata /* commands */,
        bytes[] calldata inputs,
        uint256 /* deadline */
    ) external payable {
        uint256 amountIn;
        address recipient;

        if (msg.value > 0) {
            // ETH path:
            // inputs[0] = abi.encode(routerAddr, wrapAmount)   ← WRAP_ETH
            // inputs[1] = abi.encode(recipient, amountIn, minOut, path, payerIsUser) ← V3_SWAP_EXACT_IN
            (recipient, amountIn,,,) = abi.decode(inputs[1], (address, uint256, uint256, bytes, bool));
            amountIn = msg.value; // override with actual ETH sent
        } else {
            // ERC-20 path:
            // inputs[0] = abi.encode(recipient, amountIn, minOut, path, payerIsUser)
            (recipient, amountIn,,,) = abi.decode(inputs[0], (address, uint256, uint256, bytes, bool));
        }

        uint256 amountOut = (amountIn * rate) / 1e18;

        IERC20(usdc).safeTransfer(recipient, amountOut);
    }

    receive() external payable {}
}