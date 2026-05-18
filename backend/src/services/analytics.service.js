import mongoose from "mongoose";
import { Proof } from "../models/Proof.js";
import { ActivityLog } from "../models/ActivityLog.js";

export async function getDashboardAnalytics(userId) {
  const uid = new mongoose.Types.ObjectId(userId);
  const now = new Date();
  const thirtyDaysAgo = new Date(now);
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const [
    total,
    verified,
    flagged,
    pending,
    onChain,
    ipfsStored,
    recent,
    uploadsByDay,
    activityFeed,
    avgSimilarity,
  ] = await Promise.all([
    Proof.countDocuments({ userId: uid }),
    Proof.countDocuments({ userId: uid, status: "verified" }),
    Proof.countDocuments({ userId: uid, status: "flagged" }),
    Proof.countDocuments({ userId: uid, status: "pending" }),
    Proof.countDocuments({ userId: uid, blockchainRegistered: true }),
    Proof.countDocuments({ userId: uid, ipfsCid: { $exists: true, $ne: "" } }),
    Proof.find({ userId: uid })
      .sort({ createdAt: -1 })
      .limit(8)
      .select("title status createdAt contentHash ipfsCid blockchainTxHash blockchainRegistered similarityScore")
      .lean(),
    Proof.aggregate([
      { $match: { userId: uid, createdAt: { $gte: thirtyDaysAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]),
    ActivityLog.find({ userId: uid })
      .sort({ createdAt: -1 })
      .limit(10)
      .lean(),
    Proof.aggregate([
      { $match: { userId: uid } },
      { $group: { _id: null, avg: { $avg: "$similarityScore" } } },
    ]),
  ]);

  const verificationRate = total > 0 ? Math.round((verified / total) * 100) : 0;

  return {
    summary: {
      total,
      verified,
      flagged,
      pending,
      onChain,
      ipfsStored,
      verificationRate,
      avgSimilarity: avgSimilarity[0]?.avg ? Math.round(avgSimilarity[0].avg * 100) / 100 : 0,
    },
    uploadsByDay: uploadsByDay.map((d) => ({ date: d._id, count: d.count })),
    recent,
    activityFeed: activityFeed.map((a) => ({
      id: a._id,
      action: a.action,
      resourceType: a.resourceType,
      metadata: a.metadata,
      createdAt: a.createdAt,
    })),
  };
}
