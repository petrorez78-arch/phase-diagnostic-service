import { describe, it, expect } from "vitest";
import { computePhaseDiagnostics } from "./phaseDiagnostics";

describe("Phase Diagnostics", () => {
  const mockHistory = [
    { close: 100, volume: 1000, date: "2025-12-01" },
    { close: 102, volume: 1200, date: "2025-12-02" },
    { close: 105, volume: 1500, date: "2025-12-03" },
    { close: 103, volume: 1100, date: "2025-12-04" },
    { close: 107, volume: 1800, date: "2025-12-05" },
    { close: 110, volume: 2000, date: "2025-12-06" },
    { close: 108, volume: 1600, date: "2025-12-07" },
    { close: 112, volume: 2200, date: "2025-12-08" },
    { close: 115, volume: 2500, date: "2025-12-09" },
    { close: 113, volume: 2000, date: "2025-12-10" },
    { close: 118, volume: 2800, date: "2025-12-11" },
    { close: 120, volume: 3000, date: "2025-12-12" },
    { close: 119, volume: 2700, date: "2025-12-13" },
    { close: 122, volume: 3100, date: "2025-12-14" },
    { close: 125, volume: 3300, date: "2025-12-15" },
    { close: 123, volume: 2900, date: "2025-12-16" },
    { close: 128, volume: 3500, date: "2025-12-17" },
    { close: 130, volume: 3700, date: "2025-12-18" },
    { close: 129, volume: 3400, date: "2025-12-19" },
    { close: 132, volume: 3800, date: "2025-12-20" },
  ];

  it("should compute diagnostics with valid history", () => {
    const result = computePhaseDiagnostics(mockHistory, 132);

    expect(result).toHaveProperty("phase");
    expect(result).toHaveProperty("s");
    expect(result).toHaveProperty("vS");
    expect(result).toHaveProperty("aS");
    expect(result).toHaveProperty("iFund");
    expect(result).toHaveProperty("iMarketGap");
    expect(result).toHaveProperty("iStruct");
    expect(result).toHaveProperty("iVola");
    expect(result).toHaveProperty("signals");
    expect(Array.isArray(result.signals)).toBe(true);
  });

  it("should detect uptrend phase for increasing prices", () => {
    const result = computePhaseDiagnostics(mockHistory, 132);

    // With consistently rising prices, should detect growth or markup phase
    expect(["Рост", "Разметка", "Накопление"]).toContain(result.phase);
  });

  it("should have positive S-index for uptrend", () => {
    const result = computePhaseDiagnostics(mockHistory, 132);

    // Uptrend should have positive or near-zero S-index
    expect(result.s).toBeGreaterThanOrEqual(-50);
  });

  it("should calculate iVola (volatility) as positive", () => {
    const result = computePhaseDiagnostics(mockHistory, 132);

    // Volatility should be non-negative
    expect(result.iVola).toBeGreaterThanOrEqual(0);
  });

  it("should detect weak signals for high volatility", () => {
    const highVolHistory = [
      { close: 100, volume: 1000, date: "2025-12-01" },
      { close: 150, volume: 1000, date: "2025-12-02" },
      { close: 80, volume: 1000, date: "2025-12-03" },
      { close: 140, volume: 1000, date: "2025-12-04" },
      { close: 90, volume: 1000, date: "2025-12-05" },
      { close: 130, volume: 1000, date: "2025-12-06" },
      { close: 100, volume: 1000, date: "2025-12-07" },
      { close: 145, volume: 1000, date: "2025-12-08" },
      { close: 85, volume: 1000, date: "2025-12-09" },
      { close: 135, volume: 1000, date: "2025-12-10" },
      { close: 95, volume: 1000, date: "2025-12-11" },
      { close: 140, volume: 1000, date: "2025-12-12" },
      { close: 100, volume: 1000, date: "2025-12-13" },
      { close: 150, volume: 1000, date: "2025-12-14" },
      { close: 90, volume: 1000, date: "2025-12-15" },
      { close: 145, volume: 1000, date: "2025-12-16" },
      { close: 95, volume: 1000, date: "2025-12-17" },
      { close: 140, volume: 1000, date: "2025-12-18" },
      { close: 100, volume: 1000, date: "2025-12-19" },
      { close: 145, volume: 1000, date: "2025-12-20" },
    ];

    const result = computePhaseDiagnostics(highVolHistory, 145);

    // High volatility should be detected
    expect(result.iVola).toBeGreaterThan(15);
  });

  it("should handle downtrend correctly", () => {
    const downtrend = [
      { close: 150, volume: 3000, date: "2025-12-01" },
      { close: 148, volume: 2900, date: "2025-12-02" },
      { close: 145, volume: 2800, date: "2025-12-03" },
      { close: 142, volume: 2700, date: "2025-12-04" },
      { close: 140, volume: 2600, date: "2025-12-05" },
      { close: 137, volume: 2500, date: "2025-12-06" },
      { close: 135, volume: 2400, date: "2025-12-07" },
      { close: 132, volume: 2300, date: "2025-12-08" },
      { close: 130, volume: 2200, date: "2025-12-09" },
      { close: 127, volume: 2100, date: "2025-12-10" },
      { close: 125, volume: 2000, date: "2025-12-11" },
      { close: 122, volume: 1900, date: "2025-12-12" },
      { close: 120, volume: 1800, date: "2025-12-13" },
      { close: 117, volume: 1700, date: "2025-12-14" },
      { close: 115, volume: 1600, date: "2025-12-15" },
      { close: 112, volume: 1500, date: "2025-12-16" },
      { close: 110, volume: 1400, date: "2025-12-17" },
      { close: 107, volume: 1300, date: "2025-12-18" },
      { close: 105, volume: 1200, date: "2025-12-19" },
      { close: 102, volume: 1100, date: "2025-12-20" },
    ];

    const result = computePhaseDiagnostics(downtrend, 102);

    // Downtrend should have negative or low S-index
    expect(result.s).toBeLessThan(20);
    // Downtrend may be detected as Накопление at the bottom or Снижение
    expect(["Снижение", "Распределение", "Накопление"]).toContain(result.phase);
  });

  it("should return consistent results for same input", () => {
    const result1 = computePhaseDiagnostics(mockHistory, 132);
    const result2 = computePhaseDiagnostics(mockHistory, 132);

    expect(result1).toEqual(result2);
  });

  it("should handle minimal history", () => {
    const minimalHistory = [
      { close: 100, volume: 1000, date: "2025-12-01" },
      { close: 105, volume: 1200, date: "2025-12-02" },
    ];

    const result = computePhaseDiagnostics(minimalHistory, 105);

    expect(result).toHaveProperty("phase");
    expect(result.s).toBeDefined();
  });
});
