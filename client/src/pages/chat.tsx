import { useState } from "react";
import { DocumentLibrary } from "@/components/document-library";
import { ChatInterface } from "@/components/chat-interface";
import { ChatHistorySidebar } from "@/components/chat-history-sidebar";
import { Settings, FolderOpen, History } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import { useSession } from "@/hooks/use-session";
import logoImage from "@assets/image_1754430327349.png";

export default function ChatPage() {
  const [isLibraryOpen, setIsLibraryOpen] = useState(true);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const isMobile = useIsMobile();
  const { sessionId: currentSessionId, newSession, switchSession } = useSession();

  const handleSessionSelect = (sessionId: number) => {
    switchSession(sessionId);
    if (isMobile) setIsHistoryOpen(false);
  };

  const handleNewSession = async () => {
    await newSession();
    if (isMobile) setIsHistoryOpen(false);
  };

  return (
    <div className="flex flex-col h-screen bg-zinc-100">
      {/* Top Navigation */}
      <nav className="bg-slate-900 text-white shrink-0">
        <div className="flex items-center justify-between px-6 h-14">
          {/* Left: Logo + Nav Links */}
          <div className="flex items-center gap-8">
            <img
              src={logoImage}
              alt="Company Logo"
              className="h-7 w-auto object-contain brightness-0 invert opacity-90"
            />
            <div className="hidden md:flex items-center gap-0.5">
              {["Home", "Contacts", "Search", "Guides"].map((item) => (
                <button
                  key={item}
                  className="px-3 py-1.5 text-sm text-slate-400 hover:text-white rounded-md hover:bg-white/10 transition-colors"
                >
                  {item}
                </button>
              ))}
              <button className="px-3 py-1.5 text-sm text-white font-medium rounded-md bg-white/15">
                Chat
              </button>
            </div>
          </div>

          {/* Right: Controls */}
          <div className="flex items-center gap-0.5">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsHistoryOpen(!isHistoryOpen)}
              className={`text-sm gap-1.5 ${
                isHistoryOpen
                  ? "text-white bg-white/15"
                  : "text-slate-400 hover:text-white hover:bg-white/10"
              }`}
            >
              <History className="w-4 h-4" />
              <span className="hidden sm:inline">History</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsLibraryOpen(!isLibraryOpen)}
              className={`text-sm gap-1.5 ${
                isLibraryOpen
                  ? "text-white bg-white/15"
                  : "text-slate-400 hover:text-white hover:bg-white/10"
              }`}
            >
              <FolderOpen className="w-4 h-4" />
              <span className="hidden sm:inline">Library</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-slate-400 hover:text-white hover:bg-white/10"
            >
              <Settings className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden p-3 gap-3">
        {/* History Sidebar */}
        <div
          className={`shrink-0 transition-all duration-300 ease-in-out overflow-hidden rounded-lg shadow-sm ${
            isHistoryOpen ? "w-72" : "w-0"
          } ${isMobile ? "absolute inset-y-14 left-0 z-50" : ""}`}
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
          <ChatInterface sessionId={currentSessionId} />
        </div>

        {/* Library Sidebar */}
        <div
          className={`shrink-0 transition-all duration-300 ease-in-out overflow-hidden rounded-lg shadow-sm ${
            isLibraryOpen ? "w-80" : "w-0"
          } ${isMobile ? "absolute inset-y-14 right-0 z-50" : ""}`}
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
