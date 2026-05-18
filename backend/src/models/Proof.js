import mongoose from "mongoose";

const similarityMatchSchema = new mongoose.Schema(
  {
    proofId: { type: mongoose.Schema.Types.ObjectId, ref: "Proof" },
    score: { type: Number, required: true },
    title: String,
  },
  { _id: false }
);

const proofSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    fileName: { type: String, required: true },
    mimeType: { type: String, required: true },
    fileSize: { type: Number, required: true },
    contentHash: { type: String, required: true, unique: true, index: true },
    ipfsCid: { type: String, required: true },
    ipfsUrl: { type: String, required: true },
    blockchainTxHash: { type: String },
    blockchainBlockNumber: { type: Number },
    chainOwner: { type: String },
    blockchainRegistered: { type: Boolean, default: false },
    contentTextSample: { type: String },
    similarityEngine: { type: String, enum: ["sentence-transformers", "ngram-jaccard"], default: "ngram-jaccard" },
    similarityScore: { type: Number, default: 0 },
    plagiarismFlagged: { type: Boolean, default: false },
    similarityMatches: [similarityMatchSchema],
    status: {
      type: String,
      enum: ["pending", "verified", "flagged", "failed"],
      default: "pending",
    },
    certificateId: { type: mongoose.Schema.Types.ObjectId, ref: "Certificate" },
  },
  { timestamps: true }
);

proofSchema.index({ userId: 1, createdAt: -1 });

export const Proof = mongoose.model("Proof", proofSchema);
