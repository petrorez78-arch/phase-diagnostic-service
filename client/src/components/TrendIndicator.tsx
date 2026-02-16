import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface Props {
  value: number;
  label: string;
  threshold?: { low: number; high: number };
}

export default function TrendIndicator({ value, label, threshold = { low: 30, high: 70 } }: Props) {
  const getTrend = () => {
    if (value > threshold.high) return "up";
    if (value < threshold.low) return "down";
    return "neutral";
  };

  const getColor = () => {
    const trend = getTrend();
    if (trend === "up") return "oklch(0.72 0.19 155)"; // green
    if (trend === "down") return "oklch(0.65 0.25 25)"; // red
    return "oklch(0.70 0.01 260)"; // neutral
  };

  const getIcon = () => {
    const trend = getTrend();
    if (trend === "up") return <TrendingUp className="w-5 h-5" />;
    if (trend === "down") return <TrendingDown className="w-5 h-5" />;
    return <Minus className="w-5 h-5" />;
  };

  const color = getColor();

  return (
    <div className="flex items-center gap-3">
      <div
        className="w-12 h-12 rounded-xl flex items-center justify-center"
        style={{ backgroundColor: `${color}15` }}
      >
        <div style={{ color }}>{getIcon()}</div>
      </div>
      <div>
        <p className="text-2xl font-bold text-foreground">{value.toFixed(1)}</p>
        <p className="text-xs text-muted-foreground uppercase tracking-wide">{label}</p>
      </div>
    </div>
  );
}
