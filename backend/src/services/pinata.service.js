import fs from "fs";
import { config } from "../config/index.js";
import { AppError } from "../middleware/errorHandler.js";
import { logger } from "../utils/logger.js";

const MAX_FILE_BYTES = 50 * 1024 * 1024;

export function isPinataConfigured() {
  return Boolean(config.pinata.apiKey && config.pinata.secretKey);
}

export async function uploadToPinata(filePath, fileName, metadata = {}) {
  const stat = fs.statSync(filePath);
  if (stat.size > MAX_FILE_BYTES) {
    throw new AppError("File exceeds 50MB IPFS upload limit", 413);
  }

  if (!isPinataConfigured()) {
    logger.warn("Pinata credentials missing — using mock CID for development");
    const mockCid = `bafy${Buffer.from(fileName + Date.now()).toString("hex").slice(0, 44)}`;
    return { cid: mockCid, url: `${config.pinata.gateway}/${mockCid}`, mocked: true };
  }

  const formData = new FormData();
  const blob = new Blob([fs.readFileSync(filePath)]);
  formData.append("file", blob, fileName);
  formData.append(
    "pinataMetadata",
    JSON.stringify({
      name: fileName,
      keyvalues: { app: "chainproof-ai", ...metadata },
    })
  );
  formData.append("pinataOptions", JSON.stringify({ cidVersion: 1 }));

  const response = await fetch("https://api.pinata.cloud/pinning/pinFileToIPFS", {
    method: "POST",
    headers: {
      pinata_api_key: config.pinata.apiKey,
      pinata_secret_api_key: config.pinata.secretKey,
    },
    body: formData,
  });

  if (!response.ok) {
    const errText = await response.text();
    logger.error("Pinata upload failed", errText);
    throw new AppError(`IPFS upload failed: ${errText}`, 502);
  }

  const data = await response.json();
  const cid = data.IpfsHash;
  if (!cid?.startsWith("Qm") && !cid?.startsWith("baf")) {
    throw new AppError("Invalid CID returned from Pinata", 502);
  }

  logger.info("Pinata upload success", { cid, fileName });
  return {
    cid,
    url: `${config.pinata.gateway}/${cid}`,
    mocked: false,
  };
}

export async function verifyPinataConnection() {
  if (!isPinataConfigured()) return { configured: false, ok: false };
  try {
    const res = await fetch("https://api.pinata.cloud/data/testAuthentication", {
      headers: { pinata_api_key: config.pinata.apiKey },
    });
    return { configured: true, ok: res.ok };
  } catch {
    return { configured: true, ok: false };
  }
}
