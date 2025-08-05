import { useState } from "react";
import { DocumentLibrary } from "@/components/document-library";
import { ChatInterface } from "@/components/chat-interface";
import { ChatHistorySidebar } from "@/components/chat-history-sidebar";
import { Search, Settings, FolderOpen, History } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import logoImage from "@assets/image_1754430327349.png";

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
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Top Navigation Bar */}
      <nav className="bg-gradient-to-r from-slate-800 to-slate-900 text-white px-6 py-3">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center space-x-8">
            <div className="flex items-center space-x-3">
              <img 
                src={logoImage} 
                alt="Company Logo" 
                className="h-8 w-auto object-contain brightness-0 invert"
              />
              
            </div>
            <div className="hidden md:flex items-center space-x-6">
              <button className="text-gray-300 hover:text-white transition-colors">Home</button>
              <button className="text-gray-300 hover:text-white transition-colors">Contacts</button>
              <button className="text-gray-300 hover:text-white transition-colors">Search</button>
              <button className="text-gray-300 hover:text-white transition-colors">Guides</button>
              <button className="text-white font-semibold border-b-2 border-blue-400 pb-1">Chat</button>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={toggleHistory}
              className="text-white hover:bg-slate-700 hover:text-white"
            >
              <History className="w-4 h-4 mr-1" />
              <span className="hidden sm:inline">Chat History</span>
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={toggleLibrary}
              className="text-white hover:bg-slate-700 hover:text-white"
            >
              <FolderOpen className="w-4 h-4 mr-1" />
              <span className="hidden sm:inline">Document Library</span>
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-white hover:bg-slate-700 hover:text-white"
            >
              <Settings className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </nav>

      {/* Page Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Roofing Product Information Assistant</h1>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex flex-1 max-w-7xl mx-auto w-full bg-white rounded-lg shadow-sm m-6 overflow-hidden">
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
          <div className="flex-1">
            <ChatInterface sessionId={currentSessionId} />
          </div>
        </div>

        {/* Product Library Sidebar */}
        <div
          className={`${
            isLibraryOpen ? "w-96" : "w-0"
          } transition-all duration-300 ease-in-out overflow-hidden border-l border-gray-200 bg-gray-50 ${
            isMobile ? "absolute inset-y-0 right-0 z-50" : ""
          }`}
        >
          <div className="h-full flex flex-col">
            
            <div className="flex-1">
              <DocumentLibrary
                isOpen={isLibraryOpen}
                onClose={() => setIsLibraryOpen(false)}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
