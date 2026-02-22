export interface ParsedResponse {
  type: "search" | "analysis" | "chat";
  company?: string;
  ticker?: string;
  phase?: string;
  sIndex?: number;
  velocity?: number;
  acceleration?: number;
  indices?: {
    iFund?: number;
    iMarketGap?: number;
    iStruct?: number;
    iVola?: number;
  };
  signals?: string[];
  rhetoricalPressure?: number;
  images?: string[]; // URLs of images found in response
  rawText: string;
}

/**
 * Enhanced parser that extracts structured data from n8n text responses
 * Supports multiple formats and patterns
 */
export function parseResponse(text: string): ParsedResponse {
  const result: ParsedResponse = {
    type: "chat",
    rawText: text,
  };

  // First, try to extract JSON from the message field if response is wrapped
  let contentToAnalyze = text;
  try {
    const wrapped = JSON.parse(text);
    if (wrapped.message) {
      contentToAnalyze = wrapped.message;
    }
  } catch {
    // Not wrapped, use original text
  }

  // Try to parse the content as JSON
  let jsonData: any = null;
  try {
    jsonData = JSON.parse(contentToAnalyze);
  } catch {
    // Not JSON, continue with text parsing
  }

  // If we have JSON data, extract structured fields
  if (jsonData && typeof jsonData === 'object') {
    // Extract company and ticker
    if (jsonData.Компания || jsonData.Company) {
      result.company = jsonData.Компания || jsonData.Company;
    }
    if (jsonData.Тикер || jsonData.Ticker) {
      result.ticker = jsonData.Тикер || jsonData.Ticker;
    }

    // Extract phase
    if (jsonData.Фаза || jsonData.Phase) {
      result.phase = jsonData.Фаза || jsonData.Phase;
    }

    // Extract indices from various possible locations
    const indices: any = {};
    let hasAnyJsonIndex = false;

    // Check for "Ключевые показатели" (Key indicators) object
    const keyIndicators = jsonData["Ключевые показатели"] || jsonData["Key indicators"];
    if (keyIndicators && typeof keyIndicators === 'object') {
      // Parse string values like "0.215 — description"
      if (keyIndicators["IFund (Фундаментальный индекс)"] || keyIndicators.IFund) {
        const val = extractNumericValue(keyIndicators["IFund (Фундаментальный индекс)"] || keyIndicators.IFund);
        if (val !== null) {
          indices.iFund = val;
          hasAnyJsonIndex = true;
        }
      }
      if (keyIndicators["IMarketGap (Индекс рыночного разрыва)"] || keyIndicators.IMarketGap) {
        const val = extractNumericValue(keyIndicators["IMarketGap (Индекс рыночного разрыва)"] || keyIndicators.IMarketGap);
        if (val !== null) {
          indices.iMarketGap = val;
          hasAnyJsonIndex = true;
        }
      }
      if (keyIndicators["IStruct (Структурный индекс)"] || keyIndicators.IStruct) {
        const val = extractNumericValue(keyIndicators["IStruct (Структурный индекс)"] || keyIndicators.IStruct);
        if (val !== null) {
          indices.iStruct = val;
          hasAnyJsonIndex = true;
        }
      }
      if (keyIndicators["IVola (Волатильность)"] || keyIndicators.IVola) {
        const val = extractNumericValue(keyIndicators["IVola (Волатильность)"] || keyIndicators.IVola);
        if (val !== null) {
          indices.iVola = val;
          hasAnyJsonIndex = true;
        }
      }
    }

    // Check for direct index fields
    if (jsonData.IFund !== undefined || jsonData.iFund !== undefined) {
      const val = parseFloat(jsonData.IFund || jsonData.iFund);
      if (!isNaN(val)) {
        indices.iFund = val;
        hasAnyJsonIndex = true;
      }
    }
    if (jsonData.IMarketGap !== undefined || jsonData.iMarketGap !== undefined) {
      const val = parseFloat(jsonData.IMarketGap || jsonData.iMarketGap);
      if (!isNaN(val)) {
        indices.iMarketGap = val;
        hasAnyJsonIndex = true;
      }
    }
    if (jsonData.IStruct !== undefined || jsonData.iStruct !== undefined) {
      const val = parseFloat(jsonData.IStruct || jsonData.iStruct);
      if (!isNaN(val)) {
        indices.iStruct = val;
        hasAnyJsonIndex = true;
      }
    }
    if (jsonData.IVola !== undefined || jsonData.iVola !== undefined) {
      const val = parseFloat(jsonData.IVola || jsonData.iVola);
      if (!isNaN(val)) {
        indices.iVola = val;
        hasAnyJsonIndex = true;
      }
    }

    if (hasAnyJsonIndex) {
      result.indices = indices;
    }

    // Extract S-index, velocity, acceleration
    if (jsonData.S !== undefined) {
      const val = parseFloat(jsonData.S);
      if (!isNaN(val)) result.sIndex = val;
    }
    if (jsonData["S-индекс"] !== undefined) {
      const val = extractNumericValue(jsonData["S-индекс"]);
      if (val !== null) result.sIndex = val;
    }

    if (jsonData.vS !== undefined) {
      const val = parseFloat(jsonData.vS);
      if (!isNaN(val)) result.velocity = val;
    }
    if (jsonData["ΔS (Изменение S-индекса)"] !== undefined) {
      const val = extractNumericValue(jsonData["ΔS (Изменение S-индекса)"]);
      if (val !== null) result.velocity = val;
    }

    if (jsonData.aS !== undefined) {
      const val = parseFloat(jsonData.aS);
      if (!isNaN(val)) result.acceleration = val;
    }
    if (jsonData["aS (Ускорение изменения S-индекса)"] !== undefined) {
      const val = extractNumericValue(jsonData["aS (Ускорение изменения S-индекса)"]);
      if (val !== null) result.acceleration = val;
    }

    // Extract weak signals
    const signalsField = jsonData["Слабые сигналы"] || jsonData["Weak signals"] || jsonData.signals;
    if (Array.isArray(signalsField)) {
      result.signals = signalsField.map(s => String(s)).filter(s => s.length > 0);
    } else if (typeof signalsField === 'string') {
      result.signals = [signalsField];
    }

    // Extract rhetorical pressure
    if (jsonData["Риторическое давление"] !== undefined) {
      const val = extractNumericValue(jsonData["Риторическое давление"]);
      if (val !== null) result.rhetoricalPressure = val;
    }

    // If we found structured data, mark as analysis
    if (result.phase && (result.indices || hasAnyJsonIndex)) {
      result.type = "analysis";
    }

    // Return early if we successfully parsed JSON
    if (result.company || result.phase || hasAnyJsonIndex) {
      return result;
    }
  }

  // Extract images (URLs ending with image extensions or markdown images)
  const imageUrls: string[] = [];

  // Match markdown images: ![alt](url)
  const mdImageMatches = Array.from(contentToAnalyze.matchAll(/!\[.*?\]\((https?:\/\/[^\)]+)\)/g));
  for (const match of mdImageMatches) {
    imageUrls.push(match[1]);
  }

  // Match direct image URLs
  const urlMatches = Array.from(contentToAnalyze.matchAll(/https?:\/\/[^\s<>"]+?\.(?:jpg|jpeg|png|gif|webp|svg)/gi));
  for (const match of urlMatches) {
    imageUrls.push(match[0]);
  }

  if (imageUrls.length > 0) {
    result.images = Array.from(new Set(imageUrls)); // Remove duplicates
  }

  // Try to extract company/ticker (multiple patterns)
  const companyPatterns = [
    /(?:Компания|Company|Название):\s*([^\n]+)/i,
    /(?:^|\n)([А-ЯЁ][а-яё\s]+(?:ПАО|АО|ООО)?)\s*\(/m, // Russian company name before ticker
  ];

  for (const pattern of companyPatterns) {
    const match = contentToAnalyze.match(pattern);
    if (match) {
      result.company = match[1].trim();
      break;
    }
  }

  const tickerPatterns = [
    /(?:Тикер|Ticker|Код):\s*([A-Z]{4,})/i,
    /\(([A-Z]{4,})\)/, // Ticker in parentheses
  ];

  for (const pattern of tickerPatterns) {
    const match = contentToAnalyze.match(pattern);
    if (match) {
      result.ticker = match[1].trim();
      break;
    }
  }

  // Try to extract phase (multiple patterns)
  const phasePatterns = [
    /(?:Фаза|Phase):\s*([^\n]+)/i,
    /(?:Текущая фаза|Current phase):\s*([^\n]+)/i,
    /(?:Фаза развития|Development phase):\s*([^\n]+)/i,
  ];

  for (const pattern of phasePatterns) {
    const match = contentToAnalyze.match(pattern);
    if (match) {
      result.phase = match[1].trim();
      break;
    }
  }

  // Try to extract S-index, velocity, acceleration (multiple patterns)
  const sIndexPatterns = [
    /S[-\s]?(?:индекс|index):\s*([-\d.]+)/i,
    /S\s*=\s*([-\d.]+)/i,
  ];

  for (const pattern of sIndexPatterns) {
    const match = contentToAnalyze.match(pattern);
    if (match) {
      result.sIndex = parseFloat(match[1]);
      break;
    }
  }

  const velocityPatterns = [
    /(?:Скорость|Velocity|vS):\s*([-\d.]+)/i,
    /vS\s*=\s*([-\d.]+)/i,
  ];

  for (const pattern of velocityPatterns) {
    const match = contentToAnalyze.match(pattern);
    if (match) {
      result.velocity = parseFloat(match[1]);
      break;
    }
  }

  const accelPatterns = [
    /(?:Ускорение|Acceleration|aS):\s*([-\d.]+)/i,
    /aS\s*=\s*([-\d.]+)/i,
  ];

  for (const pattern of accelPatterns) {
    const match = contentToAnalyze.match(pattern);
    if (match) {
      result.acceleration = parseFloat(match[1]);
      break;
    }
  }

  // Try to extract indices (support multiple formats)
  const indexPatterns = {
    iFund: [
      /IFund:\s*([-\d.]+)/i,
      /(?:Фундаментальный индекс|Fundamental index):\s*([-\d.]+)/i,
      /IFund\s*=\s*([-\d.]+)/i,
    ],
    iMarketGap: [
      /IMarketGap:\s*([-\d.]+)/i,
      /(?:Рыночный разрыв|Market gap):\s*([-\d.]+)/i,
      /IMarketGap\s*=\s*([-\d.]+)/i,
    ],
    iStruct: [
      /IStruct:\s*([-\d.]+)/i,
      /(?:Структурный индекс|Structural index):\s*([-\d.]+)/i,
      /IStruct\s*=\s*([-\d.]+)/i,
    ],
    iVola: [
      /IVola:\s*([-\d.]+)/i,
      /(?:Волатильность|Volatility):\s*([-\d.]+)/i,
      /IVola\s*=\s*([-\d.]+)/i,
    ],
  };

  const indices: any = {};
  let hasAnyIndex = false;

  for (const [key, patterns] of Object.entries(indexPatterns)) {
    for (const pattern of patterns) {
      const match = contentToAnalyze.match(pattern);
      if (match) {
        indices[key] = parseFloat(match[1]);
        hasAnyIndex = true;
        break;
      }
    }
  }

  if (hasAnyIndex) {
    result.indices = indices;
  }

  // Try to extract weak signals (multiple patterns)
  const signalPatterns = [
    /(?:Слабые сигналы|Weak signals):\s*([^\n]+(?:\n[-•]\s*[^\n]+)*)/i,
    /(?:Сигналы|Signals):\s*([^\n]+(?:\n[-•]\s*[^\n]+)*)/i,
  ];

  for (const pattern of signalPatterns) {
    const match = contentToAnalyze.match(pattern);
    if (match) {
      result.signals = match[1]
        .split(/\n/)
        .map((s) => s.trim().replace(/^[-•]\s*/, ""))
        .filter((s) => s.length > 0 && !s.match(/^(?:Слабые сигналы|Weak signals|Сигналы|Signals):/i));
      break;
    }
  }

  // Try to extract rhetorical pressure (multiple patterns)
  const rhPressurePatterns = [
    /(?:Риторическое давление|Rhetorical pressure):\s*([-\d.]+)/i,
    /(?:Давление|Pressure):\s*([-\d.]+)/i,
  ];

  for (const pattern of rhPressurePatterns) {
    const match = contentToAnalyze.match(pattern);
    if (match) {
      result.rhetoricalPressure = parseFloat(match[1]);
      break;
    }
  }

  // Determine type based on extracted data
  if (result.phase && result.indices) {
    result.type = "analysis";
  } else if (result.company || result.ticker) {
    result.type = "search";
  }

  return result;
}

/**
 * Extract numeric value from string that may contain description
 * e.g., "0.215 — description" -> 0.215
 */
function extractNumericValue(str: string | number): number | null {
  if (typeof str === 'number') return str;
  if (typeof str !== 'string') return null;

  const match = str.match(/([-\d.]+)/);
  if (match) {
    const val = parseFloat(match[1]);
    return isNaN(val) ? null : val;
  }
  return null;
}

/**
 * Check if response has structured data that can be visualized
 */
export function hasStructuredData(parsed: ParsedResponse): boolean {
  return !!(
    parsed.phase ||
    parsed.indices ||
    parsed.signals ||
    parsed.images ||
    parsed.sIndex !== undefined ||
    parsed.velocity !== undefined ||
    parsed.acceleration !== undefined
  );
}

/**
 * Extract all numeric values from text for potential visualization
 */
export function extractNumericData(text: string): Record<string, number> {
  const result: Record<string, number> = {};

  // Match patterns like "Label: 123.45" or "Label = 123.45"
  const matches = Array.from(text.matchAll(/([А-ЯЁа-яёA-Za-z\s]+)[:=]\s*([-\d.]+)/g));

  for (const match of matches) {
    const label = match[1].trim();
    const value = parseFloat(match[2]);

    if (!isNaN(value) && label.length > 0) {
      result[label] = value;
    }
  }

  return result;
}
