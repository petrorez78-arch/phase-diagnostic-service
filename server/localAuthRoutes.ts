/**
 * Local Authentication Routes
 * Simple email/password authentication without Manus OAuth
 */

import type { Express, Request, Response } from "express";
import { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";
import * as localAuth from "./localAuth";
import * as db from "./db";
import { getSessionCookieOptions } from "./_core/cookies";

export function registerLocalAuthRoutes(app: Express) {
  /**
   * POST /api/auth/register
   * Register new user with email and password
   */
  app.post("/api/auth/register", async (req: Request, res: Response) => {
    try {
      const { email, password, name } = req.body;

      if (!email || !password) {
        res.status(400).json({ error: "Email and password are required" });
        return;
      }

      const user = await localAuth.registerUser(email, password, name || email.split("@")[0]);

      if (!user) {
        res.status(500).json({ error: "Failed to create user" });
        return;
      }

      // Create session token
      const sessionToken = localAuth.createSessionToken(user.id.toString());

      // Set cookie
      const cookieOptions = getSessionCookieOptions(req);
      res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });

      res.json({
        success: true,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
        },
      });
    } catch (error) {
      console.error("[Auth] Registration failed:", error);
      const message = error instanceof Error ? error.message : "Registration failed";
      res.status(400).json({ error: message });
    }
  });

  /**
   * POST /api/auth/login
   * Login user with email and password
   */
  app.post("/api/auth/login", async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        res.status(400).json({ error: "Email and password are required" });
        return;
      }

      const user = await localAuth.loginUser(email, password);

      // Create session token
      const sessionToken = localAuth.createSessionToken(user.id.toString());

      // Set cookie
      const cookieOptions = getSessionCookieOptions(req);
      res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });

      res.json({
        success: true,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
        },
      });
    } catch (error) {
      console.error("[Auth] Login failed:", error);
      const message = error instanceof Error ? error.message : "Login failed";
      res.status(401).json({ error: message });
    }
  });

  /**
   * POST /api/auth/logout
   * Logout user (clear session cookie)
   */
  app.post("/api/auth/logout", (req: Request, res: Response) => {
    res.clearCookie(COOKIE_NAME);
    res.json({ success: true });
  });

  /**
   * GET /api/auth/me
   * Get current user info
   */
  app.get("/api/auth/me", async (req: Request, res: Response) => {
    try {
      const token = req.cookies[COOKIE_NAME];

      if (!token) {
        res.status(401).json({ error: "Not authenticated" });
        return;
      }

      const decoded = localAuth.verifySessionToken(token);
      if (!decoded) {
        res.status(401).json({ error: "Invalid token" });
        return;
      }

      const user = await db.getUserById(parseInt(decoded.userId));
      if (!user) {
        res.status(404).json({ error: "User not found" });
        return;
      }

      res.json({
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      });
    } catch (error) {
      console.error("[Auth] Get user failed:", error);
      res.status(500).json({ error: "Failed to get user" });
    }
  });
}
