import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { type ChatMessage } from "@shared/schema";

export function useChat() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: messages = [], isLoading: isLoadingMessages } = useQuery<ChatMessage[]>({
    queryKey: ["/api/chat/messages"],
  });

  const sendMessageMutation = useMutation({
    mutationFn: async (content: string) => {
      const response = await apiRequest("POST", "/api/chat/message", { content });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/chat/messages"] });
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
      await apiRequest("DELETE", "/api/chat/messages");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/chat/messages"] });
      toast({
        title: "Chat cleared",
        description: "All messages have been removed.",
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
