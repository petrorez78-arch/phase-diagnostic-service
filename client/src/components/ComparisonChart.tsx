import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from "recharts";

interface Props {
  current: {
    iFund?: number;
    iMarketGap?: number;
    iStruct?: number;
    iVola?: number;
  };
  average?: {
    iFund?: number;
    iMarketGap?: number;
    iStruct?: number;
    iVola?: number;
  };
}

const INDEX_LABELS: Record<string, string> = {
  iFund: "Фундаментальный",
  iMarketGap: "Рыночный разрыв",
  iStruct: "Структурный",
  iVola: "Волатильность",
};

export default function ComparisonChart({ current, average }: Props) {
  // Use market average if not provided
  const defaultAverage = {
    iFund: 50,
    iMarketGap: 50,
    iStruct: 50,
    iVola: 50,
  };

  const avgValues = average || defaultAverage;

  // Prepare comparison data
  const data = Object.keys(current)
    .filter((key) => current[key as keyof typeof current] !== undefined)
    .map((key) => ({
      name: INDEX_LABELS[key] || key,
      current: current[key as keyof typeof current] || 0,
      average: avgValues[key as keyof typeof avgValues] || 0,
      difference:
        (current[key as keyof typeof current] || 0) -
        (avgValues[key as keyof typeof avgValues] || 0),
    }));

  return (
    <div className="space-y-4">
      {/* Chart */}
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data} barSize={30}>
          <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.25 0.015 260)" />
          <XAxis
            dataKey="name"
            tick={{ fill: "oklch(0.70 0.01 260)", fontSize: 11 }}
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
              padding: "12px",
              boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
            }}
            cursor={{ fill: "oklch(0.25 0.015 260 / 0.5)" }}
            animationDuration={200}
          />
          <Legend
            wrapperStyle={{
              paddingTop: "20px",
              fontSize: "12px",
              color: "oklch(0.70 0.01 260)",
            }}
          />
          <Bar
            dataKey="current"
            name="Текущее значение"
            fill="oklch(0.68 0.16 250)"
            radius={[6, 6, 0, 0]}
            isAnimationActive={true}
            animationDuration={1000}
            animationBegin={0}
          />
          <Bar
            dataKey="average"
            name="Среднее по рынку"
            fill="oklch(0.50 0.01 260)"
            radius={[6, 6, 0, 0]}
            isAnimationActive={true}
            animationDuration={1000}
            animationBegin={200}
          />
        </BarChart>
      </ResponsiveContainer>

      {/* Difference indicators */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {data.map((item) => {
          const isPositive = item.difference > 0;
          const isNeutral = Math.abs(item.difference) < 5;
          const color = isNeutral
            ? "oklch(0.50 0.01 260)"
            : isPositive
            ? "oklch(0.72 0.19 155)"
            : "oklch(0.65 0.22 25)";

          return (
            <div
              key={item.name}
              className="rounded-lg border border-border/50 p-3 hover:border-primary/30 transition-all duration-300 hover:shadow-md group"
            >
              <p className="text-xs text-muted-foreground mb-1">{item.name}</p>
              <div className="flex items-baseline gap-1">
                <span
                  className="text-xl font-bold font-mono transition-all duration-300 group-hover:scale-110 inline-block"
                  style={{ color }}
                >
                  {isPositive ? "+" : ""}
                  {item.difference.toFixed(1)}
                </span>
                <span className="text-xs text-muted-foreground">
                  {isNeutral ? "≈" : isPositive ? "↑" : "↓"}
                </span>
              </div>
              <p className="text-[10px] text-muted-foreground mt-1">
                {isNeutral
                  ? "В пределах нормы"
                  : isPositive
                  ? "Выше среднего"
                  : "Ниже среднего"}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
