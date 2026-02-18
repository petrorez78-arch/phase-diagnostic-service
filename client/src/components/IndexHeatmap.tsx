interface Props {
  indices: {
    iFund?: number;
    iMarketGap?: number;
    iStruct?: number;
    iVola?: number;
  };
}

const INDEX_INFO = {
  iFund: {
    label: "Фундаментальный",
    description: "Оценка финансовой устойчивости",
  },
  iMarketGap: {
    label: "Рыночный разрыв",
    description: "Разница между ценой и стоимостью",
  },
  iStruct: {
    label: "Структурный",
    description: "Качество корпоративного управления",
  },
  iVola: {
    label: "Волатильность",
    description: "Уровень ценовых колебаний",
  },
};

export default function IndexHeatmap({ indices }: Props) {
  const getColor = (value: number) => {
    if (value >= 70) return "oklch(0.72 0.19 155)"; // green
    if (value >= 40) return "oklch(0.75 0.18 85)"; // yellow
    return "oklch(0.65 0.25 25)"; // red
  };

  const getRiskLevel = (value: number) => {
    if (value >= 70) return "Низкий";
    if (value >= 40) return "Средний";
    return "Высокий";
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      {Object.entries(indices).map(([key, value]) => {
        if (value === undefined) return null;
        const info = INDEX_INFO[key as keyof typeof INDEX_INFO];
        if (!info) return null;

        const color = getColor(value);
        const risk = getRiskLevel(value);

        return (
          <div
            key={key}
            className="rounded-lg border border-border/50 p-4 hover:border-primary/30 hover:shadow-lg transition-all duration-300 hover:scale-105 group"
            style={{
              backgroundColor: `${color}08`,
              borderColor: `${color}30`,
            }}
          >
            <div className="flex items-start justify-between mb-2">
              <div>
                <h4 className="text-sm font-semibold text-foreground">{info.label}</h4>
                <p className="text-xs text-muted-foreground mt-0.5">{info.description}</p>
              </div>
              <div
                className="px-2 py-1 rounded text-xs font-medium"
                style={{
                  backgroundColor: `${color}20`,
                  color,
                }}
              >
                {risk}
              </div>
            </div>
            <div className="flex items-end gap-2">
              <span className="text-3xl font-bold text-foreground transition-all duration-500 group-hover:scale-110 inline-block">{value.toFixed(1)}</span>
              <span className="text-sm text-muted-foreground mb-1">/100</span>
            </div>
            {/* Progress bar */}
            <div className="mt-3 h-2 bg-secondary rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-1000 ease-out"
                style={{
                  width: `${value}%`,
                  backgroundColor: color,
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
