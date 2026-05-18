import { logger } from "../utils/logger.js";

export class AppError extends Error {
  constructor(message, statusCode = 500, details) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
    this.isOperational = true;
  }
}

export function notFoundHandler(_req, res) {
  res.status(404).json({ success: false, message: "Route not found" });
}

export function errorHandler(err, _req, res, _next) {
  const statusCode = err.statusCode || 500;
  const message = err.isOperational ? err.message : "Internal server error";

  if (!err.isOperational) {
    logger.error(err.message, { stack: err.stack });
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(err.details && { details: err.details }),
    ...(process.env.NODE_ENV !== "production" && !err.isOperational && { stack: err.stack }),
  });
}
