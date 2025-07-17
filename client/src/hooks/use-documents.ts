import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { type Document } from "@shared/schema";

export function useDocuments() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: documents = [], isLoading } = useQuery<Document[]>({
    queryKey: ["/api/documents"],
  });

  const uploadMutation = useMutation({
    mutationFn: async (files: FileList) => {
      const formData = new FormData();
      Array.from(files).forEach((file) => {
        formData.append("files", file);
      });

      const response = await fetch("/api/documents/upload", {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Upload failed");
      }

      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/documents"] });
      toast({
        title: "Documents uploaded successfully",
        description: `${data.documents.length} documents processed`,
      });
    },
    onError: (error) => {
      toast({
        title: "Upload failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const searchMutation = useMutation({
    mutationFn: async (query: string) => {
      const response = await apiRequest("GET", `/api/documents/search?q=${encodeURIComponent(query)}`);
      return response.json();
    },
  });

  return {
    documents,
    isLoading,
    uploadFiles: uploadMutation.mutate,
    isUploading: uploadMutation.isPending,
    searchDocuments: searchMutation.mutate,
    searchResults: searchMutation.data,
    isSearching: searchMutation.isPending,
  };
}
