import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import path from "path";
import { fileURLToPath } from "url";
import { config } from "./config/index.js";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler.js";
import { requestIdMiddleware, structuredRequestLogger } from "./middleware/requestLogger.js";
import { openApiSpec } from "./docs/openapi.js";
import authRoutes from "./routes/auth.routes.js";
import proofRoutes from "./routes/proof.routes.js";
import certificateRoutes from "./routes/certificate.routes.js";
import historyRoutes from "./routes/history.routes.js";
import verifyRoutes from "./routes/verify.routes.js";
import blockchainRoutes from "./routes/blockchain.routes.js";
import { checkAiServiceHealth } from "./services/ai.service.js";
import { getBlockchainStatus } from "./services/blockchain.service.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();

app.use(helmet({ contentSecurityPolicy: config.env === "production" }));
app.use(
  cors({
    origin: config.clientUrl,
    credentials: true,
  })
);
app.use(requestIdMiddleware);
app.use(structuredRequestLogger);
app.use(express.json({ limit: "2mb" }));

const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: config.rateLimit.max,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Too many requests, please try again later" },
});
app.use(globalLimiter);

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  message: { success: false, message: "Too many auth attempts" },
});

app.get("/health", async (_req, res) => {
  const [ai, blockchain] = await Promise.all([checkAiServiceHealth(), getBlockchainStatus()]);
  res.json({
    status: "ok",
    service: "chainproof-api",
    version: "1.0.0",
    dependencies: { ai, blockchain },
  });
});

app.get("/api/docs.json", (_req, res) => {
  res.json(openApiSpec);
});

app.get("/api/docs", (_req, res) => {
  const html = [
    "<!DOCTYPE html>",
    "<html><head><title>ChainProof API Docs</title>",
    '<link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@5/swagger-ui.css"/>',
    "</head><body>",
    '<div id="swagger-ui"></div>',
    '<script src="https://unpkg.com/swagger-ui-dist@5/swagger-ui-bundle.js"></script>',
    "<script>",
    "SwaggerUIBundle({ url: '/api/docs.json', dom_id: '#swagger-ui' });",
    "</script></body></html>",
  ].join("");
  res.type("html").send(html);
});

const api = express.Router();
api.use("/auth", authLimiter, authRoutes);
api.use("/proofs", proofRoutes);
api.use("/certificates", certificateRoutes);
api.use("/history", historyRoutes);
api.use("/verify", verifyRoutes);
api.use("/blockchain", blockchainRoutes);

app.use(config.apiPrefix, api);
app.use("/generated", express.static(path.join(__dirname, "../generated")));

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
