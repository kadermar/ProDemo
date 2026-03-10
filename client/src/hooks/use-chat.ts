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
    onMutate: async (content: string) => {
      await queryClient.cancelQueries({ queryKey: ["/api/chat/messages", sessionId] });
      const previous = queryClient.getQueryData(["/api/chat/messages", sessionId]);
      const optimisticMessage: ChatMessage = {
        id: Date.now(),
        content,
        role: "user",
        sessionId: sessionId ?? null,
        sources: null,
        createdAt: new Date(),
      } as ChatMessage;
      queryClient.setQueryData(
        ["/api/chat/messages", sessionId],
        (old: ChatMessage[] = []) => [...old, optimisticMessage]
      );
      return { previous };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/chat/messages", sessionId] });
    },
    onError: (error, _content, context: any) => {
      if (context?.previous) {
        queryClient.setQueryData(["/api/chat/messages", sessionId], context.previous);
      }
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
