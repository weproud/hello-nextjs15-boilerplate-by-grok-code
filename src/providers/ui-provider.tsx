"use client";

import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";

interface UIProviderProps {
  children: React.ReactNode;
}

export function UIProvider({ children }: UIProviderProps) {
  return (
    <TooltipProvider>
      {children}
      <Toaster
        position="bottom-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: "hsl(var(--background))",
            border: "1px solid hsl(var(--border))",
            color: "hsl(var(--foreground))",
          },
        }}
      />
    </TooltipProvider>
  );
}
