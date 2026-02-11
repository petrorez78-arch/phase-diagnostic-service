/**
 * Phase Diagnostic Engine
 * Implements the phase diagnostic methodology for stock analysis
 */

interface HistoryRecord {
  close: number;
  volume: number;
  date: string;
}

interface DiagnosticResult {
  phase: string;
  s: number;
  vS: number;
  aS: number;
  iFund: number;
  iMarketGap: number;
  iStruct: number;
  iVola: number;
  signals: string[];
}

/**
 * Calculate S-index (main phase indicator)
 * Based on price momentum and volume analysis
 */
function calculateSIndex(history: HistoryRecord[]): number {
  if (history.length < 2) return 0;

  let sIndex = 0;
  const recent = history.slice(-20); // Use last 20 days

  for (let i = 1; i < recent.length; i++) {
    const prev = recent[i - 1];
    const curr = recent[i];
    const priceChange = (curr.close - prev.close) / prev.close;
    const volumeRatio = curr.volume / (prev.volume || 1);

    // S increases with positive price changes and volume
    if (priceChange > 0) {
      sIndex += Math.round(priceChange * 100 * Math.min(volumeRatio, 2));
    } else {
      sIndex += Math.round(priceChange * 100 * Math.min(volumeRatio, 2));
    }
  }

  return Math.round(sIndex / recent.length);
}

/**
 * Calculate velocity of S (vS)
 * Rate of change of S-index
 */
function calculateVelocity(history: HistoryRecord[]): number {
  if (history.length < 10) return 0;

  const recent = history.slice(-10);
  const sValues: number[] = [];

  for (let i = 0; i < recent.length; i++) {
    const slice = history.slice(Math.max(0, history.length - 20 - i), history.length - i);
    sValues.push(calculateSIndex(slice));
  }

  // Calculate rate of change
  let vS = 0;
  for (let i = 1; i < sValues.length; i++) {
    vS += sValues[i] - sValues[i - 1];
  }

  return Math.round(vS / (sValues.length - 1));
}

/**
 * Calculate acceleration of S (aS)
 * Rate of change of velocity
 */
function calculateAcceleration(history: HistoryRecord[]): number {
  if (history.length < 15) return 0;

  const vValues: number[] = [];

  for (let i = 0; i < 5; i++) {
    const slice = history.slice(Math.max(0, history.length - 25 - i * 5), history.length - i * 5);
    vValues.push(calculateVelocity(slice));
  }

  // Calculate rate of change of velocity
  let aS = 0;
  for (let i = 1; i < vValues.length; i++) {
    aS += vValues[i] - vValues[i - 1];
  }

  return Math.round(aS / (vValues.length - 1));
}

/**
 * Calculate IFund (Fundamental Index)
 * Based on price-to-volume ratio and trading activity
 */
function calculateIFund(history: HistoryRecord[], lastPrice: number): number {
  if (history.length === 0) return 0;

  const avgVolume =
    history.reduce((sum, r) => sum + r.volume, 0) / history.length;
  const avgPrice =
    history.reduce((sum, r) => sum + r.close, 0) / history.length;

  const volumeRatio = (history[history.length - 1].volume || 1) / (avgVolume || 1);
  const priceRatio = lastPrice / (avgPrice || 1);

  return Math.round((priceRatio * volumeRatio - 1) * 100);
}

/**
 * Calculate IMarketGap (Market Gap Index)
 * Based on high-low range and close position
 */
function calculateIMarketGap(history: HistoryRecord[]): number {
  if (history.length === 0) return 0;

  let totalGap = 0;
  const recent = history.slice(-10);

  for (const record of recent) {
    // Estimate high-low from close (simplified)
    const volatility = record.close * 0.02; // Assume 2% volatility
    const high = record.close + volatility;
    const low = record.close - volatility;

    const range = high - low;
    const closePosition = (record.close - low) / (range || 1);
    const gap = Math.abs(closePosition - 0.5) * 100;

    totalGap += gap;
  }

  return Math.round(totalGap / recent.length);
}

/**
 * Calculate IStruct (Structure Index)
 * Based on price trend and consistency
 */
function calculateIStruct(history: HistoryRecord[]): number {
  if (history.length < 2) return 0;

  let upDays = 0;
  let downDays = 0;
  const recent = history.slice(-20);

  for (let i = 1; i < recent.length; i++) {
    if (recent[i].close > recent[i - 1].close) {
      upDays++;
    } else {
      downDays++;
    }
  }

  const trendStrength = Math.abs(upDays - downDays) / recent.length;
  return Math.round(trendStrength * 100);
}

/**
 * Calculate IVola (Volatility Index)
 * Based on price variance
 */
function calculateIVola(history: HistoryRecord[]): number {
  if (history.length < 2) return 0;

  const recent = history.slice(-20);
  const avgPrice =
    recent.reduce((sum, r) => sum + r.close, 0) / recent.length;

  let variance = 0;
  for (const record of recent) {
    variance += Math.pow(record.close - avgPrice, 2);
  }

  const stdDev = Math.sqrt(variance / recent.length);
  const volatility = (stdDev / avgPrice) * 100;

  return Math.round(volatility);
}

/**
 * Detect phase based on S-index and indicators
 */
function detectPhase(s: number, vS: number, aS: number): string {
  // Phase classification based on S-index value and dynamics
  if (s < -50) {
    return "Распределение"; // Distribution
  } else if (s < -10) {
    return "Снижение"; // Downtrend
  } else if (s < 10) {
    return "Накопление"; // Accumulation
  } else if (s < 50) {
    return "Рост"; // Uptrend
  } else {
    return "Разметка"; // Markup
  }
}

/**
 * Detect weak signals based on index thresholds
 */
function detectWeakSignals(
  s: number,
  vS: number,
  aS: number,
  iFund: number,
  iMarketGap: number,
  iStruct: number,
  iVola: number
): string[] {
  const signals: string[] = [];

  // Weak signal detection logic
  if (Math.abs(vS) < 5 && Math.abs(s) > 20) {
    signals.push("Замедление динамики при сохранении тренда");
  }

  if (aS < -10 && vS > 0) {
    signals.push("Снижение ускорения роста");
  }

  if (iFund < -20) {
    signals.push("Слабый фундамент - низкий объем торговли");
  }

  if (iMarketGap > 40) {
    signals.push("Высокий разброс цены в диапазоне");
  }

  if (iStruct < 30 && Math.abs(s) > 30) {
    signals.push("Неустойчивый тренд - низкая консистентность");
  }

  if (iVola > 50) {
    signals.push("Высокая волатильность - повышенный риск");
  }

  if (s > 0 && vS < 0) {
    signals.push("Потеря импульса роста");
  }

  if (s < 0 && vS > 0) {
    signals.push("Признаки восстановления после падения");
  }

  return signals;
}

/**
 * Main diagnostic function
 */
export function computePhaseDiagnostics(
  history: HistoryRecord[],
  lastPrice: number
): DiagnosticResult {
  // Calculate all indices
  const s = calculateSIndex(history);
  const vS = calculateVelocity(history);
  const aS = calculateAcceleration(history);
  const iFund = calculateIFund(history, lastPrice);
  const iMarketGap = calculateIMarketGap(history);
  const iStruct = calculateIStruct(history);
  const iVola = calculateIVola(history);

  // Detect phase and signals
  const phase = detectPhase(s, vS, aS);
  const signals = detectWeakSignals(s, vS, aS, iFund, iMarketGap, iStruct, iVola);

  return {
    phase,
    s,
    vS,
    aS,
    iFund,
    iMarketGap,
    iStruct,
    iVola,
    signals,
  };
}
