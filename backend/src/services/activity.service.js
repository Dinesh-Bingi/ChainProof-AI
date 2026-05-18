import { ActivityLog } from "../models/ActivityLog.js";

export async function logActivity({ userId, action, resourceType, resourceId, metadata }) {
  return ActivityLog.create({ userId, action, resourceType, resourceId, metadata });
}

export async function getUserHistory(userId, { page = 1, limit = 20 } = {}) {
  const skip = (page - 1) * limit;
  const [items, total] = await Promise.all([
    ActivityLog.find({ userId }).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    ActivityLog.countDocuments({ userId }),
  ]);
  return { items, total, page, pages: Math.ceil(total / limit) };
}
