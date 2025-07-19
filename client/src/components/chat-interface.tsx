import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useChat } from "@/hooks/use-chat";
import { useDocuments } from "@/hooks/use-documents";
import { useToast } from "@/hooks/use-toast";
import { Bot, User, Send, Paperclip, Mic, Trash2, FileText, Loader2, Upload } from "lucide-react";
import { type ChatMessage } from "@shared/schema";

interface ChatInterfaceProps {
  sessionId?: number;
}

export function ChatInterface({ sessionId }: ChatInterfaceProps) {
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [stagedFiles, setStagedFiles] = useState<File[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { messages, isLoading, sendMessage, clearMessages } = useChat(sessionId);
  const { uploadFiles } = useDocuments();
  const { toast } = useToast();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!input.trim() && stagedFiles.length === 0) || isLoading) return;

    const message = input.trim();
    const filesToUpload = [...stagedFiles];
    
    // Clear input and staged files
    setInput("");
    setStagedFiles([]);
    setIsTyping(true);

    try {
      // If there are files to upload, upload them first
      if (filesToUpload.length > 0) {
        setIsUploading(true);
        const fileNames = filesToUpload.map(f => f.name).join(', ');
        
        // Create a proper FileList from the staged files
        const formData = new FormData();
        filesToUpload.forEach(file => {
          formData.append('files', file);
        });
        
        // Upload files using the form data approach directly
        try {
          const response = await fetch("/api/documents/upload", {
            method: "POST",
            body: formData,
            credentials: "include",
          });

          if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || "Upload failed");
          }

          const result = await response.json();
          
          // Show success toast
          toast({
            title: "✅ Documents processed successfully",
            description: `${result.documents.length} documents analyzed and ready for questions`,
          });
          
          // Send message with file context
          const fileMessage = message 
            ? `${message}\n\n[Attached files: ${fileNames}]`
            : `Please analyze the uploaded files: ${fileNames}`;
          
          await sendMessage(fileMessage);
        } catch (error) {
          toast({
            title: "Upload failed",
            description: error.message,
            variant: "destructive",
          });
          await sendMessage(`❌ Failed to upload files: ${error.message}`);
        }
      } else {
        // Just send the message
        await sendMessage(message);
      }
    } finally {
      setIsTyping(false);
      setIsUploading(false);
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
      const newFiles = Array.from(files);
      
      // Filter for PDF files only
      const pdfFiles = newFiles.filter(file => file.type === 'application/pdf');
      
      if (pdfFiles.length !== newFiles.length) {
        toast({
          title: "Invalid files",
          description: "Only PDF files are supported",
          variant: "destructive",
        });
      }
      
      if (pdfFiles.length > 0) {
        // Stage the files instead of immediately uploading
        setStagedFiles(prev => [...prev, ...pdfFiles]);
      }
      
      // Reset the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // Only set isDragOver to false if we're leaving the container
    if (e.currentTarget === e.target) {
      setIsDragOver(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileUpload(files);
    }
  };

  const removeStagedFile = (index: number) => {
    setStagedFiles(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="flex flex-col h-full relative">
      {/* Chat Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Product Information Chat
            </h2>
            <p className="text-sm text-gray-500">
              {isUploading ? (
                <span className="flex items-center">
                  <Loader2 className="w-3 h-3 animate-spin mr-1" />
                  Processing uploaded documents...
                </span>
              ) : stagedFiles.length > 0 ? (
                <span className="flex items-center">
                  <FileText className="w-3 h-3 mr-1 text-blue-600" />
                  {stagedFiles.length} file{stagedFiles.length > 1 ? 's' : ''} ready to upload
                </span>
              ) : (
                "Ask questions about roofing systems, membranes, and specifications"
              )}
            </p>
          </div>
          <div className="flex items-center space-x-2">
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
          <div>
            <WelcomeMessage />
            {stagedFiles.length === 0 && (
              <div className="mt-6 p-4 border border-dashed border-gray-200 rounded-lg bg-gray-50/50 text-center">
                <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600">Drag & drop PDF files into the text box below or use the upload button</p>
              </div>
            )}
          </div>
        ) : (
          messages.map((message) => (
            <MessageBubble key={message.id} message={message} />
          ))
        )}

        {(isLoading || isTyping || isUploading) && (
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
              <Bot className="text-white w-4 h-4" />
            </div>
            <div className="flex-1">
              <Card className="bg-gray-50">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <Loader2 className="w-4 h-4 animate-spin text-primary" />
                    <span className="text-gray-600">
                      {isUploading ? "Processing uploaded documents..." : "Processing your query..."}
                    </span>
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
        {/* Staged Files Display */}
        {stagedFiles.length > 0 && (
          <div className="mb-3 p-3 bg-blue-50 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-blue-900">
                Files ready to upload ({stagedFiles.length})
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {stagedFiles.map((file, index) => (
                <div key={index} className="flex items-center gap-2 bg-white px-3 py-1 rounded-full text-sm">
                  <FileText className="w-3 h-3 text-blue-600" />
                  <span className="text-gray-700">{file.name}</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-4 w-4 p-0 text-gray-400 hover:text-red-500"
                    onClick={() => removeStagedFile(index)}
                  >
                    ×
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}




        
        <form onSubmit={handleSubmit} className="flex items-end space-x-3">
          <div className="flex-1">
            <div className="relative">
              <div className="relative">
                <Textarea
                  ref={textareaRef}
                  placeholder={stagedFiles.length > 0 
                    ? "Ask a question about the files you've attached, or just hit Send to analyze them..."
                    : "Ask about product specifications, membrane types, warranties, or drag & drop PDF files here..."
                  }
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={`resize-none pr-20 transition-all duration-200 ${
                    isDragOver ? 'border-blue-500 bg-blue-50 border-2' : ''
                  }`}
                  rows={3}
                />
                {/* Drag overlay for textarea */}
                {isDragOver && (
                  <div className="absolute inset-0 border-2 border-blue-400 border-dashed rounded-md bg-blue-100 bg-opacity-50 flex items-center justify-center pointer-events-none">
                    <div className="text-center">
                      <Upload className="w-8 h-8 text-blue-600 mx-auto mb-1" />
                      <p className="text-sm font-medium text-blue-700">Drop PDF files</p>
                    </div>
                  </div>
                )}
              </div>
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
            disabled={(!input.trim() && stagedFiles.length === 0) || isLoading}
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
