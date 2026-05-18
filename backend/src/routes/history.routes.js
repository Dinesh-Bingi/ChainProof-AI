import { Router } from "express";
import { authenticate } from "../middleware/auth.js";
import { getUserHistory } from "../services/activity.service.js";
import { Proof } from "../models/Proof.js";

const router = Router();

router.use(authenticate);

router.get("/", async (req, res, next) => {
  try {
    const page = parseInt(req.query.page || "1", 10);
    const limit = parseInt(req.query.limit || "20", 10);
    const history = await getUserHistory(req.user._id, { page, limit });
    res.json({ success: true, data: history });
  } catch (err) {
    next(err);
  }
});

router.get("/proofs", async (req, res, next) => {
  try {
    const proofs = await Proof.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .select("title contentHash status createdAt ipfsCid blockchainTxHash")
      .lean();
    res.json({ success: true, data: proofs });
  } catch (err) {
    next(err);
  }
});

export default router;
