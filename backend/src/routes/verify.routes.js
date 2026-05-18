import { Router } from "express";
import { z } from "zod";
import { validate } from "../middleware/validate.js";
import { authenticate } from "../middleware/auth.js";
import { verifyOwnership } from "../services/verify.service.js";
import { hashFile, normalizeContentHash } from "../utils/hash.js";
import { upload } from "../middleware/upload.js";
import fs from "fs/promises";

const router = Router();

const hashSchema = z.object({
  body: z.object({
    contentHash: z
      .string()
      .transform((v) => normalizeContentHash(v))
      .pipe(
        z
          .string()
          .length(64, "SHA-256 hash must be exactly 64 hex characters (check for spaces or missing characters)")
          .regex(/^[a-f0-9]{64}$/, "Invalid characters — use only 0-9 and a-f")
      ),
  }),
});

router.post("/hash", authenticate, validate(hashSchema), async (req, res, next) => {
  try {
    const result = await verifyOwnership(req.body.contentHash.toLowerCase(), req.user._id);
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
});

router.post("/file", authenticate, upload.single("file"), async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: "File is required" });
    const contentHash = await hashFile(req.file.path);
    const result = await verifyOwnership(contentHash, req.user._id);
    await fs.unlink(req.file.path).catch(() => {});
    res.json({ success: true, data: { ...result, contentHash } });
  } catch (err) {
    next(err);
  }
});

export default router;
