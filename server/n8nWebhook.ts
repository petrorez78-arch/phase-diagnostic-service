/**
 * n8n Webhook Handler
 * Provides endpoint for n8n workflow to trigger diagnostics
 */

import { Router, Request, Response } from "express";
import { getMarketData, getHistoryData, searchSecurities } from "./moex";
import { computePhaseDiagnostics } from "./phaseDiagnostics";
import { getNewsAndSentiment } from "./smartlab";

export const n8nRouter = Router();

interface N8NWebhookPayload {
  ticker?: string;
  company?: string;
  query?: string;
  action?: "search" | "analyze";
}

/**
 * POST /api/n8n/webhook
 * Receives webhook calls from n8n workflow
 */
n8nRouter.post("/webhook", async (req: Request, res: Response) => {
  try {
    const payload = req.body as N8NWebhookPayload;

    if (!payload.action) {
      return res.status(400).json({
        success: false,
        error: "Missing action parameter (search or analyze)",
      });
    }

    if (payload.action === "search") {
      if (!payload.query) {
        return res.status(400).json({
          success: false,
          error: "Missing query parameter for search",
        });
      }

      const results = await searchSecurities(payload.query);
      return res.json({
        success: true,
        action: "search",
        results,
      });
    }

    if (payload.action === "analyze") {
      if (!payload.ticker) {
        return res.status(400).json({
          success: false,
          error: "Missing ticker parameter for analysis",
        });
      }

      // Fetch market data
      const marketData = await getMarketData(payload.ticker);
      if (!marketData) {
        return res.status(404).json({
          success: false,
          error: "Failed to fetch market data for ticker",
        });
      }

      // Fetch history
      const history = await getHistoryData(payload.ticker);
      if (history.length === 0) {
        return res.status(404).json({
          success: false,
          error: "No historical data available",
        });
      }

      // Compute diagnostics
      const diagnostics = computePhaseDiagnostics(
        history.map((h) => ({
          close: h.close,
          volume: h.volume,
          date: h.tradeDate,
        })),
        marketData.lastPrice / 100 // Convert from kopecks
      );

      // Fetch news
      const newsData = await getNewsAndSentiment(payload.ticker);

      return res.json({
        success: true,
        action: "analyze",
        ticker: payload.ticker,
        company: payload.company || payload.ticker,
        marketData,
        diagnostics,
        newsData,
        timestamp: new Date().toISOString(),
      });
    }

    return res.status(400).json({
      success: false,
      error: "Unknown action",
    });
  } catch (error) {
    console.error("n8n webhook error:", error);
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Internal server error",
    });
  }
});

/**
 * GET /api/n8n/health
 * Health check endpoint for n8n
 */
n8nRouter.get("/health", (req: Request, res: Response) => {
  res.json({
    status: "ok",
    service: "Phase Diagnostic n8n Webhook",
    timestamp: new Date().toISOString(),
  });
});

export default n8nRouter;
