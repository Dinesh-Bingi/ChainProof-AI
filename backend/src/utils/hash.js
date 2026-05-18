import crypto from "crypto";
import fs from "fs/promises";

export function hashBuffer(buffer) {
  return crypto.createHash("sha256").update(buffer).digest("hex");
}

/** Strip spaces, optional 0x prefix; lowercase hex for SHA-256 comparison */
export function normalizeContentHash(input) {
  if (!input || typeof input !== "string") return "";
  return input.trim().replace(/^0x/i, "").replace(/\s+/g, "").toLowerCase();
}

export function isValidSha256Hash(hash) {
  return /^[a-f0-9]{64}$/.test(hash);
}

export async function hashFile(filePath) {
  const buffer = await fs.readFile(filePath);
  return hashBuffer(buffer);
}

export function toBytes32(hexHash) {
  const normalized = hexHash.startsWith("0x") ? hexHash.slice(2) : hexHash;
  return `0x${normalized.padStart(64, "0").slice(0, 64)}`;
}
