import { Router } from "express";
import { z } from "zod";
import { authenticate } from "../middleware/auth.js";
import { upload } from "../middleware/upload.js";
import { validate } from "../middleware/validate.js";
import * as proofService from "../services/proof.service.js";

const router = Router();

router.use(authenticate);

router.get("/dashboard", async (req, res, next) => {
  try {
    const stats = await proofService.getDashboardStats(req.user._id);
    res.json({ success: true, data: stats });
  } catch (err) {
    next(err);
  }
});

router.get("/", async (req, res, next) => {
  try {
    const page = parseInt(req.query.page || "1", 10);
    const limit = parseInt(req.query.limit || "10", 10);
    const result = await proofService.listProofs(req.user._id, { page, limit });
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    const proof = await proofService.getProofById(req.params.id, req.user._id);
    res.json({ success: true, data: proof });
  } catch (err) {
    next(err);
  }
});

const uploadSchema = z.object({
  body: z.object({
    title: z.string().min(1).max(200),
    description: z.string().max(2000).optional(),
  }),
});

router.post("/", upload.single("file"), validate(uploadSchema), async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: "File is required" });
    const result = await proofService.createProof({
      user: req.user,
      file: req.file,
      title: req.body.title,
      description: req.body.description,
    });
    res.status(201).json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
});

export default router;
