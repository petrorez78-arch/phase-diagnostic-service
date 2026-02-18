import { useState, useRef, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Loader2,
  Send,
  TrendingUp,
  ArrowLeft,
  Bot,
  User,
  Sparkles,
} from "lucide-react";
import ResultsDashboard from "@/components/ResultsDashboard";
import LoadingSkeleton, { ProgressBar } from "@/components/LoadingSkeleton";
import { SearchHistory, addToSearchHistory } from "@/components/SearchHistory";
import { Streamdown } from "streamdown";
import { useLocation } from "wouter";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  hasData?: boolean;
}

export default function Diagnostics() {
  const [query, setQuery] = useState("");
  const [chatId] = useState(() => `chat-${Date.now()}`);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingStartTime, setLoadingStartTime] = useState<number | null>(null);
  const [selectedMessage, setSelectedMessage] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [, setLocation] = useLocation();

  const sendMutation = trpc.diagnostics.send.useMutation();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim() || loading) return;

    const userMessage: Message = {
      id: `msg-${Date.now()}`,
      role: "user",
      content: query.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setQuery("");
    setLoading(true);
    setLoadingStartTime(Date.now());

    try {
      // Prepare chat history (last 10 messages)
      const history = messages.slice(-10).map(msg => ({
        role: msg.role === "user" ? "user" : "assistant",
        content: msg.content,
      }));

      const response = await sendMutation.mutateAsync({
        message: userMessage.content,
        chatId,
        history,
      });

      const respData = (response as any).data;
      const responseText =
        typeof respData === "string"
          ? respData
          : respData?.message ||
            respData?.data?.message ||
            respData?.data ||
            JSON.stringify(respData);

      const assistantMessage: Message = {
        id: `msg-${Date.now()}-resp`,
        role: "assistant",
        content: typeof responseText === "string" ? responseText : JSON.stringify(responseText),
        timestamp: new Date(),
        hasData: true,
      };

      setMessages((prev) => [...prev, assistantMessage]);
      setSelectedMessage(assistantMessage.id);
      
      // Add to search history
      addToSearchHistory(userMessage.content);
    } catch (error) {
      const errorMessage: Message = {
        id: `msg-${Date.now()}-err`,
        role: "assistant",
        content:
          "Произошла ошибка при обработке запроса. Проверьте подключение к n8n workflow и попробуйте снова.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
      setLoadingStartTime(null);
      inputRef.current?.focus();
    }
  };

  const selectedAssistantMessage = messages.find((m) => m.id === selectedMessage);

  // Quick actions
  const quickActions = [
    "GAZP",
    "SBER",
    "LKOH",
    "YNDX",
    "ROSN",
  ];

  return (
    <div className="h-screen flex flex-col bg-background text-foreground overflow-hidden">
      {/* Top bar */}
      <header className="shrink-0 border-b border-border/50 bg-background/80 backdrop-blur-xl px-4 py-2.5">
        <div className="flex items-center justify-between max-w-[1600px] mx-auto">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setLocation("/")}
              className="gap-1.5 text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Назад</span>
            </Button>
            <div className="h-5 w-px bg-border" />
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-primary" />
              <span className="font-semibold text-sm">Фазовая диагностика</span>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <div className="w-2 h-2 rounded-full bg-fin-green animate-pulse" />
            n8n connected
          </div>
        </div>
      </header>

      {/* Main content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Chat panel */}
        <div className="w-full lg:w-[440px] xl:w-[480px] flex flex-col border-r border-border/50 shrink-0">
          {/* Messages area */}
          <ScrollArea className="flex-1">
            <div className="p-4 space-y-4">
              {messages.length === 0 && (
                <div className="pt-12 pb-6 text-center">
                  <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <Sparkles className="w-7 h-7 text-primary" />
                  </div>
                  <h2 className="text-lg font-semibold mb-2">Фазовая диагностика</h2>
                  <p className="text-sm text-muted-foreground max-w-xs mx-auto mb-6">
                    Введите тикер компании (например, GAZP) или задайте вопрос AI-агенту
                  </p>
                  {/* Quick actions */}
                  <div className="flex flex-wrap justify-center gap-2 mb-6">
                    {quickActions.map((action) => (
                      <button
                        key={action}
                        onClick={() => {
                          setQuery(action);
                          inputRef.current?.focus();
                        }}
                        className="px-3 py-1.5 rounded-lg text-xs font-medium bg-secondary hover:bg-secondary/80 text-secondary-foreground transition-colors border border-border/50"
                      >
                        {action}
                      </button>
                    ))}
                  </div>
                  {/* Search history */}
                  <div className="max-w-md mx-auto">
                    <SearchHistory
                      onSelectSearch={(searchQuery) => {
                        setQuery(searchQuery);
                        inputRef.current?.focus();
                      }}
                    />
                  </div>
                </div>
              )}

              {messages.map((msg) => (
                <div key={msg.id} className="flex gap-3">
                  {/* Avatar */}
                  <div
                    className={`shrink-0 w-7 h-7 rounded-lg flex items-center justify-center mt-0.5 ${
                      msg.role === "user"
                        ? "bg-primary/15"
                        : "bg-fin-green/15"
                    }`}
                  >
                    {msg.role === "user" ? (
                      <User className="w-3.5 h-3.5 text-primary" />
                    ) : (
                      <Bot className="w-3.5 h-3.5" style={{ color: "oklch(0.72 0.19 155)" }} />
                    )}
                  </div>
                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-medium text-foreground/80">
                        {msg.role === "user" ? "Вы" : "AI Агент"}
                      </span>
                      <span className="text-[10px] text-muted-foreground">
                        {msg.timestamp.toLocaleTimeString("ru-RU", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                    {msg.role === "user" ? (
                      <p className="text-sm text-foreground/90">{msg.content}</p>
                    ) : (
                      <div
                        className={`text-sm text-foreground/90 leading-relaxed cursor-pointer rounded-lg p-2 -mx-2 transition-colors ${
                          selectedMessage === msg.id
                            ? "bg-primary/5 border border-primary/20"
                            : "hover:bg-secondary/50"
                        }`}
                        onClick={() => setSelectedMessage(msg.id)}
                      >
                        <div className="line-clamp-4 prose prose-invert prose-sm max-w-none">
                          <Streamdown>{msg.content}</Streamdown>
                        </div>
                        {msg.content.length > 200 && (
                          <button className="text-xs text-primary mt-1 font-medium">
                            {selectedMessage === msg.id
                              ? "Показано справа →"
                              : "Показать подробнее →"}
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {loading && (
                <div className="space-y-3">
                  <LoadingSkeleton />
                  <ProgressBar duration={25} />
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>

          {/* Input area */}
          <div className="shrink-0 border-t border-border/50 p-3 bg-card/50">
            <form onSubmit={handleSend} className="flex gap-2">
              <Input
                ref={inputRef}
                placeholder="Тикер, название компании или вопрос..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                disabled={loading}
                className="bg-secondary/50 border-border/50 text-foreground placeholder:text-muted-foreground"
              />
              <Button
                type="submit"
                disabled={loading || !query.trim()}
                size="icon"
                className="shrink-0"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </Button>
            </form>
          </div>
        </div>

        {/* Results panel - desktop */}
        <div className="hidden lg:flex flex-1 flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto">
            <div className="p-6 max-w-3xl mx-auto">
              {selectedAssistantMessage ? (
                <ResultsDashboard data={selectedAssistantMessage.content} />
              ) : (
                <div className="flex flex-col items-center justify-center h-full min-h-[60vh] text-center">
                  <div className="w-16 h-16 rounded-2xl bg-secondary flex items-center justify-center mb-4">
                    <TrendingUp className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    Результаты анализа
                  </h3>
                  <p className="text-sm text-muted-foreground max-w-sm">
                    Введите тикер или название компании в поле слева, чтобы получить
                    фазовую диагностику с визуализацией
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile results modal */}
      <Dialog open={!!selectedMessage && !!selectedAssistantMessage} onOpenChange={(open) => !open && setSelectedMessage(null)}>
        <DialogContent className="max-w-[95vw] max-h-[90vh] overflow-y-auto lg:hidden">
          <DialogHeader>
            <DialogTitle>Результаты анализа</DialogTitle>
          </DialogHeader>
          {selectedAssistantMessage && (
            <ResultsDashboard data={selectedAssistantMessage.content} />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
