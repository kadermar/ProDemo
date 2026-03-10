import { useQuery } from "@tanstack/react-query";

export interface CatalogProduct {
  id: number;
  product_name: string;
  manufacturer: string;
  product_category: string;
  document_type: string;
  source_file: string;
  chunk_count: number;
}

export function useCatalog(searchQuery?: string) {
  const params = searchQuery ? `?q=${encodeURIComponent(searchQuery)}` : "";
  const { data, isLoading, error } = useQuery<CatalogProduct[]>({
    queryKey: ["/api/catalog", searchQuery],
    queryFn: async () => {
      const res = await fetch(`/api/catalog${params}`);
      if (!res.ok) throw new Error("Failed to fetch catalog");
      return res.json();
    },
  });

  return { products: data ?? [], isLoading, error };
}

export async function getProductPdfUrl(sourceFile: string): Promise<string> {
  const res = await fetch(`/api/catalog/pdf?key=${encodeURIComponent(sourceFile)}`);
  if (!res.ok) throw new Error("Failed to get PDF URL");
  const json = await res.json();
  return json.url as string;
}
