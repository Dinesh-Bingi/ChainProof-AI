import jwt from "jsonwebtoken";
import { config } from "../config/index.js";
import { User } from "../models/User.js";
import { AppError } from "./errorHandler.js";

export async function authenticate(req, _res, next) {
  try {
    const header = req.headers.authorization;
    if (!header?.startsWith("Bearer ")) {
      throw new AppError("Authentication required", 401);
    }
    const token = header.slice(7);
    const payload = jwt.verify(token, config.jwt.secret);
    const user = await User.findById(payload.sub).select("-password");
    if (!user) throw new AppError("User not found", 401);
    req.user = user;
    next();
  } catch (err) {
    if (err instanceof AppError) return next(err);
    next(new AppError("Invalid or expired token", 401));
  }
}
