import { useState, useRef, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Loader2, Send } from "lucide-react";
import { Streamdown } from "streamdown";

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

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

interface Props {
  ticker: string;
  company: string;
  chatId: string;
  diagnosticData: DiagnosticData;
}

export default function ChatInterface({
  ticker,
  company,
  chatId,
  diagnosticData,
}: Props) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const chatMutation = trpc.diagnostics.chat.useMutation({
    onSuccess: (data) => {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.message },
      ]);
      setInput("");
    },
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = input.trim();
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);

    chatMutation.mutate({
      message: userMessage,
      ticker,
      chatId,
    });
  };

  const handleInitialAnalysis = () => {
    const initialPrompt = `Проанализируй результаты фазовой диагностики для ${company} (${ticker}). 
    Фаза: ${diagnosticData.diagnostics.phase}
    S-индекс: ${diagnosticData.diagnostics.s}
    Динамика (vS): ${diagnosticData.diagnostics.vS}
    Ускорение (aS): ${diagnosticData.diagnostics.aS}
    IFund: ${diagnosticData.diagnostics.iFund}
    IMarketGap: ${diagnosticData.diagnostics.iMarketGap}
    IStruct: ${diagnosticData.diagnostics.iStruct}
    IVola: ${diagnosticData.diagnostics.iVola}
    Слабые сигналы: ${diagnosticData.diagnostics.signals.join(", ") || "нет"}
    
    Дай краткую оценку текущего состояния компании и рекомендации.`;

    setMessages([{ role: "user", content: initialPrompt }]);
    chatMutation.mutate({
      message: initialPrompt,
      ticker,
      chatId,
    });
  };

  return (
    <Card className="flex flex-col h-[600px] bg-white">
      {/* Header */}
      <div className="p-4 border-b border-slate-200">
        <h3 className="font-semibold text-slate-900">AI Анализ</h3>
        <p className="text-xs text-slate-500">Интерактивная консультация</p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center">
            <p className="text-slate-600 mb-4">
              Нажмите кнопку ниже для начальной диагностики
            </p>
            <Button
              onClick={handleInitialAnalysis}
              disabled={chatMutation.isPending}
              className="gap-2"
            >
              {chatMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Анализирую...
                </>
              ) : (
                "Начать анализ"
              )}
            </Button>
          </div>
        ) : (
          <>
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-xs px-4 py-2 rounded-lg ${
                    msg.role === "user"
                      ? "bg-blue-500 text-white"
                      : "bg-slate-100 text-slate-900"
                  }`}
                >
                  {msg.role === "assistant" ? (
                    <Streamdown>{msg.content}</Streamdown>
                  ) : (
                    <p className="text-sm">{msg.content}</p>
                  )}
                </div>
              </div>
            ))}
            {chatMutation.isPending && (
              <div className="flex justify-start">
                <div className="bg-slate-100 text-slate-900 px-4 py-2 rounded-lg">
                  <Loader2 className="w-4 h-4 animate-spin" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Input */}
      <div className="p-4 border-t border-slate-200">
        <form onSubmit={handleSendMessage} className="flex gap-2">
          <Input
            placeholder="Задайте вопрос об анализе..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={chatMutation.isPending || messages.length === 0}
            className="flex-1"
          />
          <Button
            type="submit"
            disabled={!input.trim() || chatMutation.isPending || messages.length === 0}
            size="icon"
          >
            {chatMutation.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </form>
      </div>
    </Card>
  );
}
