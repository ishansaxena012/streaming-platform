import type { ReactNode } from "react";
import { QueryClient, QueryClientProvider, QueryCache, MutationCache } from "@tanstack/react-query";
import { toast } from "sonner";
import { QUERY_CONFIG } from "../config/query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: QUERY_CONFIG.STALE_TIME,
      retry: QUERY_CONFIG.RETRY_COUNT,
      retryDelay: QUERY_CONFIG.RETRY_DELAY,
      refetchOnWindowFocus: QUERY_CONFIG.REFETCH_ON_WINDOW_FOCUS,
      refetchOnReconnect: QUERY_CONFIG.REFETCH_ON_RECONNECT,
    },
  },
  queryCache: new QueryCache({
    onError: (error: any) => {
      const message = error?.message || "An error occurred retrieving database metadata";
      toast.error(`Network Fetch Error: ${message}`, {
        style: { background: "#121217", border: "1px solid rgba(229,9,20,0.2)", color: "#FFFFFF" }
      });
    },
  }),
  mutationCache: new MutationCache({
    onError: (error: any) => {
      const message = error?.message || "Request operation could not be saved";
      toast.error(`Update Error: ${message}`, {
        style: { background: "#121217", border: "1px solid rgba(229,9,20,0.2)", color: "#FFFFFF" }
      });
    },
  }),
});

interface QueryProviderProps {
  children: ReactNode;
}

export function QueryProvider({ children }: QueryProviderProps) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}
export default QueryProvider;
