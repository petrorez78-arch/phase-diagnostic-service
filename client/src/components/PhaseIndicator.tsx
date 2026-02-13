interface Props {
  phase: string;
  sIndex: number;
  velocity: number;
  acceleration: number;
}

const PHASE_COLORS: Record<string, string> = {
  "Рост": "oklch(0.72 0.19 155)",
  "Стагнация": "oklch(0.78 0.16 75)",
  "Спад": "oklch(0.65 0.22 25)",
  "Восстановление": "oklch(0.68 0.16 250)",
  "Стабильность": "oklch(0.70 0.01 260)",
};

export default function PhaseIndicator({ phase, sIndex, velocity, acceleration }: Props) {
  const color = PHASE_COLORS[phase] || "oklch(0.70 0.01 260)";

  return (
    <div className="space-y-4">
      {/* Phase badge */}
      <div className="flex items-center gap-3">
        <div
          className="px-4 py-2 rounded-lg font-semibold text-sm"
          style={{
            backgroundColor: `color-mix(in oklch, ${color} 15%, transparent)`,
            color,
            border: `1px solid color-mix(in oklch, ${color} 30%, transparent)`,
          }}
        >
          {phase}
        </div>
      </div>

      {/* Metrics grid */}
      <div className="grid grid-cols-3 gap-3">
        <div className="text-center p-3 rounded-lg bg-secondary/50">
          <div className="text-xs text-muted-foreground mb-1">S-индекс</div>
          <div className="text-lg font-bold font-mono text-foreground">{sIndex.toFixed(2)}</div>
        </div>
        <div className="text-center p-3 rounded-lg bg-secondary/50">
          <div className="text-xs text-muted-foreground mb-1">Скорость</div>
          <div className="text-lg font-bold font-mono text-foreground">{velocity.toFixed(2)}</div>
        </div>
        <div className="text-center p-3 rounded-lg bg-secondary/50">
          <div className="text-xs text-muted-foreground mb-1">Ускорение</div>
          <div className="text-lg font-bold font-mono text-foreground">{acceleration.toFixed(2)}</div>
        </div>
      </div>
    </div>
  );
}
