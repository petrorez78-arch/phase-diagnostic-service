import { and, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  InsertUser,
  users,
  phaseContext,
  chatHistory,
  diagnosticSnapshots,
  stockSearches,
} from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

/**
 * Phase Context Queries
 */
export async function upsertPhaseContext(data: {
  userId: number;
  chatId: string;
  ticker: string;
  company: string;
  phase?: string;
  s?: number;
  vS?: number;
  aS?: number;
  iFund?: number;
  iMarketGap?: number;
  iStruct?: number;
  iVola?: number;
  signals?: string[];
  lastPrice?: number;
  volToday?: number;
  numTrades?: number;
  capitalization?: number;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const signalsJson = data.signals ? JSON.stringify(data.signals) : null;
  const existing = await db
    .select()
    .from(phaseContext)
    .where(eq(phaseContext.chatId, data.chatId))
    .limit(1);

  if (existing.length > 0) {
    await db
      .update(phaseContext)
      .set({
        ticker: data.ticker,
        company: data.company,
        phase: data.phase,
        s: data.s,
        vS: data.vS,
        aS: data.aS,
        iFund: data.iFund,
        iMarketGap: data.iMarketGap,
        iStruct: data.iStruct,
        iVola: data.iVola,
        signals: signalsJson,
        lastPrice: data.lastPrice,
        volToday: data.volToday,
        numTrades: data.numTrades,
        capitalization: data.capitalization,
      })
      .where(eq(phaseContext.chatId, data.chatId));
  } else {
    await db.insert(phaseContext).values({
      userId: data.userId,
      chatId: data.chatId,
      ticker: data.ticker,
      company: data.company,
      phase: data.phase,
      s: data.s,
      vS: data.vS,
      aS: data.aS,
      iFund: data.iFund,
      iMarketGap: data.iMarketGap,
      iStruct: data.iStruct,
      iVola: data.iVola,
      signals: signalsJson,
      lastPrice: data.lastPrice,
      volToday: data.volToday,
      numTrades: data.numTrades,
      capitalization: data.capitalization,
    });
  }
}

export async function getPhaseContext(chatId: string) {
  const db = await getDb();
  if (!db) return null;

  const result = await db
    .select()
    .from(phaseContext)
    .where(eq(phaseContext.chatId, chatId))
    .limit(1);

  return result.length > 0 ? result[0] : null;
}

/**
 * Chat History Queries
 */
export async function addChatMessage(data: {
  userId: number;
  chatId: string;
  ticker: string;
  role: "user" | "assistant";
  content: string;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.insert(chatHistory).values(data);
}

export async function getChatHistory(chatId: string, limit: number = 20) {
  const db = await getDb();
  if (!db) return [];

  const result = await db
    .select()
    .from(chatHistory)
    .where(eq(chatHistory.chatId, chatId))
    .orderBy((t) => t.createdAt)
    .limit(limit);

  return result;
}

export async function getUserChatSessions(userId: number) {
  const db = await getDb();
  if (!db) return [];

  // Get all chat messages for user, then group by chatId in JavaScript
  const messages = await db
    .select()
    .from(chatHistory)
    .where(eq(chatHistory.userId, userId))
    .orderBy(chatHistory.createdAt);

  // Group by chatId and get the most recent message for each
  const sessionsMap = new Map<string, typeof messages[0]>();
  for (const msg of messages) {
    if (!sessionsMap.has(msg.chatId) || 
        (sessionsMap.get(msg.chatId)!.createdAt < msg.createdAt)) {
      sessionsMap.set(msg.chatId, msg);
    }
  }

  // Convert to array and sort by most recent
  const sessions = Array.from(sessionsMap.values())
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .slice(0, 20)
    .map(msg => ({
      chatId: msg.chatId,
      ticker: msg.ticker,
      lastMessage: msg.content,
      lastMessageTime: msg.createdAt,
    }));

  return sessions;
}

/**
 * Diagnostic Snapshots Queries
 */
export async function saveDiagnosticSnapshot(data: {
  userId: number;
  ticker: string;
  company: string;
  phase?: string;
  s?: number;
  vS?: number;
  aS?: number;
  iFund?: number;
  iMarketGap?: number;
  iStruct?: number;
  iVola?: number;
  signals?: string[];
  lastPrice?: number;
  volToday?: number;
  numTrades?: number;
  capitalization?: number;
  newsContext?: Record<string, unknown>;
  aiInterpretation?: string;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const signalsJson = data.signals ? JSON.stringify(data.signals) : null;
  const newsContextJson = data.newsContext
    ? JSON.stringify(data.newsContext)
    : null;

  await db.insert(diagnosticSnapshots).values({
    userId: data.userId,
    ticker: data.ticker,
    company: data.company,
    phase: data.phase,
    s: data.s,
    vS: data.vS,
    aS: data.aS,
    iFund: data.iFund,
    iMarketGap: data.iMarketGap,
    iStruct: data.iStruct,
    iVola: data.iVola,
    signals: signalsJson,
    lastPrice: data.lastPrice,
    volToday: data.volToday,
    numTrades: data.numTrades,
    capitalization: data.capitalization,
    newsContext: newsContextJson,
    aiInterpretation: data.aiInterpretation,
  });
}

export async function getDiagnosticHistory(
  userId: number,
  ticker: string,
  limit: number = 10
) {
  const db = await getDb();
  if (!db) return [];

  const result = await db
    .select()
    .from(diagnosticSnapshots)
    .where(
      and(
        eq(diagnosticSnapshots.userId, userId),
        eq(diagnosticSnapshots.ticker, ticker)
      )
    )
    .orderBy((t) => t.createdAt)
    .limit(limit);

  return result;
}

/**
 * Stock Searches Queries
 */
export async function recordStockSearch(data: {
  userId: number;
  query: string;
  ticker?: string;
  company?: string;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.insert(stockSearches).values(data);
}

export async function getSearchHistory(userId: number, limit: number = 10) {
  const db = await getDb();
  if (!db) return [];

  const result = await db
    .select()
    .from(stockSearches)
    .where(eq(stockSearches.userId, userId))
    .orderBy((t) => t.createdAt)
    .limit(limit);

  return result;
}
