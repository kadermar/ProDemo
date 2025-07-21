import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ProductModal } from "@/components/product-modal";
import { useChat } from "@/hooks/use-chat";
import { useDocuments } from "@/hooks/use-documents";
import { useProducts } from "@/hooks/use-products";
import { useToast } from "@/hooks/use-toast";
import { Bot, User, Send, Paperclip, Mic, Trash2, FileText, Loader2, Upload, ExternalLink } from "lucide-react";
import { type ChatMessage, type ProductData } from "@shared/schema";

interface ChatInterfaceProps {
  sessionId?: number;
}

export function ChatInterface({ sessionId }: ChatInterfaceProps) {
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [stagedFiles, setStagedFiles] = useState<File[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<ProductData | null>(null);
  const [showQuickQueries, setShowQuickQueries] = useState(true);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { messages, isLoading, sendMessage, clearMessages } = useChat(sessionId);
  const { uploadFiles } = useDocuments();
  const { products } = useProducts();
  const { documents } = useDocuments();
  const { toast } = useToast();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSourceClick = (source: any) => {
    if (source.type === 'product') {
      // Find the product from the products list
      const product = products?.find(p => p.id === source.id);
      if (product) {
        setSelectedProduct(product);
      }
    } else if (source.type === 'document') {
      // For documents, you could implement a document viewer
      // For now, we'll show a toast with the document name
      toast({
        title: "Document Reference",
        description: `Opening: ${source.title}`,
      });
    }
  };

  useEffect(() => {
    scrollToBottom();
    // Reset showQuickQueries when messages are cleared
    if (messages.length === 0) {
      setShowQuickQueries(true);
    }
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

  const handleQuickQuery = async (query: string) => {
    setInput("");
    setShowQuickQueries(false);
    
    // Send the query immediately
    await sendMessage(query);
  };

  const handleFileUpload = async (files: FileList) => {
    if (files.length > 0) {
      const newFiles = Array.from(files);
      
      // Stage the files instead of immediately uploading
      setStagedFiles(prev => [...prev, ...newFiles]);
      
      // Reset the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const removeStagedFile = (index: number) => {
    setStagedFiles(prev => prev.filter((_, i) => i !== index));
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
          <WelcomeMessage />
        ) : (
          messages.map((message) => (
            <MessageBubble key={message.id} message={message} onSourceClick={handleSourceClick} />
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
              <Textarea
                ref={textareaRef}
                placeholder={stagedFiles.length > 0 
                  ? "Ask a question about the files you've attached, or just hit Send to analyze them..."
                  : "Ask about product specifications, membrane types, warranties, or any roofing system questions..."
                }
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

        {/* Quick Actions - Only show when there are no messages or showQuickQueries is true */}
        {(messages.length === 0 || showQuickQueries) && (
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
        )}
      </div>

      {/* Product Modal */}
      <ProductModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
      />
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

function MessageBubble({ message, onSourceClick }: { 
  message: ChatMessage;
  onSourceClick: (source: any) => void;
}) {
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
                      onClick={() => onSourceClick(source)}
                      className="flex items-center text-sm text-carlisle-primary hover:text-carlisle-primary-dark transition-colors group"
                    >
                      <FileText className="w-3 h-3 mr-1" />
                      <span className="group-hover:underline">{source.title}</span>
                      <ExternalLink className="w-3 h-3 ml-1 opacity-50 group-hover:opacity-100" />
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
