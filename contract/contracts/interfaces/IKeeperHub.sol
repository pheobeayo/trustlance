// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @title IKeeperHub
/// @notice Interface for interacting with KeeperHub's execution layer.
///         KeeperHub monitors on-chain conditions and executes transactions
///         with SLA-backed delivery and automatic retry on failure.
///         Docs: https://keeperhub.com
interface IKeeperHub {
    enum TaskStatus { Pending, Executed, Cancelled, Failed }

    struct Task {
        address target;      // Contract to call
        bytes   callData;    // Encoded function call
        uint256 deadline;    // Unix timestamp — task expires after this
        uint256 gasLimit;    // Max gas for execution
        TaskStatus status;
    }

    /// @notice Register a task for future execution by KeeperHub.
    ///         Returns a taskId that can be used to check status.
    function registerTask(
        address target,
        bytes   calldata callData,
        uint256 deadline,
        uint256 gasLimit
    ) external returns (bytes32 taskId);

    /// @notice Cancel a pending task (only registrar can cancel).
    function cancelTask(bytes32 taskId) external;

    /// @notice Returns current status of a task.
    function getTask(bytes32 taskId) external view returns (Task memory);
}
