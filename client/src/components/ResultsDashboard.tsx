import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface DiagnosticData {
  ticker: string;
  company: string;
  marketData: {
    ticker: string;
    lastPrice: number;
    volToday: number;
    numTrades: number;
    capitalization?: number;
  };
  diagnostics: {
    phase: string;
    s: number;
    vS: number;
    aS: number;
    iFund: number;
    iMarketGap: number;
    iStruct: number;
    iVola: number;
    signals: string[];
  };
  newsData: {
    news: Array<{
      title: string;
      date: string;
      sentiment: string;
      text: string;
    }>;
    rhetoricalPressure: number;
  } | null;
}

interface Props {
  data: DiagnosticData;
}

const getPhaseColor = (phase: string): string => {
  switch (phase) {
    case "Накопление":
      return "bg-blue-100 text-blue-800";
    case "Рост":
      return "bg-green-100 text-green-800";
    case "Разметка":
      return "bg-amber-100 text-amber-800";
    case "Снижение":
      return "bg-red-100 text-red-800";
    case "Распределение":
      return "bg-purple-100 text-purple-800";
    default:
      return "bg-slate-100 text-slate-800";
  }
};

const getPhaseDescription = (phase: string): string => {
  switch (phase) {
    case "Накопление":
      return "Фаза накопления - умные деньги входят в позицию";
    case "Рост":
      return "Фаза роста - восходящий тренд с положительной динамикой";
    case "Разметка":
      return "Фаза разметки - цена достигает пиков, готовится к коррекции";
    case "Снижение":
      return "Фаза снижения - нисходящий тренд с отрицательной динамикой";
    case "Распределение":
      return "Фаза распределения - умные деньги выходят из позиции";
    default:
      return "Неопределённая фаза";
  }
};

export default function ResultsDashboard({ data }: Props) {
  const { diagnostics, marketData, newsData } = data;

  // Prepare data for charts
  const indexData = [
    { name: "S-индекс", value: diagnostics.s, max: 100 },
    { name: "IFund", value: diagnostics.iFund, max: 100 },
    { name: "IMarketGap", value: diagnostics.iMarketGap, max: 100 },
    { name: "IStruct", value: diagnostics.iStruct, max: 100 },
    { name: "IVola", value: diagnostics.iVola, max: 100 },
  ];

  const dynamicsData = [
    { name: "S", value: diagnostics.s },
    { name: "vS", value: diagnostics.vS },
    { name: "aS", value: diagnostics.aS },
  ];

  const formatPrice = (kopecks: number) => {
    return (kopecks / 100).toFixed(2);
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000000) {
      return (num / 1000000000).toFixed(1) + "B";
    }
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + "M";
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + "K";
    }
    return num.toString();
  };

  return (
    <div className="space-y-6">
      {/* Phase Card */}
      <Card className="p-6 bg-gradient-to-br from-slate-50 to-slate-100 border-2">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-slate-900">Фазовая диагностика</h2>
          <Badge className={`text-lg px-4 py-2 ${getPhaseColor(diagnostics.phase)}`}>
            {diagnostics.phase}
          </Badge>
        </div>
        <p className="text-slate-600 mb-4">
          {getPhaseDescription(diagnostics.phase)}
        </p>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-slate-600">S-индекс (основной показатель)</p>
            <p className="text-3xl font-bold text-slate-900">{diagnostics.s}</p>
          </div>
          <div>
            <p className="text-sm text-slate-600">Динамика (vS)</p>
            <p className={`text-3xl font-bold ${diagnostics.vS > 0 ? "text-green-600" : "text-red-600"}`}>
              {diagnostics.vS > 0 ? "+" : ""}{diagnostics.vS}
            </p>
          </div>
        </div>
      </Card>

      {/* Market Data Card */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Рыночные данные</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-slate-600">Текущая цена</p>
            <p className="text-2xl font-bold text-slate-900">
              ₽{formatPrice(marketData.lastPrice)}
            </p>
          </div>
          <div>
            <p className="text-sm text-slate-600">Объём торговли</p>
            <p className="text-2xl font-bold text-slate-900">
              {formatNumber(marketData.volToday)}
            </p>
          </div>
          <div>
            <p className="text-sm text-slate-600">Сделок</p>
            <p className="text-2xl font-bold text-slate-900">
              {formatNumber(marketData.numTrades)}
            </p>
          </div>
          {marketData.capitalization && (
            <div>
              <p className="text-sm text-slate-600">Капитализация</p>
              <p className="text-2xl font-bold text-slate-900">
                ₽{formatNumber(marketData.capitalization)}
              </p>
            </div>
          )}
        </div>
      </Card>

      {/* Indices Chart */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Индексы</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={indexData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="value" fill="#3b82f6" />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      {/* Dynamics Chart */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Динамика (S, vS, aS)</h3>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={dynamicsData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="value" fill="#8b5cf6" />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      {/* Weak Signals */}
      {diagnostics.signals.length > 0 && (
        <Card className="p-6 border-amber-200 bg-amber-50">
          <h3 className="text-lg font-semibold text-amber-900 mb-4">⚠️ Слабые сигналы</h3>
          <ul className="space-y-2">
            {diagnostics.signals.map((signal, idx) => (
              <li key={idx} className="flex items-start gap-2 text-amber-800">
                <span className="text-amber-600 mt-1">•</span>
                <span>{signal}</span>
              </li>
            ))}
          </ul>
        </Card>
      )}

      {/* News Sentiment */}
      {newsData && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Новостной фон</h3>
          <div className="mb-4">
            <p className="text-sm text-slate-600">Риторическое давление</p>
            <div className="flex items-center gap-2 mt-2">
              <div className="flex-1 bg-slate-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${
                    newsData.rhetoricalPressure > 0
                      ? "bg-green-500"
                      : "bg-red-500"
                  }`}
                  style={{
                    width: `${Math.abs(newsData.rhetoricalPressure) * 100}%`,
                  }}
                />
              </div>
              <span className="text-sm font-semibold text-slate-900">
                {(newsData.rhetoricalPressure * 100).toFixed(0)}%
              </span>
            </div>
          </div>
          {newsData.news.length > 0 && (
            <div className="space-y-3">
              <p className="text-sm font-semibold text-slate-700">Последние новости:</p>
              {newsData.news.slice(0, 3).map((news, idx) => (
                <div key={idx} className="p-3 bg-white rounded border border-slate-200">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h4 className="font-medium text-slate-900 text-sm line-clamp-2">
                      {news.title}
                    </h4>
                    <Badge
                      className={`text-xs whitespace-nowrap ${
                        news.sentiment === "positive"
                          ? "bg-green-100 text-green-800"
                          : news.sentiment === "negative"
                            ? "bg-red-100 text-red-800"
                            : "bg-slate-100 text-slate-800"
                      }`}
                    >
                      {news.sentiment === "positive"
                        ? "Позитив"
                        : news.sentiment === "negative"
                          ? "Негатив"
                          : "Нейтраль"}
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-500">{news.date}</p>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
