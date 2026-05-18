import { ethers } from "ethers";
import { readFileSync, existsSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { config } from "../config/index.js";
import { createRequire } from "module";
import { logger } from "../utils/logger.js";
import { toBytes32 } from "../utils/hash.js";
import { ActivityLog } from "../models/ActivityLog.js";
import { Proof } from "../models/Proof.js";

const require = createRequire(import.meta.url);
const contractAbi = require("../config/contract-abi.json");
const __dirname = path.dirname(fileURLToPath(import.meta.url));

function resolveContractAddress() {
  if (config.blockchain.contractAddress) return config.blockchain.contractAddress;
  const deployedPath = path.join(__dirname, "../config/contract-address.json");
  if (existsSync(deployedPath)) {
    const { ChainProofRegistry } = JSON.parse(readFileSync(deployedPath, "utf8"));
    return ChainProofRegistry;
  }
  return null;
}

function getProvider() {
  return new ethers.JsonRpcProvider(config.blockchain.rpcUrl);
}

export function getContract(readOnly = false) {
  const address = resolveContractAddress();
  if (!address) {
    logger.warn("Contract address not configured — blockchain writes skipped");
    return null;
  }
  const provider = getProvider();
  if (readOnly || !config.blockchain.privateKey) {
    return new ethers.Contract(address, contractAbi, provider);
  }
  const wallet = new ethers.Wallet(config.blockchain.privateKey, provider);
  return new ethers.Contract(address, contractAbi, wallet);
}

export async function getBlockchainStatus() {
  const address = resolveContractAddress();
  const provider = getProvider();
  let network = null;
  let blockNumber = null;
  let totalOnChain = null;

  try {
    network = await provider.getNetwork();
    blockNumber = await provider.getBlockNumber();
    if (address) {
      const contract = getContract(true);
      totalOnChain = Number(await contract.totalProofs());
    }
  } catch (err) {
    logger.warn("Blockchain status check failed", err.message);
  }

  return {
    configured: Boolean(address),
    contractAddress: address,
    rpcUrl: config.blockchain.rpcUrl,
    hasSigner: Boolean(config.blockchain.privateKey),
    chainId: network ? Number(network.chainId) : null,
    blockNumber,
    totalOnChain,
  };
}

export async function registerOnChain(contentHash, ipfsCid, title) {
  const contract = getContract();
  if (!contract) {
    return { registered: false, txHash: null, mock: true };
  }

  const bytes32Hash = toBytes32(contentHash);
  const exists = await contract.proofExists(bytes32Hash);
  if (exists) {
    const onChain = await verifyOnChain(contentHash);
    return {
      registered: true,
      txHash: null,
      alreadyExists: true,
      blockNumber: null,
      chainOwner: onChain.owner,
    };
  }

  const tx = await contract.registerProof(bytes32Hash, ipfsCid, title);
  const receipt = await tx.wait();

  const registered = receipt.logs
    .map((log) => {
      try {
        return contract.interface.parseLog(log);
      } catch {
        return null;
      }
    })
    .find((parsed) => parsed?.name === "ProofRegistered");

  return {
    registered: true,
    txHash: receipt.hash,
    blockNumber: receipt.blockNumber,
    chainOwner: registered?.args?.owner ?? (await contract.getProof(bytes32Hash))[0],
    gasUsed: receipt.gasUsed?.toString(),
  };
}

export async function verifyOnChain(contentHash) {
  const contract = getContract(true);
  if (!contract) return { onChain: false, exists: false };

  const bytes32Hash = toBytes32(contentHash);
  const exists = await contract.proofExists(bytes32Hash);
  if (!exists) return { onChain: true, exists: false };

  const [owner, ipfsCid, title, registeredAt] = await contract.getProof(bytes32Hash);
  return {
    onChain: true,
    exists: true,
    owner,
    ipfsCid,
    title,
    registeredAt: Number(registeredAt),
  };
}

export async function getOnChainEvents({ limit = 20 } = {}) {
  const contract = getContract(true);
  if (!contract) return [];

  const provider = getProvider();
  const latest = await provider.getBlockNumber();
  const fromBlock = Math.max(0, latest - 5000);
  const filter = contract.filters.ProofRegistered();
  const events = await contract.queryFilter(filter, fromBlock, latest);

  return events
    .slice(-limit)
    .reverse()
    .map((ev) => ({
      contentHash: ev.args.contentHash,
      owner: ev.args.owner,
      ipfsCid: ev.args.ipfsCid,
      title: ev.args.title,
      registeredAt: Number(ev.args.registeredAt),
      txHash: ev.transactionHash,
      blockNumber: ev.blockNumber,
    }));
}

export async function getUserTransactionHistory(userId, { limit = 20 } = {}) {
  const [activities, proofs] = await Promise.all([
    ActivityLog.find({ userId, action: { $in: ["blockchain_register", "upload", "verify"] } })
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean(),
    Proof.find({ userId, blockchainTxHash: { $ne: null } })
      .select("title contentHash blockchainTxHash blockchainBlockNumber ipfsCid createdAt")
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean(),
  ]);

  const txMap = new Map();
  for (const proof of proofs) {
    txMap.set(proof.blockchainTxHash, {
      type: "register",
      txHash: proof.blockchainTxHash,
      blockNumber: proof.blockchainBlockNumber,
      title: proof.title,
      contentHash: proof.contentHash,
      ipfsCid: proof.ipfsCid,
      timestamp: proof.createdAt,
    });
  }

  for (const act of activities) {
    if (act.action === "blockchain_register" && act.metadata?.txHash) {
      txMap.set(act.metadata.txHash, {
        type: "register",
        txHash: act.metadata.txHash,
        title: act.metadata.title,
        contentHash: act.metadata.contentHash,
        timestamp: act.createdAt,
      });
    }
  }

  return [...txMap.values()].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)).slice(0, limit);
}
