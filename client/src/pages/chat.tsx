import { useState } from "react";
import { DocumentLibrary } from "@/components/document-library";
import { ChatInterface } from "@/components/chat-interface";
import { ChatHistorySidebar } from "@/components/chat-history-sidebar";
import { Search, Settings, FolderOpen, History } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";

export default function ChatPage() {
  const [isLibraryOpen, setIsLibraryOpen] = useState(true);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [currentSessionId, setCurrentSessionId] = useState<number | undefined>(undefined);
  const isMobile = useIsMobile();

  const toggleLibrary = () => {
    setIsLibraryOpen(!isLibraryOpen);
  };

  const toggleHistory = () => {
    setIsHistoryOpen(!isHistoryOpen);
  };

  const handleSessionSelect = (sessionId: number) => {
    setCurrentSessionId(sessionId);
    if (isMobile) {
      setIsHistoryOpen(false);
    }
  };

  const handleNewSession = () => {
    setCurrentSessionId(undefined);
    if (isMobile) {
      setIsHistoryOpen(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-neutral">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 px-4 py-4">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-carlisle-primary rounded-lg flex items-center justify-center shadow-sm">
              <Search className="text-white w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-carlisle-navy">
                Roofing Product Information Assistant
              </h1>
              <p className="text-sm text-gray-600">Powered by Carlisle SynTec Systems</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleHistory}
              className="text-gray-600 hover:text-carlisle-primary"
            >
              <History className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Chat History</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleLibrary}
              className="text-gray-600 hover:text-carlisle-primary"
            >
              <FolderOpen className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Document Library</span>
            </Button>

            <Button
              variant="ghost"
              size="sm"
              className="text-gray-600 hover:text-carlisle-primary"
            >
              <Settings className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      <div className="flex flex-1 max-w-7xl mx-auto w-full overflow-hidden">
        {/* Chat History Sidebar */}
        <div
          className={`${
            isHistoryOpen ? "w-80" : "w-0"
          } transition-all duration-300 ease-in-out overflow-hidden ${
            isMobile ? "absolute inset-y-0 left-0 z-50" : ""
          }`}
        >
          <ChatHistorySidebar
            isOpen={isHistoryOpen}
            onClose={() => setIsHistoryOpen(false)}
            currentSessionId={currentSessionId}
            onSessionSelect={handleSessionSelect}
            onNewSession={handleNewSession}
          />
        </div>

        {/* Main Chat Interface */}
        <div className="flex-1 flex flex-col bg-white">
          <ChatInterface sessionId={currentSessionId} />
        </div>

        {/* Document Library Sidebar */}
        <div
          className={`${
            isLibraryOpen ? "w-80" : "w-0"
          } transition-all duration-300 ease-in-out overflow-hidden ${
            isMobile ? "absolute inset-y-0 right-0 z-50" : ""
          }`}
        >
          <DocumentLibrary
            isOpen={isLibraryOpen}
            onClose={() => setIsLibraryOpen(false)}
          />
        </div>
      </div>
    </div>
  );
}
