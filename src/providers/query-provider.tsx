"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { useState } from "react";

// Next.js 15와 React Query 최적화 설정
const createQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        // Next.js 15의 App Router와 호환되는 캐시 전략
        staleTime: 1000 * 60 * 5, // 5분
        gcTime: 1000 * 60 * 30, // 30분 (이전 cacheTime)

        // 네트워크 상태에 따른 최적화
        refetchOnWindowFocus: false,
        refetchOnReconnect: "always",
        refetchOnMount: true,

        // 재시도 전략 최적화
        retry: (failureCount, error: any) => {
          // 특정 에러 타입에서는 재시도하지 않음
          if (error?.status === 401 || error?.status === 403) {
            return false;
          }
          // 최대 2번까지 재시도
          return failureCount < 2;
        },

        // 네트워크 요청 제한
        networkMode: "online",

        // Suspense 모드 활성화 (React 18+)
      },
      mutations: {
        // 뮤테이션 최적화
        retry: false,
        networkMode: "online",

        // 낙관적 업데이트를 위한 기본 설정
        onError: (error, variables, context) => {
          console.error("Mutation error:", error);
        },
      },
    },
  });

interface QueryProviderProps {
  children: React.ReactNode;
}

export function QueryProvider({ children }: QueryProviderProps) {
  // QueryClient를 상태로 관리하여 hydration 오류 방지
  const [queryClient] = useState(createQueryClient);

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {/* 개발 환경에서만 React Query DevTools 표시 */}
      {process.env.NODE_ENV === "development" && (
        <ReactQueryDevtools initialIsOpen={false} />
      )}
    </QueryClientProvider>
  );
}
