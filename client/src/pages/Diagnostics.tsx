import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Loader2, Search, TrendingUp, AlertCircle } from "lucide-react";
import ResultsDashboard from "@/components/ResultsDashboard";
import ChatInterface from "@/components/ChatInterface";

interface SearchResult {
  secid: string;
  name: string;
}

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

export default function Diagnostics() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [selectedStock, setSelectedStock] = useState<SearchResult | null>(null);
  const [diagnosticData, setDiagnosticData] = useState<DiagnosticData | null>(
    null
  );
  const [chatId, setChatId] = useState(
    `chat-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  );
  const [showChat, setShowChat] = useState(false);

  const searchMutation = trpc.diagnostics.search.useQuery(
    { query: searchQuery },
    {
      enabled: searchQuery.length > 1,
      staleTime: 60000,
    }
  );

  const analyzeMutation = trpc.diagnostics.analyze.useMutation({
    onSuccess: (data) => {
      setDiagnosticData(data);
      setShowChat(true);
    },
    onError: (error) => {
      console.error("Analysis error:", error);
    },
  });

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
  };

  const handleSelectStock = (stock: SearchResult) => {
    setSelectedStock(stock);
    setSearchResults([]);
    setSearchQuery("");
  };

  const handleAnalyze = () => {
    if (!selectedStock) return;

    analyzeMutation.mutate({
      ticker: selectedStock.secid,
      company: selectedStock.name,
      chatId,
    });
  };

  const handleReset = () => {
    setSelectedStock(null);
    setDiagnosticData(null);
    setShowChat(false);
    setChatId(
      `chat-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    );
  };

  // Show search results
  if (!selectedStock) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8 pt-8">
            <h1 className="text-4xl font-bold text-slate-900 mb-2">
              📊 Фазовая диагностика акций
            </h1>
            <p className="text-lg text-slate-600">
              Анализируйте компании MOEX с помощью методологии фазовой диагностики
            </p>
          </div>

          {/* Search Card */}
          <Card className="p-6 mb-6 shadow-lg">
            <div className="space-y-4">
              <label className="block text-sm font-medium text-slate-700">
                Поиск компании по названию или тикеру
              </label>
              <div className="flex gap-2">
                <Input
                  placeholder="Например: GAZP, SBER, Газпром..."
                  value={searchQuery}
                  onChange={handleSearch}
                  className="flex-1"
                />
                <Button
                  disabled={searchQuery.length < 1}
                  className="gap-2"
                >
                  <Search className="w-4 h-4" />
                  Поиск
                </Button>
              </div>

              {/* Search Results */}
              {searchQuery.length > 1 && (
                <div className="mt-4">
                  {searchMutation.isLoading ? (
                    <div className="flex items-center justify-center py-4">
                      <Loader2 className="w-5 h-5 animate-spin text-blue-500" />
                      <span className="ml-2 text-slate-600">
                        Поиск компаний...
                      </span>
                    </div>
                  ) : searchMutation.data && searchMutation.data.length > 0 ? (
                    <div className="space-y-2">
                      <p className="text-sm text-slate-500 mb-3">
                        Найдено {searchMutation.data.length} результатов:
                      </p>
                      {searchMutation.data.map((stock) => (
                        <button
                          key={stock.secid}
                          onClick={() => handleSelectStock(stock)}
                          className="w-full text-left p-3 rounded-lg border border-slate-200 hover:bg-blue-50 hover:border-blue-300 transition-colors"
                        >
                          <div className="font-semibold text-slate-900">
                            {stock.secid}
                          </div>
                          <div className="text-sm text-slate-600">
                            {stock.name}
                          </div>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-4 text-slate-500">
                      Компании не найдены
                    </div>
                  )}
                </div>
              )}
            </div>
          </Card>

          {/* Info Cards */}
          <div className="grid md:grid-cols-3 gap-4">
            <Card className="p-4 bg-white">
              <TrendingUp className="w-6 h-6 text-blue-500 mb-2" />
              <h3 className="font-semibold text-slate-900 mb-1">
                Анализ фаз
              </h3>
              <p className="text-sm text-slate-600">
                Определение текущей фазы развития компании
              </p>
            </Card>
            <Card className="p-4 bg-white">
              <AlertCircle className="w-6 h-6 text-amber-500 mb-2" />
              <h3 className="font-semibold text-slate-900 mb-1">
                Слабые сигналы
              </h3>
              <p className="text-sm text-slate-600">
                Выявление потенциальных рисков и возможностей
              </p>
            </Card>
            <Card className="p-4 bg-white">
              <Search className="w-6 h-6 text-green-500 mb-2" />
              <h3 className="font-semibold text-slate-900 mb-1">
                AI анализ
              </h3>
              <p className="text-sm text-slate-600">
                Интерпретация результатов на русском языке
              </p>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  // Show analysis results
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header with back button */}
        <div className="mb-6 pt-4">
          <Button
            variant="outline"
            onClick={handleReset}
            className="mb-4"
          >
            ← Вернуться к поиску
          </Button>
          <h1 className="text-3xl font-bold text-slate-900">
            {selectedStock?.secid} - {selectedStock?.name}
          </h1>
        </div>

        {/* Loading state */}
        {analyzeMutation.isPending ? (
          <Card className="p-12 text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-500" />
            <p className="text-slate-600">
              Анализирую компанию и собираю данные...
            </p>
          </Card>
        ) : diagnosticData ? (
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Main Results */}
            <div className="lg:col-span-2">
              <ResultsDashboard data={diagnosticData} />
            </div>

            {/* Chat Sidebar */}
            <div>
              {user ? (
                <ChatInterface
                  ticker={selectedStock.secid}
                  company={selectedStock.name}
                  chatId={chatId}
                  diagnosticData={diagnosticData}
                />
              ) : (
                <Card className="p-6 text-center">
                  <p className="text-slate-600 mb-4">
                    Войдите в систему, чтобы использовать AI анализ
                  </p>
                  <Button>Войти</Button>
                </Card>
              )}
            </div>
          </div>
        ) : analyzeMutation.isError ? (
          <Card className="p-6 border-red-200 bg-red-50">
            <p className="text-red-700">
              Ошибка при анализе: {analyzeMutation.error?.message}
            </p>
          </Card>
        ) : null}
      </div>
    </div>
  );
}
