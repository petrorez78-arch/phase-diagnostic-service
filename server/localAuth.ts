/**
 * Local Authentication System
 * Simple email/password authentication without Manus OAuth
 */

import * as crypto from "crypto";
import * as db from "./db";

const SALT_ROUNDS = 10;

/**
 * Hash password with salt
 */
export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto
    .pbkdf2Sync(password, salt, 100000, 64, "sha512")
    .toString("hex");
  return `${salt}:${hash}`;
}

/**
 * Verify password against hash
 */
export function verifyPassword(password: string, hash: string): boolean {
  const [salt, originalHash] = hash.split(":");
  if (!salt || !originalHash) return false;

  const newHash = crypto
    .pbkdf2Sync(password, salt, 100000, 64, "sha512")
    .toString("hex");
  return newHash === originalHash;
}

/**
 * Register new user
 */
export async function registerUser(
  email: string,
  password: string,
  name: string
) {
  // Check if user already exists
  const existingUser = await db.getUserByEmail(email);
  if (existingUser) {
    throw new Error("User with this email already exists");
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw new Error("Invalid email format");
  }

  // Validate password length
  if (password.length < 6) {
    throw new Error("Password must be at least 6 characters");
  }

  // Hash password
  const passwordHash = hashPassword(password);

  // Create user
  const user = await db.upsertUser({
    email,
    name: name || email.split("@")[0],
    passwordHash,
    loginMethod: "local",
    lastSignedIn: new Date(),
  });

  return user;
}

/**
 * Login user with email and password
 */
export async function loginUser(email: string, password: string) {
  const user = await db.getUserByEmail(email);

  if (!user) {
    throw new Error("User not found");
  }

  if (!user.passwordHash) {
    throw new Error("User does not have a password set");
  }

  if (!verifyPassword(password, user.passwordHash)) {
    throw new Error("Invalid password");
  }

  // Update last signed in
  await db.updateUserLastSignedIn(user.id);

  return user;
}

/**
 * Create session token (simple JWT-like token)
 */
export function createSessionToken(userId: string): string {
  const payload = {
    userId,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60, // 30 days
  };

  const header = Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })).toString("base64");
  const body = Buffer.from(JSON.stringify(payload)).toString("base64");
  const signature = crypto
    .createHmac("sha256", process.env.JWT_SECRET || "default-secret")
    .update(`${header}.${body}`)
    .digest("base64");

  return `${header}.${body}.${signature}`;
}

/**
 * Verify session token
 */
export function verifySessionToken(token: string): { userId: string } | null {
  try {
    const [header, body, signature] = token.split(".");
    if (!header || !body || !signature) return null;

    // Verify signature
    const expectedSignature = crypto
      .createHmac("sha256", process.env.JWT_SECRET || "default-secret")
      .update(`${header}.${body}`)
      .digest("base64");

    if (signature !== expectedSignature) return null;

    // Decode and verify payload
    const payload = JSON.parse(Buffer.from(body, "base64").toString());

    if (payload.exp < Math.floor(Date.now() / 1000)) {
      return null; // Token expired
    }

    return { userId: payload.userId };
  } catch (error) {
    return null;
  }
}
