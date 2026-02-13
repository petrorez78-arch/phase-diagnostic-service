interface Props {
  value: number;
  max: number;
  min: number;
  label: string;
  sublabel?: string;
  color?: string;
}

export default function GaugeChart({
  value,
  max,
  min,
  label,
  sublabel,
  color = "oklch(0.68 0.16 250)",
}: Props) {
  const normalized = Math.max(0, Math.min(100, ((value - min) / (max - min)) * 100));
  const rotation = (normalized / 100) * 180 - 90;

  return (
    <div className="flex flex-col items-center">
      {/* Gauge */}
      <div className="relative w-24 h-12 mb-2">
        {/* Background arc */}
        <svg
          viewBox="0 0 100 50"
          className="w-full h-full"
          style={{ overflow: "visible" }}
        >
          <path
            d="M 10 45 A 40 40 0 0 1 90 45"
            fill="none"
            stroke="oklch(0.25 0.015 260)"
            strokeWidth="8"
            strokeLinecap="round"
          />
          {/* Value arc */}
          <path
            d="M 10 45 A 40 40 0 0 1 90 45"
            fill="none"
            stroke={color}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={`${(normalized / 100) * 126} 126`}
            className="transition-all duration-1000 ease-out"
          />
          {/* Needle */}
          <g transform={`rotate(${rotation} 50 45)`} className="transition-transform duration-700">
            <line
              x1="50"
              y1="45"
              x2="50"
              y2="15"
              stroke={color}
              strokeWidth="2.5"
              strokeLinecap="round"
            />
            <circle cx="50" cy="45" r="3" fill={color} />
          </g>
        </svg>
      </div>

      {/* Value display */}
      <div className="text-center">
        <div className="text-2xl font-bold font-mono" style={{ color }}>
          {value.toFixed(1)}
        </div>
        <div className="text-xs font-semibold text-foreground/80 mt-0.5">{label}</div>
        {sublabel && (
          <div className="text-[10px] text-muted-foreground mt-0.5">{sublabel}</div>
        )}
      </div>
    </div>
  );
}
