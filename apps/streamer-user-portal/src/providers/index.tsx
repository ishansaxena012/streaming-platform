import type { ReactNode } from "react";
import { QueryProvider } from "./query-provider";
import { Toaster } from "sonner";

interface AppProvidersProps {
  children: ReactNode;
}

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <QueryProvider>
      {/* Dynamic toast controller */}
      <Toaster
        position="top-right"
        theme="dark"
        closeButton
        toastOptions={{
          style: {
            background: "#121217",
            border: "1px solid rgba(255, 255, 255, 0.08)",
            color: "#FFFFFF",
          },
        }}
      />
      {children}
    </QueryProvider>
  );
}
export default AppProviders;
