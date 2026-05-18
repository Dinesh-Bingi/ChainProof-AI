import mongoose from "mongoose";

const certificateSchema = new mongoose.Schema(
  {
    proofId: { type: mongoose.Schema.Types.ObjectId, ref: "Proof", required: true, unique: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    certificateNumber: { type: String, required: true, unique: true },
    filePath: { type: String, required: true },
    issuedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export const Certificate = mongoose.model("Certificate", certificateSchema);
