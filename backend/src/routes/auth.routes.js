import { Router } from "express";
import { z } from "zod";
import { validate } from "../middleware/validate.js";
import { authenticate } from "../middleware/auth.js";
import * as authService from "../services/auth.service.js";

const router = Router();

const registerSchema = z.object({
  body: z.object({
    name: z.string().min(2).max(100),
    email: z.string().email(),
    password: z.string().min(8).max(128),
  }),
});

const loginSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string().min(1),
  }),
});

const firebaseSchema = z.object({
  body: z.object({
    idToken: z.string().min(1),
    name: z.string().min(2).max(100).optional(),
  }),
});

router.post("/register", validate(registerSchema), async (req, res, next) => {
  try {
    const result = await authService.registerUser(req.body);
    res.status(201).json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
});

router.post("/firebase", validate(firebaseSchema), async (req, res, next) => {
  try {
    const result = await authService.loginWithFirebase(req.body);
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
});

router.post("/login", validate(loginSchema), async (req, res, next) => {
  try {
    const result = await authService.loginUser(req.body);
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
});

router.get("/me", authenticate, async (req, res, next) => {
  try {
    const profile = await authService.getProfile(req.user._id);
    res.json({ success: true, data: profile });
  } catch (err) {
    next(err);
  }
});

export default router;
