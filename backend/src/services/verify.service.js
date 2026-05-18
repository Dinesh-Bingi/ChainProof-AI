import { Proof } from "../models/Proof.js";
import { verifyOnChain } from "./blockchain.service.js";
import { logActivity } from "./activity.service.js";

export async function verifyOwnership(contentHash, userId) {
  const dbProof = await Proof.findOne({ contentHash }).populate("userId", "name email").lean();
  const chain = await verifyOnChain(contentHash);

  if (userId) {
    await logActivity({
      userId,
      action: "verify",
      resourceType: "proof",
      resourceId: dbProof?._id,
      metadata: { contentHash, found: Boolean(dbProof) },
    });
  }

  return {
    found: Boolean(dbProof),
    database: dbProof
      ? {
          title: dbProof.title,
          owner: dbProof.userId,
          ipfsCid: dbProof.ipfsCid,
          ipfsUrl: dbProof.ipfsUrl,
          registeredAt: dbProof.createdAt,
          status: dbProof.status,
          similarityScore: dbProof.similarityScore,
        }
      : null,
    blockchain: chain,
    verified: Boolean(dbProof) && (chain.onChain ? chain.exists : true),
  };
}
