"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { useState } from "react";

interface QueryProviderProps {
  children: React.ReactNode;
}

export function QueryProvider({ children }: QueryProviderProps) {
  // QueryClient 인스턴스를 상태로 관리하여 hydration 오류 방지
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // 기본 staleTime 설정 (5분)
            staleTime: 1000 * 60 * 5,
            // 기본 cacheTime 설정 (10분)
            gcTime: 1000 * 60 * 10,
            // 재시도 설정
            retry: 1,
            // 리페치 설정
            refetchOnWindowFocus: false,
          },
          mutations: {
            // 뮤테이션 재시도 설정
            retry: 0,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {/* 개발 환경에서만 React Query DevTools 표시 */}
      {process.env.NODE_ENV === "development" && <ReactQueryDevtools />}
    </QueryClientProvider>
  );
}
