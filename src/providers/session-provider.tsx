"use client";

import {
  SessionProvider as NextAuthSessionProvider,
  useSession as useNextAuthSession,
} from "next-auth/react";
import type { ReactNode } from "react";

interface SessionProviderProps {
  children: ReactNode;
}

export function SessionProvider({ children }: SessionProviderProps) {
  return <NextAuthSessionProvider>{children}</NextAuthSessionProvider>;
}

// NextAuth의 useSession을 그대로 export
export const useSession = useNextAuthSession;
