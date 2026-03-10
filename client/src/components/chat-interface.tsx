import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ProductModal } from "@/components/product-modal";
import { useChat } from "@/hooks/use-chat";
import { useDocuments } from "@/hooks/use-documents";
import { useProducts } from "@/hooks/use-products";
import { useToast } from "@/hooks/use-toast";
import { Send, Mic, Trash2, FileText, Loader2, Upload, ExternalLink, X } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { type ChatMessage, type ProductData } from "@shared/schema";
import botLogo from "@assets/image_1754430429145.png";

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
    if (source.type === "product") {
      const product = products?.find((p) => p.id === source.id);
      if (product) setSelectedProduct(product);
    } else if (source.type === "document") {
      toast({ title: "Document Reference", description: `Opening: ${source.title}` });
    }
  };

  useEffect(() => {
    scrollToBottom();
    if (messages.length === 0) setShowQuickQueries(true);
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!input.trim() && stagedFiles.length === 0) || isLoading) return;

    const message = input.trim();
    const filesToUpload = [...stagedFiles];
    setInput("");
    setStagedFiles([]);
    setIsTyping(true);

    try {
      if (filesToUpload.length > 0) {
        setIsUploading(true);
        const fileNames = filesToUpload.map((f) => f.name).join(", ");
        const formData = new FormData();
        filesToUpload.forEach((file) => formData.append("files", file));

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
          toast({
            title: "Documents processed",
            description: `${result.documents.length} documents analyzed and ready`,
          });

          const fileMessage = message
            ? `${message}\n\n[Attached files: ${fileNames}]`
            : `Please analyze the uploaded files: ${fileNames}`;
          await sendMessage(fileMessage);
        } catch (error: any) {
          toast({ title: "Upload failed", description: error.message, variant: "destructive" });
          await sendMessage(`Failed to upload files: ${error.message}`);
        }
      } else {
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
    "Best TPO membrane for extreme weather?",
    "PVC products for chemical-resistant applications",
    "EPDM solutions with longest warranty",
    "Walkway products with superior slip resistance",
    "Compare primer options for membrane installs",
  ];

  const handleQuickQuery = async (query: string) => {
    setInput("");
    setShowQuickQueries(false);
    await sendMessage(query);
  };

  const handleFileUpload = (files: FileList) => {
    if (files.length > 0) {
      setStagedFiles((prev) => [...prev, ...Array.from(files)]);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const removeStagedFile = (index: number) => {
    setStagedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-5 py-3.5 border-b border-zinc-100 flex items-center justify-between shrink-0">
        <div>
          <h2 className="text-sm font-semibold text-zinc-900 tracking-tight">
            Product Information Assistant
          </h2>
          <p className="text-xs text-zinc-400 mt-0.5">
            {isUploading ? (
              <span className="flex items-center gap-1">
                <Loader2 className="w-3 h-3 animate-spin" />
                Processing documents...
              </span>
            ) : stagedFiles.length > 0 ? (
              <span className="flex items-center gap-1 text-primary">
                <FileText className="w-3 h-3" />
                {stagedFiles.length} file{stagedFiles.length > 1 ? "s" : ""} staged
              </span>
            ) : (
              "Roofing systems · Membranes · Specifications"
            )}
          </p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={clearMessages}
          className="text-zinc-400 hover:text-zinc-700 text-xs gap-1.5 h-8"
        >
          <Trash2 className="w-3.5 h-3.5" />
          Clear
        </Button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-5 py-5 space-y-5 min-h-0">
        {messages.length === 0 ? (
          <WelcomeMessage />
        ) : (
          messages.map((message) => (
            <MessageBubble key={message.id} message={message} onSourceClick={handleSourceClick} />
          ))
        )}

        {(isLoading || isTyping || isUploading) && (
          <div className="flex items-start gap-3">
            <div className="w-7 h-7 rounded-full overflow-hidden shrink-0 ring-1 ring-zinc-100">
              <img src={botLogo} alt="Assistant" className="w-7 h-7 object-cover" />
            </div>
            <div className="bg-zinc-50 border border-zinc-100 rounded-xl rounded-tl-sm px-4 py-3 text-sm text-zinc-500 flex items-center gap-2">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-primary shrink-0" />
              {isUploading ? "Processing documents..." : "Searching specifications..."}
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="border-t border-zinc-100 p-4 shrink-0">
        {/* Staged Files */}
        {stagedFiles.length > 0 && (
          <div className="mb-3 flex flex-wrap gap-2">
            {stagedFiles.map((file, index) => (
              <div
                key={index}
                className="flex items-center gap-1.5 bg-blue-50 border border-blue-200 text-blue-700 px-2.5 py-1 rounded-full text-xs"
              >
                <FileText className="w-3 h-3 shrink-0" />
                <span className="max-w-[140px] truncate">{file.name}</span>
                <button
                  type="button"
                  onClick={() => removeStagedFile(index)}
                  className="text-blue-400 hover:text-blue-700 transition-colors ml-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex items-end gap-2">
          <div className="flex-1 relative">
            <Textarea
              ref={textareaRef}
              placeholder={
                stagedFiles.length > 0
                  ? "Ask about attached files, or send to analyze..."
                  : "Ask about specifications, warranties, membrane types..."
              }
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              className="resize-none pr-20 text-sm min-h-[72px] bg-zinc-50 border-zinc-200 focus-visible:ring-1 focus-visible:ring-primary/30 focus-visible:border-primary/50 rounded-xl placeholder:text-zinc-400"
              rows={3}
            />
            <div className="absolute bottom-2.5 right-2.5 flex items-center gap-1">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading || isLoading}
                title="Upload PDF"
                className="p-1.5 text-zinc-400 hover:text-primary disabled:opacity-40 rounded-lg hover:bg-blue-50 transition-colors"
              >
                {isUploading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Upload className="w-4 h-4" />
                )}
              </button>
              <button
                type="button"
                className="p-1.5 text-zinc-400 hover:text-zinc-600 rounded-lg hover:bg-zinc-100 transition-colors"
              >
                <Mic className="w-4 h-4" />
              </button>
            </div>
          </div>
          <Button
            type="submit"
            disabled={(!input.trim() && stagedFiles.length === 0) || isLoading}
            className="h-[72px] px-4 rounded-xl active:scale-[0.97] transition-transform"
          >
            <Send className="w-4 h-4" />
          </Button>
        </form>

        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf"
          multiple
          className="hidden"
          onChange={(e) => e.target.files && handleFileUpload(e.target.files)}
        />

        {/* Quick Queries */}
        {(messages.length === 0 || showQuickQueries) && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {quickQueries.map((query) => (
              <button
                key={query}
                onClick={() => handleQuickQuery(query)}
                className="text-xs text-zinc-500 hover:text-primary border border-zinc-200 hover:border-primary/40 bg-white hover:bg-blue-50 px-3 py-1.5 rounded-full transition-all active:scale-[0.97]"
              >
                {query}
              </button>
            ))}
          </div>
        )}
      </div>

      <ProductModal product={selectedProduct} onClose={() => setSelectedProduct(null)} />
    </div>
  );
}

function WelcomeMessage() {
  return (
    <div className="flex items-start gap-3">
      <div className="w-7 h-7 rounded-full overflow-hidden shrink-0 ring-1 ring-zinc-100">
        <img src={botLogo} alt="Assistant" className="w-7 h-7 object-cover" />
      </div>
      <div className="bg-zinc-50 border border-zinc-100 rounded-xl rounded-tl-sm px-4 py-3.5 max-w-lg">
        <p className="text-sm text-zinc-700 font-medium mb-2.5">
          Hello — what can I help you find today?
        </p>
        <ul className="text-xs text-zinc-500 space-y-1.5">
          {[
            "Membrane types, thicknesses, and applications",
            "Warranty information and coverage details",
            "Building height requirements and restrictions",
            "Insulation types and installation methods",
            "Comparative analysis between systems",
          ].map((item) => (
            <li key={item} className="flex items-start gap-2">
              <span className="w-1 h-1 rounded-full bg-zinc-300 mt-1.5 shrink-0" />
              {item}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function MessageBubble({
  message,
  onSourceClick,
}: {
  message: ChatMessage;
  onSourceClick: (source: any) => void;
}) {
  const isUser = message.role === "user";
  const sources =
    (message.sources as Array<{
      type: "product" | "document";
      id: number;
      title: string;
      relevance: number;
      excerpt: string;
    }>) || [];

  if (isUser) {
    return (
      <div className="flex justify-end">
        <div className="bg-slate-800 text-white px-4 py-3 rounded-xl rounded-tr-sm max-w-[75%] text-sm leading-relaxed">
          {message.content}
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-start gap-3">
      <div className="w-7 h-7 rounded-full overflow-hidden shrink-0 ring-1 ring-zinc-100 mt-0.5">
        <img src={botLogo} alt="Assistant" className="w-7 h-7 object-cover" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="bg-zinc-50 border border-zinc-100 rounded-xl rounded-tl-sm px-4 py-3.5 text-sm text-zinc-800 leading-relaxed prose prose-sm prose-zinc max-w-none">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
              ul: ({ children }) => <ul className="list-disc pl-4 mb-2 space-y-0.5">{children}</ul>,
              ol: ({ children }) => <ol className="list-decimal pl-4 mb-2 space-y-0.5">{children}</ol>,
              li: ({ children }) => <li className="leading-relaxed">{children}</li>,
              strong: ({ children }) => <strong className="font-semibold text-zinc-900">{children}</strong>,
              h1: ({ children }) => <h1 className="text-base font-semibold text-zinc-900 mt-3 mb-1">{children}</h1>,
              h2: ({ children }) => <h2 className="text-sm font-semibold text-zinc-900 mt-3 mb-1">{children}</h2>,
              h3: ({ children }) => <h3 className="text-sm font-medium text-zinc-900 mt-2 mb-1">{children}</h3>,
              code: ({ children }) => <code className="bg-zinc-200 text-zinc-800 px-1 py-0.5 rounded text-xs font-mono">{children}</code>,
              table: ({ children }) => <div className="overflow-x-auto mb-2"><table className="text-xs border-collapse w-full">{children}</table></div>,
              th: ({ children }) => <th className="border border-zinc-200 bg-zinc-100 px-2 py-1 text-left font-medium">{children}</th>,
              td: ({ children }) => <td className="border border-zinc-200 px-2 py-1">{children}</td>,
            }}
          >
            {message.content}
          </ReactMarkdown>
        </div>

        {sources.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {sources.map((source, index) => (
              <button
                key={index}
                onClick={() => onSourceClick(source)}
                className="inline-flex items-center gap-1 text-xs text-zinc-400 hover:text-primary border border-zinc-200 hover:border-primary/40 bg-white hover:bg-blue-50 px-2.5 py-1 rounded-full transition-all"
              >
                <FileText className="w-3 h-3" />
                {source.title}
                <ExternalLink className="w-2.5 h-2.5 opacity-60" />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
