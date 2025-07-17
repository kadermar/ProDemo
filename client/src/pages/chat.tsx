import { useState } from "react";
import { DocumentLibrary } from "@/components/document-library";
import { ChatInterface } from "@/components/chat-interface";
import { Search, Settings, FolderOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";

export default function ChatPage() {
  const [isLibraryOpen, setIsLibraryOpen] = useState(true);
  const isMobile = useIsMobile();

  const toggleLibrary = () => {
    setIsLibraryOpen(!isLibraryOpen);
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Search className="text-white w-4 h-4" />
            </div>
            <h1 className="text-xl font-semibold text-gray-900">
              Product Information Assistant
            </h1>
          </div>
          <div className="flex items-center space-x-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleLibrary}
              className="text-gray-600 hover:text-primary"
            >
              <FolderOpen className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Document Library</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-gray-600 hover:text-primary"
            >
              <Settings className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      <div className="flex flex-1 max-w-7xl mx-auto w-full overflow-hidden">
        {/* Document Library Sidebar */}
        <div
          className={`${
            isLibraryOpen ? "w-80" : "w-0"
          } transition-all duration-300 ease-in-out overflow-hidden ${
            isMobile ? "absolute inset-y-0 left-0 z-50" : ""
          }`}
        >
          <DocumentLibrary
            isOpen={isLibraryOpen}
            onClose={() => setIsLibraryOpen(false)}
          />
        </div>

        {/* Main Chat Interface */}
        <div className="flex-1 flex flex-col bg-white">
          <ChatInterface />
        </div>
      </div>
    </div>
  );
}
