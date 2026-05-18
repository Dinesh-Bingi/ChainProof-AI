import jwt from "jsonwebtoken";
import { User } from "../models/User.js";
import { config } from "../config/index.js";
import { AppError } from "../middleware/errorHandler.js";
import { logActivity } from "./activity.service.js";
import { getFirebaseAuth, isFirebaseEnabled } from "../config/firebase.js";

function signToken(userId) {
  return jwt.sign({ sub: userId }, config.jwt.secret, { expiresIn: config.jwt.expiresIn });
}

export async function registerUser({ name, email, password }) {
  const existing = await User.findOne({ email });
  if (existing) throw new AppError("Email already registered", 409);

  const user = await User.create({ name, email, password });
  const token = signToken(user._id.toString());
  await logActivity({
    userId: user._id,
    action: "register",
    resourceType: "user",
    resourceId: user._id,
  });

  return {
    user: { id: user._id, name: user.name, email: user.email },
    token,
  };
}

export async function loginUser({ email, password }) {
  const user = await User.findOne({ email }).select("+password");
  if (!user || !(await user.comparePassword(password))) {
    throw new AppError("Invalid email or password", 401);
  }

  const token = signToken(user._id.toString());
  await logActivity({
    userId: user._id,
    action: "login",
    resourceType: "auth",
    resourceId: user._id,
  });

  return {
    user: { id: user._id, name: user.name, email: user.email },
    token,
  };
}

export async function getProfile(userId) {
  const user = await User.findById(userId);
  if (!user) throw new AppError("User not found", 404);
  return { id: user._id, name: user.name, email: user.email, walletAddress: user.walletAddress };
}

function formatAuthResult(user, token) {
  return {
    user: { id: user._id, name: user.name, email: user.email },
    token,
  };
}

export async function loginWithFirebase({ idToken, name: nameOverride }) {
  if (!isFirebaseEnabled()) {
    throw new AppError("Firebase authentication is not configured on the server", 503);
  }

  const auth = getFirebaseAuth();
  let decoded;
  try {
    decoded = await auth.verifyIdToken(idToken);
  } catch {
    throw new AppError("Invalid Firebase token", 401);
  }

  const { uid, email, name: tokenName } = decoded;
  if (!email) throw new AppError("Firebase account must include an email", 400);

  const displayName = nameOverride?.trim() || tokenName || email.split("@")[0];

  let user = await User.findOne({ firebaseUid: uid });
  if (!user) {
    const byEmail = await User.findOne({ email });
    if (byEmail) {
      if (byEmail.firebaseUid && byEmail.firebaseUid !== uid) {
        throw new AppError("Email is linked to another sign-in method", 409);
      }
      byEmail.firebaseUid = uid;
      if (!byEmail.name && displayName) byEmail.name = displayName;
      await byEmail.save();
      user = byEmail;
    } else {
      user = await User.create({
        name: displayName,
        email,
        firebaseUid: uid,
        password: User.randomPassword(),
      });
      await logActivity({
        userId: user._id,
        action: "register",
        resourceType: "user",
        resourceId: user._id,
        metadata: { provider: "firebase" },
      });
    }
  }

  const token = signToken(user._id.toString());
  await logActivity({
    userId: user._id,
    action: "login",
    resourceType: "auth",
    resourceId: user._id,
    metadata: { provider: "firebase" },
  });

  return formatAuthResult(user, token);
}
