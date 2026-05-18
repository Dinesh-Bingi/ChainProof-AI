import multer from "multer";
import path from "path";
import fs from "fs";
import { config } from "../config/index.js";
import { AppError } from "./errorHandler.js";

fs.mkdirSync(config.uploadsDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, config.uploadsDir),
  filename: (_req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${unique}${path.extname(file.originalname)}`);
  },
});

const ALLOWED = [
  "application/pdf",
  "text/plain",
  "text/markdown",
  "application/json",
  "image/png",
  "image/jpeg",
  "image/webp",
];

export const upload = multer({
  storage,
  limits: { fileSize: 25 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (ALLOWED.includes(file.mimetype)) return cb(null, true);
    cb(new AppError(`File type not allowed: ${file.mimetype}`, 400));
  },
});
