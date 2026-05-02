// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @notice Mock KeeperHub — stores tasks and lets the test executor call them.
contract MockKeeperHub {
    enum TaskStatus { Pending, Executed, Cancelled, Failed }

    struct Task {
        address    target;
        bytes      callData;
        uint256    deadline;
        uint256    gasLimit;
        TaskStatus status;
    }

    uint256 private _nonce;
    mapping(bytes32 => Task) public tasks;

    event TaskRegistered(bytes32 indexed taskId, address target);
    event TaskExecuted  (bytes32 indexed taskId);
    event TaskCancelled (bytes32 indexed taskId);

    function registerTask(
        address target,
        bytes calldata callData,
        uint256 deadline,
        uint256 gasLimit
    ) external returns (bytes32 taskId) {
        taskId = keccak256(abi.encodePacked(target, callData, deadline, _nonce++));
        tasks[taskId] = Task({
            target:   target,
            callData: callData,
            deadline: deadline,
            gasLimit: gasLimit,
            status:   TaskStatus.Pending
        });
        emit TaskRegistered(taskId, target);
    }

    /// @notice Executes a registered task — called by the keeper EOA in tests.
    ///         msg.sender arriving at the target = address(this) = keeper immutable ✓
    function executeTask(bytes32 taskId) external {
        Task storage t = tasks[taskId];
        require(t.status == TaskStatus.Pending, "Not pending");
        require(block.timestamp <= t.deadline,  "Deadline passed");

        t.status = TaskStatus.Executed;

        (bool ok,) = t.target.call{gas: t.gasLimit}(t.callData);
        require(ok, "Task execution failed");

        emit TaskExecuted(taskId);
    }

    /// @notice Lets a test EOA trigger _executeRelease directly,
    ///         with MockKeeperHub as msg.sender — matching the keeper immutable.
    function directCall(address target, bytes calldata data) external {
        (bool ok,) = target.call(data);
        require(ok, "directCall failed");
    }

    function cancelTask(bytes32 taskId) external {
        tasks[taskId].status = TaskStatus.Cancelled;
        emit TaskCancelled(taskId);
    }

    function getTask(bytes32 taskId) external view returns (Task memory) {
        return tasks[taskId];
    }
}