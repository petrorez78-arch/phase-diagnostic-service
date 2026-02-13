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
  rawText: string;
}

export function parseResponse(text: string): ParsedResponse {
  const result: ParsedResponse = {
    type: "chat",
    rawText: text,
  };

  // Try to extract company/ticker
  const companyMatch = text.match(/(?:Компания|Company):\s*([^\n]+)/i);
  if (companyMatch) result.company = companyMatch[1].trim();

  const tickerMatch = text.match(/(?:Тикер|Ticker):\s*([A-Z]{4,})/i);
  if (tickerMatch) result.ticker = tickerMatch[1].trim();

  // Try to extract phase
  const phaseMatch = text.match(/(?:Фаза|Phase):\s*([^\n]+)/i);
  if (phaseMatch) result.phase = phaseMatch[1].trim();

  // Try to extract S-index, velocity, acceleration
  const sIndexMatch = text.match(/S[-\s]?(?:индекс|index):\s*([-\d.]+)/i);
  if (sIndexMatch) result.sIndex = parseFloat(sIndexMatch[1]);

  const velocityMatch = text.match(/(?:Скорость|Velocity|vS):\s*([-\d.]+)/i);
  if (velocityMatch) result.velocity = parseFloat(velocityMatch[1]);

  const accelMatch = text.match(/(?:Ускорение|Acceleration|aS):\s*([-\d.]+)/i);
  if (accelMatch) result.acceleration = parseFloat(accelMatch[1]);

  // Try to extract indices
  const iFundMatch = text.match(/IFund:\s*([-\d.]+)/i);
  const iMarketGapMatch = text.match(/IMarketGap:\s*([-\d.]+)/i);
  const iStructMatch = text.match(/IStruct:\s*([-\d.]+)/i);
  const iVolaMatch = text.match(/IVola:\s*([-\d.]+)/i);

  if (iFundMatch || iMarketGapMatch || iStructMatch || iVolaMatch) {
    result.indices = {
      iFund: iFundMatch ? parseFloat(iFundMatch[1]) : undefined,
      iMarketGap: iMarketGapMatch ? parseFloat(iMarketGapMatch[1]) : undefined,
      iStruct: iStructMatch ? parseFloat(iStructMatch[1]) : undefined,
      iVola: iVolaMatch ? parseFloat(iVolaMatch[1]) : undefined,
    };
  }

  // Try to extract weak signals
  const signalsMatch = text.match(/(?:Слабые сигналы|Weak signals):\s*([^\n]+(?:\n-[^\n]+)*)/i);
  if (signalsMatch) {
    result.signals = signalsMatch[1]
      .split(/\n-/)
      .map((s) => s.trim().replace(/^-\s*/, ""))
      .filter((s) => s.length > 0);
  }

  // Try to extract rhetorical pressure
  const rhPressureMatch = text.match(/(?:Риторическое давление|Rhetorical pressure):\s*([-\d.]+)/i);
  if (rhPressureMatch) result.rhetoricalPressure = parseFloat(rhPressureMatch[1]);

  // Determine type
  if (result.phase && result.indices) {
    result.type = "analysis";
  } else if (result.company || result.ticker) {
    result.type = "search";
  }

  return result;
}

export function hasStructuredData(parsed: ParsedResponse): boolean {
  return !!(parsed.phase || parsed.indices || parsed.signals);
}
