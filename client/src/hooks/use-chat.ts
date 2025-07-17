import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { type ChatMessage } from "@shared/schema";

export function useChat(sessionId?: number) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: messages = [], isLoading: isLoadingMessages } = useQuery<ChatMessage[]>({
    queryKey: ["/api/chat/messages", sessionId],
    queryFn: () => apiRequest<ChatMessage[]>(`/api/chat/messages${sessionId ? `?sessionId=${sessionId}` : ""}`),
  });

  const sendMessageMutation = useMutation({
    mutationFn: async (content: string) => {
      const response = await apiRequest("/api/chat/message", {
        method: "POST",
        body: JSON.stringify({ content, sessionId }),
      });
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/chat/messages", sessionId] });
    },
    onError: (error) => {
      toast({
        title: "Error sending message",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const clearMessagesMutation = useMutation({
    mutationFn: async () => {
      await apiRequest(`/api/chat/messages${sessionId ? `?sessionId=${sessionId}` : ""}`, {
        method: "DELETE",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/chat/messages", sessionId] });
      toast({
        title: "Chat cleared",
        description: sessionId ? "Session messages cleared." : "All messages have been removed.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error clearing chat",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return {
    messages,
    isLoading: isLoadingMessages || sendMessageMutation.isPending,
    sendMessage: sendMessageMutation.mutate,
    clearMessages: clearMessagesMutation.mutate,
  };
}
