/**
 * n8n Proxy Service
 * Forwards requests to n8n workflow and handles responses
 */

const N8N_WEBHOOK_URL = "https://n8ntestplace.ru/webhook-test/064742d3-f4c6-47d1-9d5f-9287ada12460";

export interface N8NRequest {
  message: string;
  chatId?: string;
  history?: Array<{ role: string; content: string }>;
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
    console.log("[n8n] Sending request to:", N8N_WEBHOOK_URL);
    console.log("[n8n] Message:", request.message);

    const response = await fetch(N8N_WEBHOOK_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: request.message,
        chatId: request.chatId || `chat-${Date.now()}`,
        timestamp: new Date().toISOString(),
        history: request.history || [],
      }),
    });

    console.log("[n8n] Response status:", response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("[n8n] Error response:", errorText);
      return {
        success: false,
        error: `n8n returned status ${response.status}: ${errorText}`,
      };
    }

    // Try to parse as JSON first, fall back to text
    let data;
    const contentType = response.headers.get("content-type");
    if (contentType?.includes("application/json")) {
      data = await response.json();
    } else {
      data = await response.text();
    }

    console.log("[n8n] Response data:", data);

    return {
      success: true,
      data,
      message: typeof data === "string" ? data : data.message || "Request processed",
    };
  } catch (error) {
    console.error("[n8n] Proxy error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Parse n8n response and extract structured data
 * n8n returns plain text responses from the AI agent
 */
export function parseN8NResponse(response: any) {
  // If response is a string, it's the AI agent's text response
  if (typeof response === "string") {
    return {
      type: "chat",
      message: response,
    };
  }

  // If response is an object with message field
  if (response && typeof response === "object" && response.message) {
    return {
      type: "chat",
      message: response.message,
    };
  }

  // If response is an object with output field (common n8n pattern)
  if (response && typeof response === "object" && response.output) {
    return {
      type: "chat",
      message: response.output,
    };
  }

  // If response is an array, treat as search results
  if (Array.isArray(response)) {
    return {
      type: "search",
      results: response,
    };
  }

  // Fallback: treat as chat response
  return {
    type: "chat",
    message: JSON.stringify(response),
  };
}
