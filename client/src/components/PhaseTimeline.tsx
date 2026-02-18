import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface PhasePoint {
  date: string;
  phase: string;
  sIndex: number;
  velocity: number;
}

interface Props {
  history: PhasePoint[];
}

const PHASE_COLORS: Record<string, string> = {
  "Фаза 1": "oklch(0.72 0.19 155)", // green
  "Фаза 2": "oklch(0.75 0.18 85)", // yellow
  "Фаза 3": "oklch(0.78 0.16 75)", // orange
  "Фаза 4": "oklch(0.65 0.22 25)", // red
  "Неопределенная": "oklch(0.50 0.01 260)", // gray
};

export default function PhaseTimeline({ history }: Props) {
  if (!history || history.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>История фаз недоступна</p>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Timeline line */}
      <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-border" />

      {/* Timeline points */}
      <div className="space-y-6">
        {history.map((point, idx) => {
          const color = PHASE_COLORS[point.phase] || PHASE_COLORS["Неопределенная"];
          const isLatest = idx === history.length - 1;
          const velocityTrend = point.velocity > 0 ? "up" : point.velocity < 0 ? "down" : "neutral";

          return (
            <div
              key={idx}
              className={`relative flex items-start gap-4 group ${
                isLatest ? "animate-in fade-in slide-in-from-left-4 duration-500" : ""
              }`}
            >
              {/* Timeline dot */}
              <div
                className={`relative z-10 w-16 h-16 rounded-full border-4 flex items-center justify-center transition-all duration-300 ${
                  isLatest
                    ? "border-primary bg-primary/20 group-hover:scale-110"
                    : "border-border bg-card group-hover:scale-105"
                }`}
                style={
                  isLatest
                    ? { borderColor: color, backgroundColor: `${color}20` }
                    : undefined
                }
              >
                {velocityTrend === "up" && (
                  <TrendingUp className="w-6 h-6" style={{ color }} />
                )}
                {velocityTrend === "down" && (
                  <TrendingDown className="w-6 h-6" style={{ color }} />
                )}
                {velocityTrend === "neutral" && (
                  <Minus className="w-6 h-6" style={{ color }} />
                )}
              </div>

              {/* Content card */}
              <div
                className={`flex-1 rounded-lg border p-4 transition-all duration-300 ${
                  isLatest
                    ? "border-primary/50 bg-card shadow-lg shadow-primary/10 group-hover:shadow-xl"
                    : "border-border/50 bg-card/50 group-hover:border-primary/30 group-hover:shadow-md"
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h4
                      className="text-sm font-semibold"
                      style={{ color: isLatest ? color : "inherit" }}
                    >
                      {point.phase}
                    </h4>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {new Date(point.date).toLocaleDateString("ru-RU", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                  {isLatest && (
                    <span
                      className="px-2 py-1 rounded text-xs font-medium"
                      style={{
                        backgroundColor: `${color}20`,
                        color,
                      }}
                    >
                      Текущая
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3 mt-3">
                  <div>
                    <p className="text-xs text-muted-foreground">S-индекс</p>
                    <p className="text-lg font-bold font-mono text-foreground">
                      {point.sIndex.toFixed(2)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Скорость</p>
                    <p
                      className="text-lg font-bold font-mono flex items-center gap-1"
                      style={{
                        color:
                          point.velocity > 0
                            ? "oklch(0.72 0.19 155)"
                            : point.velocity < 0
                            ? "oklch(0.65 0.22 25)"
                            : "oklch(0.50 0.01 260)",
                      }}
                    >
                      {point.velocity > 0 ? "+" : ""}
                      {point.velocity.toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
