import { int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Phase diagnostic context - stores the latest diagnostic calculation for a stock
 */
export const phaseContext = mysqlTable("phase_context", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("user_id").notNull(),
  chatId: varchar("chat_id", { length: 64 }).notNull(), // Session identifier for chat context
  ticker: varchar("ticker", { length: 20 }).notNull(),
  company: varchar("company", { length: 255 }).notNull(),
  phase: varchar("phase", { length: 50 }), // Phase classification (e.g., "Accumulation", "Markup", etc.)
  s: int("s"), // S-index value
  vS: int("vS"), // Velocity of S
  aS: int("aS"), // Acceleration of S
  iFund: int("iFund"), // Fundamental index
  iMarketGap: int("iMarketGap"), // Market gap index
  iStruct: int("iStruct"), // Structure index
  iVola: int("iVola"), // Volatility index
  signals: text("signals"), // JSON array of weak signals
  lastPrice: int("last_price"), // Latest price in kopecks
  volToday: int("vol_today"), // Trading volume today
  numTrades: int("num_trades"), // Number of trades
  capitalization: int("capitalization"), // Market cap
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export type PhaseContext = typeof phaseContext.$inferSelect;
export type InsertPhaseContext = typeof phaseContext.$inferInsert;

/**
 * Chat history - stores conversation messages for context persistence
 */
export const chatHistory = mysqlTable("chat_history", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("user_id").notNull(),
  chatId: varchar("chat_id", { length: 64 }).notNull(),
  ticker: varchar("ticker", { length: 20 }).notNull(),
  role: mysqlEnum("role", ["user", "assistant"]).notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type ChatHistory = typeof chatHistory.$inferSelect;
export type InsertChatHistory = typeof chatHistory.$inferInsert;

/**
 * Diagnostic snapshots - historical records of all diagnostic calculations
 */
export const diagnosticSnapshots = mysqlTable("diagnostic_snapshots", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("user_id").notNull(),
  ticker: varchar("ticker", { length: 20 }).notNull(),
  company: varchar("company", { length: 255 }).notNull(),
  phase: varchar("phase", { length: 50 }),
  s: int("s"),
  vS: int("vS"),
  aS: int("aS"),
  iFund: int("iFund"),
  iMarketGap: int("iMarketGap"),
  iStruct: int("iStruct"),
  iVola: int("iVola"),
  signals: text("signals"), // JSON array
  lastPrice: int("last_price"),
  volToday: int("vol_today"),
  numTrades: int("num_trades"),
  capitalization: int("capitalization"),
  newsContext: text("news_context"), // JSON with news data and sentiment
  aiInterpretation: text("ai_interpretation"), // AI-generated explanation in Russian
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type DiagnosticSnapshot = typeof diagnosticSnapshots.$inferSelect;
export type InsertDiagnosticSnapshot = typeof diagnosticSnapshots.$inferInsert;

/**
 * Stock searches - tracks user search history
 */
export const stockSearches = mysqlTable("stock_searches", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("user_id").notNull(),
  query: varchar("query", { length: 255 }).notNull(),
  ticker: varchar("ticker", { length: 20 }),
  company: varchar("company", { length: 255 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type StockSearch = typeof stockSearches.$inferSelect;
export type InsertStockSearch = typeof stockSearches.$inferInsert;