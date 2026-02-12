/**
 * n8n Proxy Service
 * Forwards requests to n8n workflow and handles responses
 */

const N8N_WEBHOOK_URL = "https://n8ntestplace.ru/webhook/74ae03d5-bcb6-44e9-916a-b2ac237760d0";

export interface N8NRequest {
  message: string;
  chatId?: string;
}

export interface N8NResponse {
  success: boolean;
  data?: any;
  error?: string;
  message?: string;
}

/**
 * Send request to n8n workflow
 */
export async function sendToN8N(request: N8NRequest): Promise<N8NResponse> {
  try {
    const response = await fetch(N8N_WEBHOOK_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: request.message,
        chatId: request.chatId || `chat-${Date.now()}`,
        timestamp: new Date().toISOString(),
      }),
    });

    if (!response.ok) {
      return {
        success: false,
        error: `n8n returned status ${response.status}`,
      };
    }

    const data = await response.json();

    return {
      success: true,
      data,
      message: data.message || "Request processed",
    };
  } catch (error) {
    console.error("n8n proxy error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Parse n8n response and extract structured data
 */
export function parseN8NResponse(response: any) {
  // Handle different response formats from n8n
  if (response.diagnostics) {
    return {
      type: "analysis",
      ticker: response.ticker,
      company: response.company,
      phase: response.diagnostics.phase,
      indices: {
        s: response.diagnostics.s,
        vS: response.diagnostics.vS,
        aS: response.diagnostics.aS,
        iFund: response.diagnostics.iFund,
        iMarketGap: response.diagnostics.iMarketGap,
        iStruct: response.diagnostics.iStruct,
        iVola: response.diagnostics.iVola,
      },
      signals: response.diagnostics.signals,
      marketData: response.marketData,
      news: response.newsData?.news || [],
      rhetoricalPressure: response.newsData?.rhetoricalPressure,
    };
  }

  if (response.message) {
    return {
      type: "chat",
      message: response.message,
    };
  }

  if (Array.isArray(response)) {
    return {
      type: "search",
      results: response,
    };
  }

  return {
    type: "raw",
    data: response,
  };
}
