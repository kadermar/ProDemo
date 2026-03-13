import { useState } from "react";
import { DocumentLibrary } from "@/components/document-library";
import { ChatInterface } from "@/components/chat-interface";
import { ChatHistorySidebar } from "@/components/chat-history-sidebar";
import { Settings, FolderOpen, History } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import { useSession } from "@/hooks/use-session";
import { ProNav } from "@/components/pro-nav";

export default function ChatPage() {
  const [isLibraryOpen, setIsLibraryOpen] = useState(true);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const isMobile = useIsMobile();
  const { sessionId: currentSessionId, newSession, switchSession } = useSession();
  const initialQuery = new URLSearchParams(window.location.search).get("q") ?? undefined;

  const handleSessionSelect = (sessionId: number) => {
    switchSession(sessionId);
    if (isMobile) setIsHistoryOpen(false);
  };

  const handleNewSession = async () => {
    await newSession();
    if (isMobile) setIsHistoryOpen(false);
  };

  return (
    <div className="flex flex-col h-screen bg-zinc-100" style={{ fontFamily: "'Outfit', sans-serif" }}>
      <ProNav active="chat" />

      {/* Chat toolbar */}
      <div className="bg-white border-b border-zinc-200 flex items-center justify-end gap-0.5 px-4 py-1 shrink-0">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsHistoryOpen(!isHistoryOpen)}
          className={`text-sm gap-1.5 ${isHistoryOpen ? "text-[#121212] bg-zinc-100" : "text-zinc-500 hover:text-[#121212]"}`}
        >
          <History className="w-4 h-4" />
          <span className="hidden sm:inline">History</span>
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsLibraryOpen(!isLibraryOpen)}
          className={`text-sm gap-1.5 ${isLibraryOpen ? "text-[#121212] bg-zinc-100" : "text-zinc-500 hover:text-[#121212]"}`}
        >
          <FolderOpen className="w-4 h-4" />
          <span className="hidden sm:inline">Library</span>
        </Button>
        <Button variant="ghost" size="sm" className="text-zinc-500 hover:text-[#121212]">
          <Settings className="w-4 h-4" />
        </Button>
      </div>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden p-3 gap-3">
        {/* History Sidebar */}
        <div
          className={`shrink-0 transition-all duration-300 ease-in-out overflow-hidden rounded-lg shadow-sm ${
            isHistoryOpen ? "w-72" : "w-0"
          } ${isMobile ? "absolute top-[169px] bottom-0 left-0 z-50" : ""}`}
        >
          <ChatHistorySidebar
            isOpen={isHistoryOpen}
            onClose={() => setIsHistoryOpen(false)}
            currentSessionId={currentSessionId}
            onSessionSelect={handleSessionSelect}
            onNewSession={handleNewSession}
          />
        </div>

        {/* Chat */}
        <div className="flex-1 flex flex-col bg-white rounded-lg overflow-hidden shadow-sm border border-zinc-200 min-w-0">
          <ChatInterface sessionId={currentSessionId} initialQuery={initialQuery} />
        </div>

        {/* Library Sidebar */}
        <div
          className={`shrink-0 transition-all duration-300 ease-in-out overflow-hidden rounded-lg shadow-sm ${
            isLibraryOpen ? "w-80" : "w-0"
          } ${isMobile ? "absolute top-[169px] bottom-0 right-0 z-50" : ""}`}
        >
          <div className="h-full flex flex-col bg-white border border-zinc-200 rounded-lg overflow-hidden">
            <DocumentLibrary
              isOpen={isLibraryOpen}
              onClose={() => setIsLibraryOpen(false)}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
