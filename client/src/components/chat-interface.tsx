import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useChat } from "@/hooks/use-chat";
import { useDocuments } from "@/hooks/use-documents";
import { Bot, User, Send, Paperclip, Mic, History, Trash2, FileText, Loader2, Upload } from "lucide-react";
import { type ChatMessage } from "@shared/schema";

export function ChatInterface() {
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { messages, isLoading, sendMessage, clearMessages } = useChat();
  const { uploadFiles } = useDocuments();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const message = input.trim();
    setInput("");
    setIsTyping(true);

    try {
      await sendMessage(message);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const quickQueries = [
    "Which TPO membrane offers the best durability for extreme weather?",
    "What are the differences between Sure-Weld and Spectro-Weld systems?",
    "Show me PVC products ideal for chemical-resistant applications",
    "Which EPDM solutions provide the longest warranty coverage?",
    "What walkway products offer superior slip resistance?",
    "Compare primer options for different membrane installations"
  ];

  const handleQuickQuery = (query: string) => {
    setInput(query);
    textareaRef.current?.focus();
  };

  const handleFileUpload = async (files: FileList) => {
    if (files.length > 0) {
      setIsUploading(true);
      try {
        await uploadFiles(files);
        // Add a message to the chat indicating files were uploaded
        const fileNames = Array.from(files).map(f => f.name).join(', ');
        await sendMessage(`I've uploaded ${files.length} file(s): ${fileNames}. Please analyze these documents.`);
      } catch (error) {
        console.error('File upload failed:', error);
        await sendMessage(`Failed to upload files. Please try again.`);
      } finally {
        setIsUploading(false);
        // Reset the file input
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Chat Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Product Information Chat
            </h2>
            <p className="text-sm text-gray-500">
              Ask questions about roofing systems, membranes, and specifications
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              className="text-gray-600 hover:text-primary"
            >
              <History className="w-4 h-4 mr-1" />
              History
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={clearMessages}
              className="text-gray-600 hover:text-primary"
            >
              <Trash2 className="w-4 h-4 mr-1" />
              Clear
            </Button>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {messages.length === 0 ? (
          <WelcomeMessage />
        ) : (
          messages.map((message) => (
            <MessageBubble key={message.id} message={message} />
          ))
        )}

        {(isLoading || isTyping) && (
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
              <Bot className="text-white w-4 h-4" />
            </div>
            <div className="flex-1">
              <Card className="bg-gray-50">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <Loader2 className="w-4 h-4 animate-spin text-primary" />
                    <span className="text-gray-600">Processing your query...</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Chat Input */}
      <div className="border-t border-gray-200 p-4">
        <form onSubmit={handleSubmit} className="flex items-end space-x-3">
          <div className="flex-1">
            <div className="relative">
              <Textarea
                ref={textareaRef}
                placeholder="Ask about product specifications, membrane types, warranties, or any roofing system questions..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                className="resize-none pr-20"
                rows={3}
              />
              <div className="absolute bottom-3 right-3 flex items-center space-x-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="text-blue-500 hover:text-blue-700 hover:bg-blue-50 disabled:opacity-50"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading || isLoading}
                  title="Upload PDF documents"
                >
                  {isUploading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Upload className="w-4 h-4" />
                  )}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="text-gray-400 hover:text-gray-600"
                >
                  <Mic className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
          <Button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="px-6 py-3"
          >
            <Send className="w-4 h-4 mr-2" />
            Send
          </Button>
        </form>

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf"
          multiple
          className="hidden"
          onChange={(e) => {
            if (e.target.files) {
              handleFileUpload(e.target.files);
            }
          }}
        />

        {/* Upload Status */}
        {isUploading && (
          <div className="mt-3 flex items-center text-sm text-blue-600">
            <Loader2 className="w-4 h-4 animate-spin mr-2" />
            Uploading files...
          </div>
        )}

        {/* Quick Actions */}
        <div className="mt-3 flex flex-wrap gap-2">
          {quickQueries.map((query) => (
            <Button
              key={query}
              variant="outline"
              size="sm"
              onClick={() => handleQuickQuery(query)}
              className="text-sm"
            >
              {query}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}

function WelcomeMessage() {
  return (
    <div className="flex items-start space-x-3">
      <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
        <Bot className="text-white w-4 h-4" />
      </div>
      <div className="flex-1">
        <Card className="bg-gray-50">
          <CardContent className="p-4">
            <p className="text-gray-900 mb-2">
              Welcome to the Product Information Assistant! I can help you with:
            </p>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Roofing system specifications and requirements</li>
              <li>• Membrane types, thicknesses, and applications</li>
              <li>• Warranty information and coverage details</li>
              <li>• Building height requirements and restrictions</li>
              <li>• Insulation types and installation methods</li>
              <li>• Comparative analysis between different systems</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function MessageBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === "user";
  const sources = message.sources as Array<{
    type: 'product' | 'document';
    id: number;
    title: string;
    relevance: number;
    excerpt: string;
  }> || [];

  return (
    <div className={`flex items-start space-x-3 ${isUser ? "justify-end" : ""}`}>
      {!isUser && (
        <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
          <Bot className="text-white w-4 h-4" />
        </div>
      )}
      
      <div className={`flex-1 ${isUser ? "max-w-2xl" : ""}`}>
        <Card className={`${isUser ? "bg-primary text-white ml-12" : "bg-gray-50"}`}>
          <CardContent className="p-4">
            <div className="whitespace-pre-wrap">{message.content}</div>
            
            {sources.length > 0 && (
              <div className="mt-4 pt-3 border-t border-gray-200">
                <h4 className="font-medium text-gray-900 mb-2">Sources:</h4>
                <div className="space-y-1">
                  {sources.map((source, index) => (
                    <button
                      key={index}
                      className="block text-sm text-primary hover:text-primary-dark transition-colors"
                    >
                      <FileText className="w-3 h-3 inline mr-1" />
                      {source.title}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      {isUser && (
        <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center flex-shrink-0">
          <User className="text-gray-600 w-4 h-4" />
        </div>
      )}
    </div>
  );
}
