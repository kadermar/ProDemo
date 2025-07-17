import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { ChatSession, InsertChatSession } from "@shared/schema";

export function useChatSessions() {
  return useQuery({
    queryKey: ["/api/chat/sessions"],
    queryFn: () => apiRequest<ChatSession[]>("/api/chat/sessions"),
  });
}

export function useCreateChatSession() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: InsertChatSession) => 
      apiRequest<ChatSession>("/api/chat/sessions", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/chat/sessions"] });
    },
  });
}

export function useUpdateChatSession() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<ChatSession> }) =>
      apiRequest<ChatSession>(`/api/chat/sessions/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/chat/sessions"] });
    },
  });
}

export function useDeleteChatSession() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: number) =>
      apiRequest(`/api/chat/sessions/${id}`, {
        method: "DELETE",
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/chat/sessions"] });
    },
  });
}