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

  // Extract images (URLs ending with image extensions or markdown images)
  const imageUrls: string[] = [];
  
  // Match markdown images: ![alt](url)
  const mdImageMatches = Array.from(text.matchAll(/!\[.*?\]\((https?:\/\/[^\)]+)\)/g));
  for (const match of mdImageMatches) {
    imageUrls.push(match[1]);
  }
  
  // Match direct image URLs
  const urlMatches = Array.from(text.matchAll(/https?:\/\/[^\s<>"]+?\.(?:jpg|jpeg|png|gif|webp|svg)/gi));
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
    const match = text.match(pattern);
    if (match) {
      result.company = match[1].trim();
      break;
    }
  }

  const tickerPatterns = [
    /(?:Тикер|Ticker|Код):\s*([A-Z]{4,})/i,
    /\(([A-Z]{4,})\)/,  // Ticker in parentheses
  ];
  
  for (const pattern of tickerPatterns) {
    const match = text.match(pattern);
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
    const match = text.match(pattern);
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
    const match = text.match(pattern);
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
    const match = text.match(pattern);
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
    const match = text.match(pattern);
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
      const match = text.match(pattern);
      if (match) {
        indices[key] = parseFloat(match[1]);
        hasAnyIndex = true;
        break;
      }
    }
  }

  // Always set indices with defaults to ensure visualization stability
  result.indices = {
    iFund: indices.iFund ?? 0.5,
    iMarketGap: indices.iMarketGap ?? 0.5,
    iStruct: indices.iStruct ?? 0.5,
    iVola: indices.iVola ?? 0.5,
  };

  // Try to extract weak signals (multiple patterns)
  const signalPatterns = [
    /(?:Слабые сигналы|Weak signals):\s*([^\n]+(?:\n[-•]\s*[^\n]+)*)/i,
    /(?:Сигналы|Signals):\s*([^\n]+(?:\n[-•]\s*[^\n]+)*)/i,
  ];
  
  for (const pattern of signalPatterns) {
    const match = text.match(pattern);
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
    const match = text.match(pattern);
    if (match) {
      result.rhetoricalPressure = parseFloat(match[1]);
      break;
    }
  }

  // Set default values for missing critical fields
  if (!result.sIndex && hasAnyIndex) {
    result.sIndex = 0.5;
  }
  if (!result.velocity && hasAnyIndex) {
    result.velocity = 0;
  }
  if (!result.acceleration && hasAnyIndex) {
    result.acceleration = 0;
  }
  if (!result.phase && hasAnyIndex) {
    result.phase = "Анализ";
  }
  if (!result.signals || result.signals.length === 0) {
    result.signals = [];
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
