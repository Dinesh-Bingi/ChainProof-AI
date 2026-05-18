import { Router } from "express";
import path from "path";
import fs from "fs";
import { authenticate } from "../middleware/auth.js";
import { Proof } from "../models/Proof.js";
import { issueCertificate, getCertificateForUser } from "../services/certificate.service.js";
import { AppError } from "../middleware/errorHandler.js";

const router = Router();

router.use(authenticate);

router.post("/:proofId", async (req, res, next) => {
  try {
    const proof = await Proof.findOne({ _id: req.params.proofId, userId: req.user._id });
    if (!proof) throw new AppError("Proof not found", 404);
    if (proof.status === "flagged") {
      throw new AppError("Cannot issue certificate for flagged content", 400);
    }
    const certificate = await issueCertificate({ proof, user: req.user });
    if (!proof.certificateId) {
      proof.certificateId = certificate._id;
      await proof.save();
    }
    res.status(201).json({ success: true, data: certificate });
  } catch (err) {
    next(err);
  }
});

router.get("/:id/download", async (req, res, next) => {
  try {
    const cert = await getCertificateForUser(req.params.id, req.user._id);
    if (!fs.existsSync(cert.filePath)) throw new AppError("Certificate file missing", 404);
    res.download(cert.filePath, `${cert.certificateNumber}.pdf`);
  } catch (err) {
    next(err);
  }
});

export default router;
