/**
 * Smart-lab API Client
 * Handles financial data scraping and news sentiment analysis
 */

interface FinancialData {
  revenue?: number;
  netIncome?: number;
  debt?: number;
  equity?: number;
}

interface NewsItem {
  title: string;
  date: string;
  sentiment: "positive" | "negative" | "neutral";
  text: string;
}

/**
 * Fetch financial data from Smart-lab MSFO page
 */
export async function getFinancialData(
  ticker: string
): Promise<FinancialData | null> {
  try {
    const url = `https://smart-lab.ru/q/${ticker}/f/q/MSFO`;

    const response = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
    });

    if (!response.ok) {
      console.warn(`Smart-lab financial data fetch failed: ${response.status}`);
      return null;
    }

    // Parse HTML response to extract financial metrics
    // This is a simplified extraction - in production, use proper HTML parsing
    const html = await response.text();

    // Extract key financial metrics using regex patterns
    const revenueMatch = html.match(/Выручка[^0-9]*([0-9.]+)/i);
    const netIncomeMatch = html.match(/Чистая прибыль[^0-9]*([0-9.]+)/i);
    const debtMatch = html.match(/Долг[^0-9]*([0-9.]+)/i);
    const equityMatch = html.match(/Собственный капитал[^0-9]*([0-9.]+)/i);

    return {
      revenue: revenueMatch ? parseFloat(revenueMatch[1]) : undefined,
      netIncome: netIncomeMatch ? parseFloat(netIncomeMatch[1]) : undefined,
      debt: debtMatch ? parseFloat(debtMatch[1]) : undefined,
      equity: equityMatch ? parseFloat(equityMatch[1]) : undefined,
    };
  } catch (error) {
    console.error("Smart-lab financial data fetch error:", error);
    return null;
  }
}

/**
 * Fetch news from Smart-lab and analyze sentiment
 */
export async function getNewsAndSentiment(
  ticker: string
): Promise<{ news: NewsItem[]; rhetoricalPressure: number } | null> {
  try {
    const url = `https://smart-lab.ru/q/${ticker}/news/`;

    const response = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
    });

    if (!response.ok) {
      console.warn(`Smart-lab news fetch failed: ${response.status}`);
      return null;
    }

    const html = await response.text();

    // Extract news items and compute sentiment
    const newsItems: NewsItem[] = [];
    let positiveCount = 0;
    let negativeCount = 0;
    let neutralCount = 0;

    // Simple regex-based news extraction
    const newsRegex = /<div class="news-item">(.*?)<\/div>/g;
    let match;

    while ((match = newsRegex.exec(html)) !== null) {
      const newsHtml = match[1];

      // Extract title
      const titleMatch = newsHtml.match(/<h\d>(.*?)<\/h\d>/);
      const title = titleMatch ? titleMatch[1].replace(/<[^>]*>/g, "") : "";

      // Extract date
      const dateMatch = newsHtml.match(/(\d{4}-\d{2}-\d{2})/);
      const date = dateMatch ? dateMatch[1] : new Date().toISOString().split("T")[0];

      // Simple sentiment analysis based on keywords
      const text = newsHtml.toLowerCase();
      let sentiment: "positive" | "negative" | "neutral" = "neutral";

      const positiveKeywords = [
        "рост",
        "прибыль",
        "успех",
        "хороший",
        "отличный",
        "повышение",
      ];
      const negativeKeywords = [
        "падение",
        "убыток",
        "проблема",
        "плохой",
        "снижение",
        "риск",
      ];

      const hasPositive = positiveKeywords.some((kw) => text.includes(kw));
      const hasNegative = negativeKeywords.some((kw) => text.includes(kw));

      if (hasPositive && !hasNegative) {
        sentiment = "positive";
        positiveCount++;
      } else if (hasNegative && !hasPositive) {
        sentiment = "negative";
        negativeCount++;
      } else {
        neutralCount++;
      }

      newsItems.push({
        title,
        date,
        sentiment,
        text: newsHtml.replace(/<[^>]*>/g, "").substring(0, 200),
      });
    }

    // Calculate rhetorical pressure (sentiment ratio)
    const total = positiveCount + negativeCount + neutralCount;
    const rhetoricalPressure =
      total > 0
        ? (positiveCount - negativeCount) / total
        : 0;

    return {
      news: newsItems.slice(0, 5), // Return top 5 news items
      rhetoricalPressure,
    };
  } catch (error) {
    console.error("Smart-lab news fetch error:", error);
    return null;
  }
}

/**
 * Compute rhetoric pressure score from text
 * Returns a value between -1 (very negative) and 1 (very positive)
 */
export function computeRhetoricalPressure(texts: string[]): number {
  const positiveKeywords = [
    "рост",
    "прибыль",
    "успех",
    "хороший",
    "отличный",
    "повышение",
    "улучшение",
    "восстановление",
  ];
  const negativeKeywords = [
    "падение",
    "убыток",
    "проблема",
    "плохой",
    "снижение",
    "риск",
    "угроза",
    "кризис",
  ];

  let positiveScore = 0;
  let negativeScore = 0;

  texts.forEach((text) => {
    const lower = text.toLowerCase();
    positiveKeywords.forEach((kw) => {
      const matches = (lower.match(new RegExp(kw, "g")) || []).length;
      positiveScore += matches;
    });
    negativeKeywords.forEach((kw) => {
      const matches = (lower.match(new RegExp(kw, "g")) || []).length;
      negativeScore += matches;
    });
  });

  const total = positiveScore + negativeScore;
  if (total === 0) return 0;

  return (positiveScore - negativeScore) / total;
}
