"use client";

import { ThemeProvider } from "./theme-provider";
import { QueryProvider } from "./query-provider";
import { UIProvider } from "./ui-provider";
import { AppProvider } from "@/contexts/app-context";
import { AnalyticsProvider } from "./analytics-provider";
import { SessionProvider } from "./session-provider";

interface AppProvidersProps {
  children: React.ReactNode;
}

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <SessionProvider>
      <QueryProvider>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <UIProvider>
            <AnalyticsProvider>
              <AppProvider>{children}</AppProvider>
            </AnalyticsProvider>
          </UIProvider>
        </ThemeProvider>
      </QueryProvider>
    </SessionProvider>
  );
}
