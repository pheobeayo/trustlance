// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

/// @notice Minimal mintable ERC-20 for tests.
contract MockERC20 is ERC20 {
    uint8 private _dec;

    constructor(string memory name, string memory symbol, uint8 decimals_)
        ERC20(name, symbol)
    {
        _dec = decimals_;
    }

    function decimals() public view override returns (uint8) { return _dec; }

    function mint(address to, uint256 amount) external { _mint(to, amount); }

    /// Alias so tests can call forceApprove without importing SafeERC20
    function forceApprove(address spender, uint256 amount) external returns (bool) {
        _approve(msg.sender, spender, amount);
        return true;
    }
}
