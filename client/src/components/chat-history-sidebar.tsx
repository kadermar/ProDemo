import { useState } from "react";
import { format } from "date-fns";
import { MessageSquare, Plus, MoreVertical, Edit2, Trash2, History, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useChatSessions, useCreateChatSession, useUpdateChatSession, useDeleteChatSession } from "@/hooks/use-chat-sessions";
import type { ChatSession } from "@shared/schema";

interface ChatHistorySidebarProps {
  isOpen: boolean;
  onClose: () => void;
  currentSessionId?: number;
  onSessionSelect: (sessionId: number) => void;
  onNewSession: () => void;
}

export function ChatHistorySidebar({
  isOpen,
  onClose,
  currentSessionId,
  onSessionSelect,
  onNewSession,
}: ChatHistorySidebarProps) {
  const [editingSessionId, setEditingSessionId] = useState<number | null>(null);
  const [editingTitle, setEditingTitle] = useState("");

  const { data: sessions = [], isLoading } = useChatSessions();
  const createSessionMutation = useCreateChatSession();
  const updateSessionMutation = useUpdateChatSession();
  const deleteSessionMutation = useDeleteChatSession();

  const handleCreateSession = async () => {
    try {
      const newSession = await createSessionMutation.mutateAsync({
        title: `New Chat ${sessions.length + 1}`,
      });
      onSessionSelect(newSession.id);
    } catch {}
  };

  const handleEditSession = (session: ChatSession) => {
    setEditingSessionId(session.id);
    setEditingTitle(session.title);
  };

  const handleSaveEdit = async () => {
    if (editingSessionId && editingTitle.trim()) {
      try {
        await updateSessionMutation.mutateAsync({
          id: editingSessionId,
          data: { title: editingTitle.trim() },
        });
        setEditingSessionId(null);
        setEditingTitle("");
      } catch {}
    }
  };

  const handleCancelEdit = () => {
    setEditingSessionId(null);
    setEditingTitle("");
  };

  const handleDeleteSession = async (sessionId: number) => {
    try {
      await deleteSessionMutation.mutateAsync(sessionId);
      if (currentSessionId === sessionId) onNewSession();
    } catch {}
  };

  return (
    <div className="bg-white border border-zinc-200 rounded-lg h-full flex flex-col overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3.5 border-b border-zinc-100 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <History className="w-4 h-4 text-zinc-400" />
          <span className="text-sm font-semibold text-zinc-800 tracking-tight">Chat History</span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="h-7 w-7 p-0 text-zinc-400 hover:text-zinc-700"
        >
          <X className="w-3.5 h-3.5" />
        </Button>
      </div>

      {/* New Chat */}
      <div className="px-3 py-2.5 border-b border-zinc-100 shrink-0">
        <Button
          onClick={handleCreateSession}
          className="w-full h-8 text-xs gap-1.5 bg-primary hover:bg-primary/90 active:scale-[0.98] transition-all"
          disabled={createSessionMutation.isPending}
        >
          <Plus className="w-3.5 h-3.5" />
          New Chat
        </Button>
      </div>

      {/* Sessions */}
      <ScrollArea className="flex-1">
        <div className="p-2">
          {isLoading ? (
            <div className="space-y-1.5 px-1 py-2">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-12 bg-zinc-50 rounded-lg animate-pulse" />
              ))}
            </div>
          ) : sessions.length === 0 ? (
            <div className="text-center py-10 px-4">
              <div className="w-9 h-9 rounded-xl bg-zinc-50 flex items-center justify-center mx-auto mb-3">
                <MessageSquare className="w-4.5 h-4.5 text-zinc-300" />
              </div>
              <p className="text-xs font-medium text-zinc-500">No conversations yet</p>
              <p className="text-xs text-zinc-400 mt-0.5">Start a new chat above</p>
            </div>
          ) : (
            sessions.map((session) => (
              <div
                key={session.id}
                className={`group rounded-lg px-3 py-2.5 cursor-pointer transition-colors mb-0.5 ${
                  currentSessionId === session.id
                    ? "bg-blue-50 border border-blue-100"
                    : "hover:bg-zinc-50 border border-transparent"
                }`}
                onClick={() => onSessionSelect(session.id)}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    {editingSessionId === session.id ? (
                      <Input
                        value={editingTitle}
                        onChange={(e) => setEditingTitle(e.target.value)}
                        onBlur={handleSaveEdit}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleSaveEdit();
                          if (e.key === "Escape") handleCancelEdit();
                        }}
                        className="h-6 text-xs px-1.5 bg-white"
                        autoFocus
                        onClick={(e) => e.stopPropagation()}
                      />
                    ) : (
                      <>
                        <p className={`text-xs font-medium truncate ${
                          currentSessionId === session.id ? "text-primary" : "text-zinc-700"
                        }`}>
                          {session.title}
                        </p>
                        <p className="text-xs text-zinc-400 mt-0.5">
                          {format(new Date(session.updatedAt), "MMM d, h:mm a")}
                        </p>
                      </>
                    )}
                  </div>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="opacity-0 group-hover:opacity-100 h-6 w-6 p-0 text-zinc-400 hover:text-zinc-700 shrink-0"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <MoreVertical className="w-3.5 h-3.5" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-36">
                      <DropdownMenuItem
                        onClick={(e) => { e.stopPropagation(); handleEditSession(session); }}
                        className="text-xs gap-2"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                        Rename
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={(e) => { e.stopPropagation(); handleDeleteSession(session.id); }}
                        className="text-xs gap-2 text-red-600 focus:text-red-600"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            ))
          )}
        </div>
      </ScrollArea>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-zinc-100 shrink-0">
        <p className="text-xs text-zinc-400">
          {sessions.length} conversation{sessions.length !== 1 ? "s" : ""}
        </p>
      </div>
    </div>
  );
}
