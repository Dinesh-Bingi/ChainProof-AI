import mongoose from "mongoose";

const activityLogSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    action: {
      type: String,
      enum: [
        "register",
        "upload",
        "verify",
        "certificate_issued",
        "login",
        "blockchain_register",
        "similarity_check",
      ],
      required: true,
    },
    resourceType: { type: String, enum: ["proof", "certificate", "user", "auth"], default: "proof" },
    resourceId: { type: mongoose.Schema.Types.ObjectId },
    metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

activityLogSchema.index({ userId: 1, createdAt: -1 });

export const ActivityLog = mongoose.model("ActivityLog", activityLogSchema);
