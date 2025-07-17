import { useQuery } from "@tanstack/react-query";
import { type ProductData } from "@shared/schema";

export function useProducts() {
  const { data: products, isLoading, error } = useQuery({
    queryKey: ['/api/products'],
    queryFn: async (): Promise<ProductData[]> => {
      const response = await fetch('/api/products');
      if (!response.ok) {
        throw new Error('Failed to fetch products');
      }
      return response.json();
    },
  });

  return {
    products: products || [],
    isLoading,
    error
  };
}

export function useProduct(id: number) {
  const { data: product, isLoading, error } = useQuery({
    queryKey: ['/api/products', id],
    queryFn: async (): Promise<ProductData> => {
      const response = await fetch(`/api/products/${id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch product');
      }
      return response.json();
    },
    enabled: !!id,
  });

  return {
    product,
    isLoading,
    error
  };
}