import { QueryClient, QueryFunction } from "@tanstack/react-query";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

// Modern API request function with proper typing
export async function apiRequest<T = any>(
  url: string,
  options?: {
    method?: string;
    body?: string;
    headers?: Record<string, string>;
  }
): Promise<T>;

// Legacy overload for backwards compatibility
export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response>;

// Implementation
export async function apiRequest<T = any>(
  urlOrMethod: string,
  urlOrOptions?: string | {
    method?: string;
    body?: string;
    headers?: Record<string, string>;
  },
  data?: unknown | undefined,
): Promise<T | Response> {
  // Modern usage: apiRequest(url, options)
  if (typeof urlOrOptions === 'object' || urlOrOptions === undefined) {
    const url = urlOrMethod;
    const options = urlOrOptions || {};
    const { method = "GET", body, headers = {} } = options;
    
    const res = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
        ...headers,
      },
      body,
      credentials: "include",
    });

    await throwIfResNotOk(res);
    return await res.json();
  }
  
  // Legacy usage: apiRequest(method, url, data)
  const method = urlOrMethod;
  const url = urlOrOptions;
  
  const res = await fetch(url, {
    method,
    headers: data ? { "Content-Type": "application/json" } : {},
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  });

  await throwIfResNotOk(res);
  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const res = await fetch(queryKey.join("/") as string, {
      credentials: "include",
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
