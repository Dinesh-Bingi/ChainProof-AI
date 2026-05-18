import admin from "firebase-admin";
import { readFileSync } from "fs";
import { config } from "./index.js";
import { logger } from "../utils/logger.js";

let app = null;

function loadServiceAccount() {
  if (config.firebase.serviceAccountJson) {
    return JSON.parse(config.firebase.serviceAccountJson);
  }
  if (config.firebase.serviceAccountPath) {
    return JSON.parse(readFileSync(config.firebase.serviceAccountPath, "utf8"));
  }
  return null;
}

export function isFirebaseEnabled() {
  return Boolean(config.firebase.projectId && (config.firebase.serviceAccountJson || config.firebase.serviceAccountPath));
}

export function getFirebaseAuth() {
  if (!isFirebaseEnabled()) return null;
  if (!app) {
    const credential = admin.credential.cert(loadServiceAccount());
    app = admin.initializeApp({
      credential,
      projectId: config.firebase.projectId,
    });
    logger.info("Firebase Admin initialized");
  }
  return admin.auth(app);
}
