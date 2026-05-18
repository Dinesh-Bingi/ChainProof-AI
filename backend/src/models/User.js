import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import crypto from "crypto";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, minlength: 8, select: false },
    firebaseUid: { type: String, unique: true, sparse: true, index: true },
    walletAddress: { type: String, trim: true },
  },
  { timestamps: true }
);

userSchema.pre("save", async function hashPassword() {
  if (!this.isModified("password") || !this.password) return;
  this.password = await bcrypt.hash(this.password, 12);
});

userSchema.pre("validate", function requirePasswordOrFirebase() {
  if (!this.firebaseUid && !this.password) {
    this.invalidate("password", "Password is required for email registration");
  }
});

userSchema.methods.comparePassword = function comparePassword(candidate) {
  if (!this.password) return false;
  return bcrypt.compare(candidate, this.password);
};

userSchema.statics.randomPassword = function randomPassword() {
  return crypto.randomBytes(32).toString("hex");
};

export const User = mongoose.model("User", userSchema);
