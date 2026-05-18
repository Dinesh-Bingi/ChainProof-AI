import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, "../../../.env") });

export const config = {
  env: process.env.NODE_ENV || "development",
  port: parseInt(process.env.PORT || "5000", 10),
  apiPrefix: process.env.API_PREFIX || "/api/v1",
  clientUrl: process.env.CLIENT_URL || "http://localhost:5173",
  mongodbUri: process.env.MONGODB_URI || "mongodb://localhost:27017/chainproof",
  useMemoryDb: process.env.USE_MEMORY_DB === "true",
  devMemoryDbFallback: process.env.DEV_MEMORY_DB_FALLBACK === "true",
  firebase: {
    projectId: process.env.FIREBASE_PROJECT_ID || "",
    serviceAccountJson: process.env.FIREBASE_SERVICE_ACCOUNT_JSON || "",
    serviceAccountPath: process.env.FIREBASE_SERVICE_ACCOUNT_PATH || "",
  },
  jwt: {
    secret: process.env.JWT_SECRET || "dev-secret-change-in-production",
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  },
  pinata: {
    apiKey: process.env.PINATA_API_KEY || "",
    secretKey: process.env.PINATA_SECRET_API_KEY || "",
    gateway: process.env.PINATA_GATEWAY || "https://gateway.pinata.cloud/ipfs",
  },
  blockchain: {
    rpcUrl: process.env.BLOCKCHAIN_RPC_URL || "http://127.0.0.1:8545",
    privateKey: process.env.BLOCKCHAIN_PRIVATE_KEY || "",
    contractAddress: process.env.CHAINPROOF_CONTRACT_ADDRESS || "",
  },
  ai: {
    serviceUrl: process.env.AI_SERVICE_URL || "http://127.0.0.1:8000",
    serviceTimeoutMs: parseInt(process.env.AI_SERVICE_TIMEOUT_MS || "30000", 10),
    similarityThreshold: parseFloat(process.env.SIMILARITY_THRESHOLD || "0.85"),
    plagiarismFlagThreshold: parseFloat(process.env.PLAGIARISM_FLAG_THRESHOLD || "0.92"),
  },
  rateLimit: {
    max: parseInt(process.env.RATE_LIMIT_MAX || "200", 10),
  },
  uploadsDir: path.resolve(__dirname, "../../uploads"),
  generatedDir: path.resolve(__dirname, "../../generated"),
};
