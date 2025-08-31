"use client";

import {
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { useIsMobile } from "@/hooks/use-mobile";

interface AppConfig {
  sidebarCollapsed: boolean;
  theme: "light" | "dark" | "system";
  language: string;
}

interface AppContextType {
  // Device & UI
  isMobile: boolean;
  isOnline: boolean;

  // App State
  config: AppConfig;
  updateConfig: (updates: Partial<AppConfig>) => void;

  // Navigation
  currentPath: string;

  // Performance
  isHydrated: boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

interface AppProviderProps {
  children: ReactNode;
}

export function AppProvider({ children }: AppProviderProps) {
  const isMobile = useIsMobile();
  const [isOnline, setIsOnline] = useState(true);
  const [isHydrated, setIsHydrated] = useState(false);
  const [currentPath, setCurrentPath] = useState("/");
  const [config, setConfig] = useState<AppConfig>({
    sidebarCollapsed: false,
    theme: "system",
    language: "ko",
  });

  // Handle online/offline status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    setIsOnline(navigator.onLine);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // Handle hydration
  useEffect(() => {
    setIsHydrated(true);
  }, []);

  // Handle current path
  useEffect(() => {
    if (typeof window !== "undefined") {
      setCurrentPath(window.location.pathname);

      const handleRouteChange = () => {
        setCurrentPath(window.location.pathname);
      };

      window.addEventListener("popstate", handleRouteChange);
      return () => window.removeEventListener("popstate", handleRouteChange);
    }
  }, []);

  const updateConfig = (updates: Partial<AppConfig>) => {
    setConfig((prev) => ({ ...prev, ...updates }));
  };

  const value: AppContextType = {
    isMobile,
    isOnline,
    config,
    updateConfig,
    currentPath,
    isHydrated,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
}

// Specialized hooks for specific context values
export function useAppConfig() {
  const { config, updateConfig } = useApp();
  return { config, updateConfig };
}

export function useDevice() {
  const { isMobile, isOnline, isHydrated } = useApp();
  return { isMobile, isOnline, isHydrated };
}

export function useNavigation() {
  const { currentPath } = useApp();
  return { currentPath };
}
