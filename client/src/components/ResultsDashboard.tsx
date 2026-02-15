import { parseResponse, hasStructuredData, type ParsedResponse } from "@/lib/responseParser";
import GaugeChart from "./GaugeChart";
import PhaseIndicator from "./PhaseIndicator";
import SignalCard from "./SignalCard";
import { Streamdown } from "streamdown";
import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
} from "recharts";
import { Activity, BarChart3, Brain, Shield, TrendingUp } from "lucide-react";

interface Props {
  data: any;
}

const INDEX_COLORS: Record<string, string> = {
  IFund: "#4ade80",
  IMarketGap: "#60a5fa",
  IStruct: "#c084fc",
  IVola: "#fbbf24",
};

const INDEX_LABELS: Record<string, string> = {
  IFund: "Фундаментальный",
  IMarketGap: "Рыночный разрыв",
  IStruct: "Структурный",
  IVola: "Волатильность",
};

export default function ResultsDashboard({ data }: Props) {
  // Parse the response - could be text from n8n or structured data
  const message = typeof data === "string"
    ? data
    : data?.message || data?.data?.message || data?.data || JSON.stringify(data);

  const textContent = typeof message === "string" ? message : JSON.stringify(message);
  const parsed: ParsedResponse = parseResponse(textContent);
  const hasData = hasStructuredData(parsed);

  // Prepare radar chart data
  const radarData = parsed.indices
    ? [
        { subject: "IFund", value: parsed.indices.iFund ?? 0, fullMark: 100 },
        { subject: "IMarketGap", value: parsed.indices.iMarketGap ?? 0, fullMark: 100 },
        { subject: "IStruct", value: parsed.indices.iStruct ?? 0, fullMark: 100 },
        { subject: "IVola", value: parsed.indices.iVola ?? 0, fullMark: 100 },
      ]
    : [];

  // Prepare bar chart data
  const barData = parsed.indices
    ? Object.entries(parsed.indices)
        .filter(([, v]) => v !== undefined)
        .map(([key, value]) => ({
          name: key,
          value: value ?? 0,
          label: INDEX_LABELS[key] || key,
        }))
    : [];

  return (
    <div className="space-y-4">
      {/* Company header if available */}
      {(parsed.company || parsed.ticker) && (
        <div className="rounded-xl border border-border/50 bg-card p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/15 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-primary" />
            </div>
            <div>
              {parsed.company && (
                <h2 className="text-lg font-bold text-foreground">{parsed.company}</h2>
              )}
              {parsed.ticker && (
                <span className="text-sm font-mono text-muted-foreground">{parsed.ticker}</span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Phase Indicator */}
      {hasData && parsed.phase && (
        <div className="rounded-xl border border-border/50 bg-card p-5">
          <div className="flex items-center gap-2 mb-4">
            <Activity className="w-4 h-4 text-primary" />
            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Фазовая диагностика
            </h3>
          </div>
          <PhaseIndicator
            phase={parsed.phase}
            sIndex={parsed.sIndex ?? 0}
            velocity={parsed.velocity ?? 0}
            acceleration={parsed.acceleration ?? 0}
          />
        </div>
      )}

      {/* Indices Gauges */}
      {barData.length > 0 && (
        <div className="rounded-xl border border-border/50 bg-card p-5">
          <div className="flex items-center gap-2 mb-5">
            <BarChart3 className="w-4 h-4 text-primary" />
            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Индексы
            </h3>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {barData.map((item) => (
              <GaugeChart
                key={item.name}
                value={item.value}
                max={100}
                min={0}
                label={item.name}
                sublabel={item.label}
                color={INDEX_COLORS[item.name] || "oklch(0.68 0.16 250)"}
              />
            ))}
          </div>
        </div>
      )}

      {/* Radar Chart */}
      {radarData.length >= 3 && (
        <div className="rounded-xl border border-border/50 bg-card p-5">
          <div className="flex items-center gap-2 mb-4">
            <Shield className="w-4 h-4 text-primary" />
            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Профиль индексов
            </h3>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <RadarChart data={radarData} cx="50%" cy="50%" outerRadius="75%">
              <PolarGrid stroke="oklch(0.30 0.02 260)" />
              <PolarAngleAxis
                dataKey="subject"
                tick={{ fill: "oklch(0.70 0.01 260)", fontSize: 12 }}
              />
              <PolarRadiusAxis
                angle={30}
                domain={[0, 100]}
                tick={{ fill: "oklch(0.50 0.01 260)", fontSize: 10 }}
              />
              <Radar
                name="Индексы"
                dataKey="value"
                stroke="oklch(0.68 0.16 250)"
                fill="oklch(0.68 0.16 250)"
                fillOpacity={0.2}
                strokeWidth={2}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Bar Chart for indices */}
      {barData.length > 0 && (
        <div className="rounded-xl border border-border/50 bg-card p-5">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="w-4 h-4 text-primary" />
            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Значения индексов
            </h3>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={barData} barSize={40}>
              <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.25 0.015 260)" />
              <XAxis
                dataKey="name"
                tick={{ fill: "oklch(0.70 0.01 260)", fontSize: 12 }}
                axisLine={{ stroke: "oklch(0.30 0.02 260)" }}
              />
              <YAxis
                domain={[0, 100]}
                tick={{ fill: "oklch(0.50 0.01 260)", fontSize: 11 }}
                axisLine={{ stroke: "oklch(0.30 0.02 260)" }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "oklch(0.17 0.02 260)",
                  border: "1px solid oklch(0.30 0.02 260)",
                  borderRadius: "8px",
                  color: "oklch(0.93 0.005 260)",
                }}
              />
              <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                {barData.map((entry) => (
                  <Cell
                    key={entry.name}
                    fill={INDEX_COLORS[entry.name] || "#60a5fa"}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Weak Signals */}
      {parsed.signals && parsed.signals.length > 0 && (
        <div className="rounded-xl border border-border/50 bg-card p-5">
          <div className="flex items-center gap-2 mb-4">
            <Activity className="w-4 h-4" style={{ color: "oklch(0.78 0.16 75)" }} />
            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Слабые сигналы
            </h3>
          </div>
          <SignalCard signals={parsed.signals} />
        </div>
      )}

      {/* Rhetorical Pressure */}
      {parsed.rhetoricalPressure !== undefined && (
        <div className="rounded-xl border border-border/50 bg-card p-5">
          <div className="flex items-center gap-2 mb-4">
            <Brain className="w-4 h-4 text-primary" />
            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Риторическое давление
            </h3>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className="h-3 rounded-full bg-secondary overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-1000"
                  style={{
                    width: `${Math.min(100, Math.abs(parsed.rhetoricalPressure))}%`,
                    backgroundColor:
                      parsed.rhetoricalPressure > 0
                        ? "oklch(0.72 0.19 155)"
                        : "oklch(0.65 0.22 25)",
                  }}
                />
              </div>
              <div className="flex justify-between mt-1.5">
                <span className="text-xs text-muted-foreground">Негативное</span>
                <span className="text-xs text-muted-foreground">Позитивное</span>
              </div>
            </div>
            <div
              className="text-2xl font-bold font-mono"
              style={{
                color:
                  parsed.rhetoricalPressure > 0
                    ? "oklch(0.72 0.19 155)"
                    : "oklch(0.65 0.22 25)",
              }}
            >
              {parsed.rhetoricalPressure > 0 ? "+" : ""}
              {parsed.rhetoricalPressure.toFixed(1)}
            </div>
          </div>
        </div>
      )}

      {/* Images */}
      {parsed.images && parsed.images.length > 0 && (
        <div className="rounded-xl border border-border/50 bg-card p-5">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-4 h-4 text-primary" />
            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Визуализация
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {parsed.images.map((url, idx) => (
              <div key={idx} className="rounded-lg overflow-hidden border border-border/30">
                <img
                  src={url}
                  alt={`Визуализация ${idx + 1}`}
                  className="w-full h-auto object-contain bg-secondary/20"
                  loading="lazy"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* AI Text Response */}
      <div className="rounded-xl border border-border/50 bg-card p-5">
        <div className="flex items-center gap-2 mb-4">
          <Brain className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            AI Интерпретация
          </h3>
        </div>
        <div className="prose prose-invert prose-sm max-w-none text-foreground/90 leading-relaxed">
          <Streamdown>{textContent}</Streamdown>
        </div>
      </div>
    </div>
  );
}
