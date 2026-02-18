import { LucideIcon } from "lucide-react";

interface Props {
  icon: LucideIcon;
  label: string;
  value: string | number;
  trend?: "up" | "down" | "neutral";
  trendValue?: string;
  color?: string;
}

export default function MetricCard({
  icon: Icon,
  label,
  value,
  trend,
  trendValue,
  color = "oklch(0.68 0.16 250)",
}: Props) {
  const trendColors = {
    up: "text-fin-green",
    down: "text-fin-red",
    neutral: "text-muted-foreground",
  };

  const trendIcons = {
    up: "↗",
    down: "↘",
    neutral: "→",
  };

  return (
    <div className="rounded-xl border border-border/50 bg-card p-4 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/10 transition-all duration-300 group">
      <div className="flex items-start justify-between mb-3">
        <div
          className="w-10 h-10 rounded-lg flex items-center justify-center transition-transform duration-300 group-hover:scale-110"
          style={{ backgroundColor: `${color}15` }}
        >
          <Icon className="w-5 h-5 transition-transform duration-300 group-hover:rotate-12" style={{ color }} />
        </div>
        {trend && (
          <span className={`text-sm font-medium ${trendColors[trend]}`}>
            {trendIcons[trend]} {trendValue}
          </span>
        )}
      </div>
      <div className="space-y-1">
        <p className="text-2xl font-bold text-foreground transition-all duration-500 animate-in fade-in slide-in-from-bottom-2">{value}</p>
        <p className="text-xs text-muted-foreground uppercase tracking-wide">{label}</p>
      </div>
    </div>
  );
}
