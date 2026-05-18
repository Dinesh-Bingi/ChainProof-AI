import fs from "fs/promises";
import { Proof } from "../models/Proof.js";
import { AppError } from "../middleware/errorHandler.js";
import { hashFile } from "../utils/hash.js";
import { uploadToPinata } from "./pinata.service.js";
import { registerOnChain } from "./blockchain.service.js";
import { checkSimilarity } from "./similarity.service.js";
import { issueCertificate } from "./certificate.service.js";
import { logActivity } from "./activity.service.js";

export async function createProof({ user, file, title, description }) {
  const contentHash = await hashFile(file.path);

  const duplicate = await Proof.findOne({ contentHash });
  if (duplicate) {
    await fs.unlink(file.path).catch(() => {});
    throw new AppError("This file has already been registered", 409);
  }

  const { cid, url } = await uploadToPinata(file.path, file.originalname, {
    contentHash,
    userId: user._id.toString(),
  });

  const similarity = await checkSimilarity({
    filePath: file.path,
    mimeType: file.mimetype,
    contentHash,
    title,
    description,
  });

  const chainResult = await registerOnChain(contentHash, cid, title);

  const proof = await Proof.create({
    userId: user._id,
    title,
    description,
    fileName: file.originalname,
    mimeType: file.mimetype,
    fileSize: file.size,
    contentHash,
    ipfsCid: cid,
    ipfsUrl: url,
    blockchainTxHash: chainResult.txHash,
    blockchainBlockNumber: chainResult.blockNumber,
    chainOwner: chainResult.chainOwner,
    blockchainRegistered: chainResult.registered && !chainResult.mock,
    contentTextSample: similarity.contentTextSample,
    similarityEngine: similarity.engine || "ngram-jaccard",
    similarityScore: similarity.similarityScore,
    plagiarismFlagged: similarity.plagiarismFlagged,
    similarityMatches: similarity.similarityMatches,
    status: similarity.status,
  });

  await logActivity({
    userId: user._id,
    action: "upload",
    resourceType: "proof",
    resourceId: proof._id,
    metadata: { title, contentHash },
  });

  await logActivity({
    userId: user._id,
    action: "similarity_check",
    resourceType: "proof",
    resourceId: proof._id,
    metadata: { score: similarity.similarityScore, flagged: similarity.plagiarismFlagged },
  });

  if (chainResult.txHash) {
    await logActivity({
      userId: user._id,
      action: "blockchain_register",
      resourceType: "proof",
      resourceId: proof._id,
      metadata: { txHash: chainResult.txHash },
    });
  }

  let certificate = null;
  if (proof.status === "verified") {
    certificate = await issueCertificate({ proof, user });
    proof.certificateId = certificate._id;
    await proof.save();
  }

  await fs.unlink(file.path).catch(() => {});

  return { proof, certificate };
}

export async function listProofs(userId, { page = 1, limit = 10 } = {}) {
  const skip = (page - 1) * limit;
  const [items, total] = await Promise.all([
    Proof.find({ userId }).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    Proof.countDocuments({ userId }),
  ]);
  return { items, total, page, pages: Math.ceil(total / limit) };
}

export async function getProofById(proofId, userId) {
  const proof = await Proof.findOne({ _id: proofId, userId }).lean();
  if (!proof) throw new AppError("Proof not found", 404);
  return proof;
}

export async function getDashboardStats(userId) {
  const { getDashboardAnalytics } = await import("./analytics.service.js");
  return getDashboardAnalytics(userId);
}
