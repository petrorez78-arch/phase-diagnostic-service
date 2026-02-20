import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageSquare, Plus, Trash2, X, Menu } from "lucide-react";
import { useLocation } from "wouter";

interface ChatSession {
  id: number;
  chatId: string;
  title: string;
  lastMessage: string | null;
  updatedAt: Date;
}

interface Props {
  currentChatId: string;
  onNewChat: () => void;
  onSelectChat: (chatId: string) => void;
}

export default function ChatSidebar({ currentChatId, onNewChat, onSelectChat }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const { data: sessions = [], refetch } = trpc.chat.sessions.useQuery();
  const deleteSessionMutation = trpc.chat.deleteSession.useMutation();
  const [, setLocation] = useLocation();

  const handleDelete = async (chatId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Удалить этот чат?")) return;

    try {
      await deleteSessionMutation.mutateAsync({ chatId });
      await refetch();
      if (chatId === currentChatId) {
        onNewChat();
      }
    } catch (error) {
      console.error("Failed to delete chat:", error);
    }
  };

  const handleSelectChat = (chatId: string) => {
    onSelectChat(chatId);
    setIsOpen(false);
  };

  return (
    <>
      {/* Mobile toggle button */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-4 left-4 z-50 lg:hidden"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </Button>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`
          fixed lg:static inset-y-0 left-0 z-40
          w-64 bg-card border-r border-border
          transform transition-transform duration-300 ease-in-out
          ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-4 border-b border-border">
            <Button
              onClick={() => {
                onNewChat();
                setIsOpen(false);
              }}
              className="w-full"
              variant="default"
            >
              <Plus className="w-4 h-4 mr-2" />
              Новый анализ
            </Button>
          </div>

          {/* Chat list */}
          <ScrollArea className="flex-1 p-2">
            {sessions.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-32 text-center px-4">
                <MessageSquare className="w-8 h-8 text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">
                  История чатов пуста
                </p>
              </div>
            ) : (
              <div className="space-y-1">
                {sessions.map((session) => (
                  <div
                    key={session.id}
                    className={`
                      group relative rounded-lg p-3 cursor-pointer
                      transition-all duration-200
                      hover:bg-accent
                      ${session.chatId === currentChatId ? "bg-accent border border-primary/30" : "border border-transparent"}
                    `}
                    onClick={() => handleSelectChat(session.chatId)}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-medium text-foreground truncate">
                          {session.title}
                        </h4>
                        {session.lastMessage && (
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                            {session.lastMessage}
                          </p>
                        )}
                        <p className="text-[10px] text-muted-foreground mt-1">
                          {new Date(session.updatedAt).toLocaleDateString("ru-RU")}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 shrink-0"
                        onClick={(e) => handleDelete(session.chatId, e)}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </div>
      </div>
    </>
  );
}
