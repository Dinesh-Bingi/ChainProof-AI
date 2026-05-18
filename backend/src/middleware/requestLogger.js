import { randomUUID } from "crypto";
import { logger } from "../utils/logger.js";

export function requestIdMiddleware(req, res, next) {
  req.requestId = req.headers["x-request-id"] || randomUUID();
  res.setHeader("X-Request-Id", req.requestId);
  next();
}

export function structuredRequestLogger(req, res, next) {
  const start = Date.now();
  res.on("finish", () => {
    logger.info("HTTP request", {
      requestId: req.requestId,
      method: req.method,
      path: req.originalUrl,
      status: res.statusCode,
      durationMs: Date.now() - start,
      userId: req.user?._id?.toString(),
    });
  });
  next();
}
