import { config } from "./config/index.js";
import { connectDatabase } from "./config/database.js";
import { isFirebaseEnabled, getFirebaseAuth } from "./config/firebase.js";
import app from "./app.js";
import { logger } from "./utils/logger.js";

async function bootstrap() {
  await connectDatabase();
  if (isFirebaseEnabled()) {
    getFirebaseAuth();
    logger.info("Firebase Admin ready (Google sign-in enabled)");
  } else {
    logger.warn("Firebase Admin not configured — Google sign-in disabled on API");
  }
  app.listen(config.port, () => {
    logger.info(`ChainProof API listening on port ${config.port} [${config.env}]`);
  });
}

bootstrap().catch((err) => {
  logger.error("Failed to start server", err);
  process.exit(1);
});
