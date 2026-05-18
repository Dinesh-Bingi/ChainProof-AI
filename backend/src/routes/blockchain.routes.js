import { Router } from "express";
import { authenticate } from "../middleware/auth.js";
import * as blockchainService from "../services/blockchain.service.js";

const router = Router();

router.get("/status", async (_req, res, next) => {
  try {
    const status = await blockchainService.getBlockchainStatus();
    res.json({ success: true, data: status });
  } catch (err) {
    next(err);
  }
});

router.get("/events", async (req, res, next) => {
  try {
    const limit = Math.min(parseInt(req.query.limit || "20", 10), 100);
    const events = await blockchainService.getOnChainEvents({ limit });
    res.json({ success: true, data: events });
  } catch (err) {
    next(err);
  }
});

router.get("/transactions", authenticate, async (req, res, next) => {
  try {
    const limit = Math.min(parseInt(req.query.limit || "20", 10), 100);
    const history = await blockchainService.getUserTransactionHistory(req.user._id, { limit });
    res.json({ success: true, data: history });
  } catch (err) {
    next(err);
  }
});

export default router;
