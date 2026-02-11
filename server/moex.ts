/**
 * MOEX API Client
 * Handles all interactions with MOEX (Moscow Exchange) API
 */

const MOEX_BASE = "https://iss.moex.com/iss";

interface MOEXSecuritySearchResult {
  secid: string;
  name: string;
}

interface MOEXMarketData {
  ticker: string;
  lastPrice: number;
  volToday: number;
  numTrades: number;
  capitalization?: number;
}

interface MOEXHistoryRecord {
  tradeDate: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

/**
 * Search for securities by query (name or ticker)
 */
export async function searchSecurities(
  query: string
): Promise<MOEXSecuritySearchResult[]> {
  try {
    const url = new URL(`${MOEX_BASE}/securities.json`);
    url.searchParams.append("q", query);
    url.searchParams.append("limit", "20");
    url.searchParams.append("iss.meta", "off");

    const response = await fetch(url.toString());
    if (!response.ok) throw new Error(`MOEX search failed: ${response.status}`);

    const data = (await response.json()) as any;
    const securities = data.securities?.data || [];
    const columns = data.securities?.columns || [];

    const secidIdx = columns.indexOf("secid");
    const nameIdx = columns.indexOf("name");

    if (secidIdx === -1 || nameIdx === -1) {
      return [];
    }

    return securities
      .map((row: any[]) => ({
        secid: row[secidIdx],
        name: row[nameIdx],
      }))
      .filter((s: any) => !s.secid.startsWith("FIX"));
  } catch (error) {
    console.error("MOEX search error:", error);
    return [];
  }
}

/**
 * Get security details and check if it trades on TQBR board
 */
export async function getSecurityDetails(
  secid: string
): Promise<{ ticker: string; company: string } | null> {
  try {
    const url = new URL(`${MOEX_BASE}/securities/${secid}.json`);
    url.searchParams.append("iss.meta", "off");
    url.searchParams.append("iss.only", "boards");

    const response = await fetch(url.toString());
    if (!response.ok) return null;

    const data = (await response.json()) as any;
    const boards = data.boards?.data || [];
    const columns = data.boards?.columns || [];

    // Map columns to indices
    const colMap: Record<string, number> = {};
    columns.forEach((col: string, idx: number) => {
      colMap[col] = idx;
    });

    // Check if security trades on TQBR (main board)
    const validBoard = boards.find(
      (row: any[]) =>
        row[colMap.engine] === "stock" &&
        row[colMap.market] === "shares" &&
        row[colMap.boardid] === "TQBR" &&
        row[colMap.is_traded] === 1
    );

    if (!validBoard) return null;

    return {
      ticker: secid,
      company: secid, // Will be updated with proper name from search
    };
  } catch (error) {
    console.error("Get security details error:", error);
    return null;
  }
}

/**
 * Get current market data for a security
 */
export async function getMarketData(
  ticker: string
): Promise<MOEXMarketData | null> {
  try {
    const url = new URL(
      `${MOEX_BASE}/engines/stock/markets/shares/securities/${ticker}.json`
    );
    url.searchParams.append("iss.meta", "off");
    url.searchParams.append("iss.only", "marketdata,securities");

    const response = await fetch(url.toString());
    if (!response.ok) return null;

    const data = (await response.json()) as any;

    // Try marketdata first, fallback to securities
    let row = null;
    let cols = null;

    const md = data.marketdata;
    const sec = data.securities;

    if (md && md.data && md.data.length > 0) {
      row = md.data[0];
      cols = md.columns;
    } else if (sec && sec.data && sec.data.length > 0) {
      row = sec.data[0];
      cols = sec.columns;
    }

    if (!row || !cols) return null;

    const getColValue = (name: string) => {
      const idx = cols.indexOf(name);
      return idx !== -1 ? row[idx] : null;
    };

    const lastPrice =
      getColValue("LAST") ??
      getColValue("PREVPRICE") ??
      getColValue("CLOSEPRICE");
    const volToday = getColValue("VOLTODAY") ?? getColValue("VOLUME") ?? 0;
    const numTrades = getColValue("NUMTRADES") ?? 0;
    const capitalization = getColValue("CAPITALIZATION");

    return {
      ticker,
      lastPrice: lastPrice ? Math.round(lastPrice * 100) : 0, // Convert to kopecks
      volToday: volToday || 0,
      numTrades: numTrades || 0,
      capitalization: capitalization ? Math.round(capitalization) : undefined,
    };
  } catch (error) {
    console.error("Get market data error:", error);
    return null;
  }
}

/**
 * Get historical price data for the last 30 days
 */
export async function getHistoryData(
  ticker: string
): Promise<MOEXHistoryRecord[]> {
  try {
    const url = new URL(
      `${MOEX_BASE}/history/engines/stock/markets/shares/boards/TQBR/securities/${ticker}.json`
    );

    // Set date range (last 30 days from 2025-12-15 as in original workflow)
    url.searchParams.append("from", "2025-12-15");
    url.searchParams.append(
      "history.columns",
      "TRADEDATE,OPEN,HIGH,LOW,CLOSE,VOLUME"
    );
    url.searchParams.append("iss.meta", "off");

    const response = await fetch(url.toString());
    if (!response.ok) return [];

    const data = (await response.json()) as any;
    const history = data.history?.data || [];
    const columns = data.history?.columns || [];

    const colMap: Record<string, number> = {};
    columns.forEach((col: string, idx: number) => {
      colMap[col] = idx;
    });

    return history.map((row: any[]) => ({
      tradeDate: row[colMap.TRADEDATE] || "",
      open: row[colMap.OPEN] || 0,
      high: row[colMap.HIGH] || 0,
      low: row[colMap.LOW] || 0,
      close: row[colMap.CLOSE] || 0,
      volume: row[colMap.VOLUME] || 0,
    }));
  } catch (error) {
    console.error("Get history data error:", error);
    return [];
  }
}
