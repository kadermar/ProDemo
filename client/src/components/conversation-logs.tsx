import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { Download, BarChart3, MessageSquare, Clock, FileText, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ConversationAnalytics {
  totalSessions: number;
  totalMessages: number;
  userMessages: number;
  assistantMessages: number;
  averageMessagesPerSession: string;
  sessionsWithActivity: number;
  totalWordCount: number;
  avgWordsPerMessage: string;
  recentSessions: Array<{
    id: number;
    title: string;
    messageCount: number;
    createdAt: string;
    updatedAt: string;
  }>;
  recentMessages: Array<{
    id: number;
    sessionId: number | null;
    content: string;
    role: string;
    wordCount: number | null;
    createdAt: string;
  }>;
}

export function ConversationLogs() {
  const [exportFormat, setExportFormat] = useState<"json" | "csv">("json");

  const { data: analytics, isLoading } = useQuery<ConversationAnalytics>({
    queryKey: ["/api/chat/analytics"],
    refetchInterval: 30000,
  });

  const handleExport = () => {
    window.open(`/api/chat/export?format=${exportFormat}`, "_blank");
  };

  const handleExportSession = (sessionId: number) => {
    window.open(`/api/chat/export?sessionId=${sessionId}&format=${exportFormat}`, "_blank");
  };

  if (isLoading) {
    return (
      <div className="p-6 space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-20 bg-zinc-100 rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  const stats = [
    {
      label: "Total Sessions",
      value: analytics?.totalSessions ?? 0,
      sub: `${analytics?.sessionsWithActivity ?? 0} with activity`,
      icon: MessageSquare,
    },
    {
      label: "Total Messages",
      value: analytics?.totalMessages ?? 0,
      sub: `${analytics?.userMessages ?? 0} user · ${analytics?.assistantMessages ?? 0} AI`,
      icon: FileText,
    },
    {
      label: "Word Count",
      value: analytics?.totalWordCount ?? 0,
      sub: `Avg ${analytics?.avgWordsPerMessage ?? 0} per message`,
      icon: TrendingUp,
    },
    {
      label: "Avg per Session",
      value: analytics?.averageMessagesPerSession ?? "0.00",
      sub: "Messages per session",
      icon: BarChart3,
    },
  ];

  return (
    <div className="p-6 space-y-6 max-w-4xl">
      {/* Title row */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-xl font-semibold text-zinc-900 tracking-tight">
            Conversation Analytics
          </h2>
          <p className="text-sm text-zinc-500 mt-0.5">
            Logging and analytics for all chat interactions
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={exportFormat} onValueChange={(v) => setExportFormat(v as "json" | "csv")}>
            <SelectTrigger className="w-20 h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="json" className="text-xs">JSON</SelectItem>
              <SelectItem value="csv" className="text-xs">CSV</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={handleExport} variant="outline" size="sm" className="h-8 text-xs gap-1.5">
            <Download className="h-3.5 w-3.5" />
            Export All
          </Button>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {stats.map(({ label, value, sub, icon: Icon }) => (
          <div key={label} className="bg-white border border-zinc-200 rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-zinc-500 font-medium">{label}</span>
              <Icon className="h-3.5 w-3.5 text-zinc-300" />
            </div>
            <p className="text-2xl font-semibold text-zinc-900 tracking-tight tabular-nums">
              {value}
            </p>
            <p className="text-xs text-zinc-400 mt-1">{sub}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <Tabs defaultValue="sessions">
        <TabsList className="h-8">
          <TabsTrigger value="sessions" className="text-xs h-7">Recent Sessions</TabsTrigger>
          <TabsTrigger value="messages" className="text-xs h-7">Recent Messages</TabsTrigger>
        </TabsList>

        <TabsContent value="sessions" className="mt-3">
          <div className="border border-zinc-200 rounded-xl overflow-hidden">
            <ScrollArea className="h-80">
              <div className="divide-y divide-zinc-100">
                {analytics?.recentSessions?.length ? (
                  analytics.recentSessions.map((session) => (
                    <div key={session.id} className="flex items-center justify-between px-4 py-3 hover:bg-zinc-50 transition-colors">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-zinc-800 truncate">{session.title}</p>
                        <div className="flex items-center gap-3 mt-0.5 text-xs text-zinc-400">
                          <span className="flex items-center gap-1">
                            <MessageSquare className="h-3 w-3" />
                            {session.messageCount} messages
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {format(new Date(session.createdAt), "MMM d, HH:mm")}
                          </span>
                        </div>
                      </div>
                      <Button
                        onClick={() => handleExportSession(session.id)}
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0 text-zinc-400 hover:text-zinc-700 shrink-0"
                      >
                        <Download className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-sm text-zinc-400 py-10">No sessions found</p>
                )}
              </div>
            </ScrollArea>
          </div>
        </TabsContent>

        <TabsContent value="messages" className="mt-3">
          <div className="border border-zinc-200 rounded-xl overflow-hidden">
            <ScrollArea className="h-80">
              <div className="divide-y divide-zinc-100">
                {analytics?.recentMessages?.length ? (
                  analytics.recentMessages.map((message) => (
                    <div key={message.id} className="px-4 py-3 hover:bg-zinc-50 transition-colors">
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2">
                          <Badge
                            variant={message.role === "user" ? "default" : "secondary"}
                            className="text-[10px] h-4 px-1.5"
                          >
                            {message.role}
                          </Badge>
                          <span className="text-xs text-zinc-400">
                            {message.wordCount ?? 0} words
                          </span>
                        </div>
                        <span className="text-xs text-zinc-400">
                          {format(new Date(message.createdAt), "MMM d, HH:mm")}
                        </span>
                      </div>
                      <p className="text-xs text-zinc-500 line-clamp-2">{message.content}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-sm text-zinc-400 py-10">No messages found</p>
                )}
              </div>
            </ScrollArea>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
