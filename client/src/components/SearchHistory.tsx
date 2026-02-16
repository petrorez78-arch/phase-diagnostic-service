import { useEffect, useState } from "react";
import { Clock, X } from "lucide-react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { ScrollArea } from "./ui/scroll-area";

interface SearchHistoryItem {
  query: string;
  ticker?: string;
  company?: string;
  timestamp: number;
}

interface Props {
  onSelectSearch: (query: string) => void;
}

export function SearchHistory({ onSelectSearch }: Props) {
  const [history, setHistory] = useState<SearchHistoryItem[]>([]);

  // Load history from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem("searchHistory");
    if (stored) {
      try {
        setHistory(JSON.parse(stored));
      } catch (e) {
        console.error("Failed to parse search history:", e);
      }
    }
  }, []);

  const clearHistory = () => {
    localStorage.removeItem("searchHistory");
    setHistory([]);
  };

  const removeItem = (timestamp: number) => {
    const updated = history.filter((item) => item.timestamp !== timestamp);
    localStorage.setItem("searchHistory", JSON.stringify(updated));
    setHistory(updated);
  };

  if (history.length === 0) {
    return null;
  }

  return (
    <Card className="p-4 bg-slate-900/50 border-slate-800">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2 text-sm font-medium text-slate-300">
          <Clock className="w-4 h-4" />
          <span>История поиска</span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={clearHistory}
          className="h-7 text-xs text-slate-400 hover:text-slate-200"
        >
          Очистить
        </Button>
      </div>
      <ScrollArea className="h-[200px]">
        <div className="space-y-2">
          {history.map((item) => (
            <div
              key={item.timestamp}
              className="flex items-center justify-between gap-2 p-2 rounded-lg bg-slate-800/50 hover:bg-slate-800 transition-colors group"
            >
              <button
                onClick={() => onSelectSearch(item.query)}
                className="flex-1 text-left"
              >
                <div className="text-sm font-medium text-slate-200">
                  {item.ticker || item.query}
                </div>
                {item.company && (
                  <div className="text-xs text-slate-400 truncate">
                    {item.company}
                  </div>
                )}
              </button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeItem(item.timestamp)}
                className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="w-3 h-3" />
              </Button>
            </div>
          ))}
        </div>
      </ScrollArea>
    </Card>
  );
}

// Helper function to add search to history (call this from Diagnostics page)
export function addToSearchHistory(query: string, ticker?: string, company?: string) {
  const stored = localStorage.getItem("searchHistory");
  let history: SearchHistoryItem[] = [];
  
  if (stored) {
    try {
      history = JSON.parse(stored);
    } catch (e) {
      console.error("Failed to parse search history:", e);
    }
  }

  // Remove duplicate if exists
  history = history.filter((item) => item.query !== query);

  // Add new item at the beginning
  history.unshift({
    query,
    ticker,
    company,
    timestamp: Date.now(),
  });

  // Keep only last 10 items
  history = history.slice(0, 10);

  localStorage.setItem("searchHistory", JSON.stringify(history));
}


