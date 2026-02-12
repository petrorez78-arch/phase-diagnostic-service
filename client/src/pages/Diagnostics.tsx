import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Send, TrendingUp, AlertTriangle } from "lucide-react";
import ResultsDashboard from "@/components/ResultsDashboard";
import ChatInterface from "@/components/ChatInterface";

export default function Diagnostics() {
  const [query, setQuery] = useState("");
  const [chatId] = useState(() => `chat-${Date.now()}`);
  const [results, setResults] = useState<any>(null);
  const [messages, setMessages] = useState<Array<{ role: string; content: string }>>([]);
  const [loading, setLoading] = useState(false);

  const sendMutation = trpc.diagnostics.send.useMutation();

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    try {
      const response = await sendMutation.mutateAsync({
        message: query,
        chatId,
      });

      if (response.success) {
        setResults(response.data);
        setMessages([
          ...messages,
          { role: "user", content: query },
        ]);
        setQuery("");
      } else {
        alert(`Ошибка: ${response.error}`);
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Ошибка при отправке запроса");
    } finally {
      setLoading(false);
    }
  };

  const handleChatMessage = async (message: string) => {
    setLoading(true);
    try {
      const response = await sendMutation.mutateAsync({
        message,
        chatId,
      });

      if (response.success) {
        setMessages([
          ...messages,
          { role: "user", content: message },
          { role: "assistant", content: (response.data as any)?.message || "Ответ получен" },
        ]);
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
            <TrendingUp className="text-cyan-400" size={40} />
            Фазовая диагностика MOEX
          </h1>
          <p className="text-slate-400">
            Анализируйте компании с использованием методологии фазовой диагностики
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Search and Chat */}
          <div className="lg:col-span-1 space-y-6">
            {/* Search Form */}
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-lg">Поиск компании</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSearch} className="space-y-4">
                  <div>
                    <Input
                      placeholder="Введите тикер или название (GAZP, Газпром)"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      disabled={loading}
                      className="bg-slate-700 border-slate-600 text-white placeholder-slate-500"
                    />
                  </div>
                  <Button
                    type="submit"
                    disabled={loading || !query.trim()}
                    className="w-full bg-cyan-600 hover:bg-cyan-700"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Анализ...
                      </>
                    ) : (
                      <>
                        <Send className="mr-2 h-4 w-4" />
                        Анализировать
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Chat Interface */}
            {results && (
              <ChatInterface
                messages={messages}
                onSendMessage={handleChatMessage}
                loading={loading}
              />
            )}
          </div>

          {/* Right: Results */}
          <div className="lg:col-span-2">
            {loading && !results && (
              <Card className="bg-slate-800 border-slate-700 h-96 flex items-center justify-center">
                <div className="text-center">
                  <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-cyan-400" />
                  <p className="text-slate-300">Анализирую данные...</p>
                </div>
              </Card>
            )}

            {results && results.type === "analysis" && (
              <ResultsDashboard data={results} />
            )}

            {results && results.type === "search" && (
              <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <CardTitle>Результаты поиска</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {Array.isArray(results.results) && results.results.length > 0 ? (
                      results.results.map((item: any, idx: number) => (
                        <div
                          key={idx}
                          className="p-3 bg-slate-700 rounded hover:bg-slate-600 cursor-pointer transition"
                        >
                          <div className="font-semibold">{item.name}</div>
                          <div className="text-sm text-slate-400">{item.secid}</div>
                        </div>
                      ))
                    ) : (
                      <p className="text-slate-400">Компании не найдены</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {results && results.type === "chat" && (
              <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <CardTitle>Ответ AI</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-200">{results.message || "Ответ получен"}</p>
                </CardContent>
              </Card>
            )}

            {!results && !loading && (
              <Card className="bg-slate-800 border-slate-700">
                <CardContent className="pt-12 pb-12 text-center">
                  <AlertTriangle className="h-16 w-16 mx-auto mb-4 text-slate-500" />
                  <p className="text-slate-400">
                    Введите название компании или тикер для начала анализа
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
