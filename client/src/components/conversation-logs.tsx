import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { 
  Download, 
  BarChart3, 
  MessageSquare,
  Clock,
  FileText,
  TrendingUp
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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
  const [exportFormat, setExportFormat] = useState<'json' | 'csv'>('json');

  const { data: analytics, isLoading } = useQuery<ConversationAnalytics>({
    queryKey: ['/api/chat/analytics'],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const handleExport = () => {
    const url = `/api/chat/export?format=${exportFormat}`;
    window.open(url, '_blank');
  };

  const handleExportSession = (sessionId: number) => {
    const url = `/api/chat/export?sessionId=${sessionId}&format=${exportFormat}`;
    window.open(url, '_blank');
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Conversation Analytics</h2>
          <p className="text-muted-foreground">Complete logging and analytics for all chat interactions</p>
        </div>
        <div className="flex items-center gap-2">
          <select 
            value={exportFormat} 
            onChange={(e) => setExportFormat(e.target.value as 'json' | 'csv')}
            className="px-3 py-2 border rounded-md"
          >
            <option value="json">JSON</option>
            <option value="csv">CSV</option>
          </select>
          <Button onClick={handleExport} variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export All
          </Button>
        </div>
      </div>

      {/* Analytics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sessions</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics?.totalSessions || 0}</div>
            <p className="text-xs text-muted-foreground">
              {analytics?.sessionsWithActivity || 0} with activity
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Messages</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics?.totalMessages || 0}</div>
            <p className="text-xs text-muted-foreground">
              {analytics?.userMessages || 0} user / {analytics?.assistantMessages || 0} AI
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Word Count</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics?.totalWordCount || 0}</div>
            <p className="text-xs text-muted-foreground">
              Avg {analytics?.avgWordsPerMessage || 0} per message
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Messages</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics?.averageMessagesPerSession || '0.00'}</div>
            <p className="text-xs text-muted-foreground">Per session</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="sessions" className="space-y-4">
        <TabsList>
          <TabsTrigger value="sessions">Recent Sessions</TabsTrigger>
          <TabsTrigger value="messages">Recent Messages</TabsTrigger>
        </TabsList>

        <TabsContent value="sessions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Chat Sessions</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-80">
                <div className="space-y-4">
                  {analytics?.recentSessions?.map((session) => (
                    <div key={session.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex-1">
                        <h4 className="font-medium">{session.title}</h4>
                        <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <MessageSquare className="h-3 w-3" />
                            {session.messageCount} messages
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {format(new Date(session.createdAt), 'MMM dd, HH:mm')}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">ID: {session.id}</Badge>
                        <Button
                          onClick={() => handleExportSession(session.id)}
                          variant="ghost"
                          size="sm"
                        >
                          <Download className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  {(!analytics?.recentSessions || analytics.recentSessions.length === 0) && (
                    <p className="text-center text-muted-foreground py-8">No sessions found</p>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="messages" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Messages</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-80">
                <div className="space-y-3">
                  {analytics?.recentMessages?.map((message) => (
                    <div key={message.id} className="p-3 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Badge variant={message.role === 'user' ? 'default' : 'secondary'}>
                            {message.role}
                          </Badge>
                          <Badge variant="outline">Session: {message.sessionId || 'None'}</Badge>
                          <span className="text-xs text-muted-foreground">
                            {message.wordCount || 0} words
                          </span>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {format(new Date(message.createdAt), 'MMM dd, HH:mm:ss')}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-3">
                        {message.content}
                      </p>
                    </div>
                  ))}
                  {(!analytics?.recentMessages || analytics.recentMessages.length === 0) && (
                    <p className="text-center text-muted-foreground py-8">No messages found</p>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}