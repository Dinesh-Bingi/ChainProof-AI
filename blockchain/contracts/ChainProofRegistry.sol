// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title ChainProofRegistry
 * @notice Immutable on-chain registry of content hashes for IP ownership proofs.
 */
contract ChainProofRegistry {
    struct ProofRecord {
        address owner;
        string ipfsCid;
        string title;
        uint256 registeredAt;
        bool exists;
    }

    mapping(bytes32 => ProofRecord) private _proofs;
    mapping(address => bytes32[]) private _ownerHashes;
    bytes32[] private _allHashes;

    event ProofRegistered(
        bytes32 indexed contentHash,
        address indexed owner,
        string ipfsCid,
        string title,
        uint256 registeredAt
    );

    error ProofAlreadyExists(bytes32 contentHash);
    error ProofNotFound(bytes32 contentHash);
    error Unauthorized(address caller);

    function registerProof(
        bytes32 contentHash,
        string calldata ipfsCid,
        string calldata title
    ) external {
        if (_proofs[contentHash].exists) {
            revert ProofAlreadyExists(contentHash);
        }

        _proofs[contentHash] = ProofRecord({
            owner: msg.sender,
            ipfsCid: ipfsCid,
            title: title,
            registeredAt: block.timestamp,
            exists: true
        });

        _ownerHashes[msg.sender].push(contentHash);
        _allHashes.push(contentHash);

        emit ProofRegistered(contentHash, msg.sender, ipfsCid, title, block.timestamp);
    }

    function getProof(bytes32 contentHash)
        external
        view
        returns (
            address owner,
            string memory ipfsCid,
            string memory title,
            uint256 registeredAt
        )
    {
        ProofRecord storage record = _proofs[contentHash];
        if (!record.exists) revert ProofNotFound(contentHash);
        return (record.owner, record.ipfsCid, record.title, record.registeredAt);
    }

    function proofExists(bytes32 contentHash) external view returns (bool) {
        return _proofs[contentHash].exists;
    }

    function getOwnerProofHashes(address owner) external view returns (bytes32[] memory) {
        return _ownerHashes[owner];
    }

    function totalProofs() external view returns (uint256) {
        return _allHashes.length;
    }
}
