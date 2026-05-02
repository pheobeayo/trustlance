// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @notice Mock Permit2 — records approvals, always succeeds.
contract MockPermit2 {
    struct Allowance {
        uint160 amount;
        uint48  expiration;
    }

    mapping(address => mapping(address => mapping(address => Allowance))) public allowances;

    function approve(
        address token,
        address spender,
        uint160 amount,
        uint48  expiration
    ) external {
        allowances[msg.sender][token][spender] = Allowance(amount, expiration);
    }

    function allowance(
        address user,
        address token,
        address spender
    ) external view returns (uint160 amount, uint48 expiration, uint48 nonce) {
        Allowance memory a = allowances[user][token][spender];
        return (a.amount, a.expiration, 0);
    }
}
