import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import { config } from "./index.js";
import { logger } from "../utils/logger.js";

mongoose.set("strictQuery", true);

let memoryServer = null;

async function resolveUri() {
  if (config.useMemoryDb) {
    memoryServer = await MongoMemoryServer.create();
    const uri = memoryServer.getUri("chainproof");
    logger.info("Using in-memory MongoDB (USE_MEMORY_DB=true)");
    return uri;
  }
  return config.mongodbUri;
}

export async function connectDatabase() {
  mongoose.connection.on("connected", () => logger.info("MongoDB connected"));
  mongoose.connection.on("error", (err) => logger.error("MongoDB error", err));
  mongoose.connection.on("disconnected", () => logger.warn("MongoDB disconnected"));

  let uri = await resolveUri();

  try {
    await mongoose.connect(uri, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    });
  } catch (err) {
    if (config.devMemoryDbFallback && config.env === "development" && !config.useMemoryDb) {
      await mongoose.disconnect().catch(() => {});
      logger.warn("MongoDB unavailable — starting in-memory database (DEV_MEMORY_DB_FALLBACK=true)");
      memoryServer = await MongoMemoryServer.create();
      uri = memoryServer.getUri("chainproof");
      await mongoose.connect(uri, {
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 10000,
        socketTimeoutMS: 45000,
      });
      return;
    }
    throw err;
  }
}
