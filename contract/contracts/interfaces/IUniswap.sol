// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @title IUniversalRouter
/// @notice Minimal interface for Uniswap's Universal Router.
///         Full spec: https://github.com/Uniswap/universal-router
///         Deployed on Base: 0x3fC91A3afd70395Cd496C647d5a6CC9D4B2b7FAD
interface IUniversalRouter {
    /// @notice Executes encoded commands along with provided inputs.
    /// @param commands A set of concatenated commands, each 1 byte in length
    /// @param inputs   An array of byte strings to be used as input to each command
    /// @param deadline The deadline by which the transaction must be executed
    function execute(
        bytes calldata commands,
        bytes[] calldata inputs,
        uint256 deadline
    ) external payable;
}

/// @title IPermit2
/// @notice Interface for Uniswap's Permit2 contract.
///         Required to allow the Universal Router to spend tokens
///         without a separate approve() call each time.
interface IPermit2 {
    struct PermitDetails {
        address token;
        uint160 amount;
        uint48  expiration;
        uint48  nonce;
    }

    struct PermitSingle {
        PermitDetails details;
        address       spender;
        uint256       sigDeadline;
    }

    function approve(
        address token,
        address spender,
        uint160 amount,
        uint48  expiration
    ) external;

    function allowance(
        address user,
        address token,
        address spender
    ) external view returns (uint160 amount, uint48 expiration, uint48 nonce);
}
