import { useState } from "react";
import { format } from "date-fns";
import { 
  MessageSquare, 
  Plus, 
  MoreVertical, 
  Edit2, 
  Trash2,
  History,
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
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
  onNewSession 
}: ChatHistorySidebarProps) {
  const [editingSessionId, setEditingSessionId] = useState<number | null>(null);
  const [editingTitle, setEditingTitle] = useState("");

  const { data: sessions = [], isLoading } = useChatSessions();
  const createSessionMutation = useCreateChatSession();
  const updateSessionMutation = useUpdateChatSession();
  const deleteSessionMutation = useDeleteChatSession();

  const handleCreateSession = async () => {
    const newSession = await createSessionMutation.mutateAsync({
      title: `New Chat ${sessions.length + 1}`,
    });
    onSessionSelect(newSession.id);
  };

  const handleEditSession = (session: ChatSession) => {
    setEditingSessionId(session.id);
    setEditingTitle(session.title);
  };

  const handleSaveEdit = async () => {
    if (editingSessionId && editingTitle.trim()) {
      await updateSessionMutation.mutateAsync({
        id: editingSessionId,
        data: { title: editingTitle.trim() },
      });
      setEditingSessionId(null);
      setEditingTitle("");
    }
  };

  const handleCancelEdit = () => {
    setEditingSessionId(null);
    setEditingTitle("");
  };

  const handleDeleteSession = async (sessionId: number) => {
    await deleteSessionMutation.mutateAsync(sessionId);
    if (currentSessionId === sessionId) {
      onNewSession();
    }
  };

  const truncateTitle = (title: string, maxLength: number = 25) => {
    return title.length > maxLength ? title.substring(0, maxLength) + "..." : title;
  };

  return (
    <div className={`
      bg-gray-900 text-white transition-all duration-300 ease-in-out
      ${isOpen ? "w-80" : "w-0"}
      flex flex-col overflow-hidden
    `}>
      {/* Header */}
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <History className="w-5 h-5" />
            <h2 className="text-lg font-semibold">Chat History</h2>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-gray-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* New Chat Button */}
      <div className="p-4 border-b border-gray-700">
        <Button
          onClick={handleCreateSession}
          className="w-full bg-gray-800 hover:bg-gray-700 border border-gray-600"
          disabled={createSessionMutation.isPending}
        >
          <Plus className="w-4 h-4 mr-2" />
          New Chat
        </Button>
      </div>

      {/* Sessions List */}
      <ScrollArea className="flex-1">
        <div className="p-2 space-y-1">
          {isLoading ? (
            <div className="text-center text-gray-400 py-8">
              Loading sessions...
            </div>
          ) : sessions.length === 0 ? (
            <div className="text-center text-gray-400 py-8">
              <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>No chat sessions yet</p>
              <p className="text-sm">Start a new conversation</p>
            </div>
          ) : (
            sessions.map((session) => (
              <div
                key={session.id}
                className={`
                  group rounded-lg p-3 cursor-pointer transition-colors
                  ${currentSessionId === session.id 
                    ? "bg-gray-700 border border-gray-600" 
                    : "hover:bg-gray-800"
                  }
                `}
                onClick={() => onSessionSelect(session.id)}
              >
                <div className="flex items-center justify-between">
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
                        className="bg-gray-800 border-gray-600 text-white text-sm"
                        autoFocus
                        onClick={(e) => e.stopPropagation()}
                      />
                    ) : (
                      <div>
                        <p className="font-medium text-sm truncate">
                          {truncateTitle(session.title)}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          {format(new Date(session.updatedAt), "MMM d, h:mm a")}
                        </p>
                      </div>
                    )}
                  </div>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-white p-1"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      align="end"
                      className="bg-gray-800 border-gray-600"
                    >
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditSession(session);
                        }}
                        className="text-white hover:bg-gray-700"
                      >
                        <Edit2 className="w-4 h-4 mr-2" />
                        Rename
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteSession(session.id);
                        }}
                        className="text-red-400 hover:bg-red-900/20"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
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
      <div className="p-4 border-t border-gray-700">
        <div className="flex items-center justify-between text-xs text-gray-400">
          <span>{sessions.length} conversations</span>
          <Badge variant="outline" className="text-xs">
            Product Assistant
          </Badge>
        </div>
      </div>
    </div>
  );
}