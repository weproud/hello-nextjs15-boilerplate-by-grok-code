"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { ReactNode } from "react";

interface DataWrapperProps<T> {
  data: T | null | undefined;
  loading?: boolean;
  error?: Error | string | null;
  emptyMessage?: string;
  loadingComponent?: ReactNode;
  errorComponent?: ReactNode;
  emptyComponent?: ReactNode;
  onRetry?: () => void;
  children: (data: T) => ReactNode;
  className?: string;
}

// 로딩 상태를 위한 기본 스켈레톤 컴포넌트
function DefaultLoadingSkeleton() {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="space-y-4">
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
          <div className="flex space-x-4">
            <Skeleton className="h-10 w-20" />
            <Skeleton className="h-10 w-20" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// 에러 상태를 위한 기본 컴포넌트
function DefaultErrorComponent({
  error,
  onRetry,
}: {
  error: Error | string;
  onRetry?: () => void;
}) {
  const errorMessage = typeof error === "string" ? error : error.message;

  return (
    <Card className="border-destructive">
      <CardContent className="p-6">
        <div className="flex items-center space-x-3 text-destructive">
          <AlertTriangle className="h-5 w-5 flex-shrink-0" />
          <div className="flex-1">
            <h3 className="font-medium">데이터를 불러올 수 없습니다</h3>
            <p className="text-sm text-muted-foreground mt-1">{errorMessage}</p>
          </div>
        </div>
        {onRetry && (
          <Button
            onClick={onRetry}
            variant="outline"
            size="sm"
            className="mt-4"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            다시 시도
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

// 빈 상태를 위한 기본 컴포넌트
function DefaultEmptyComponent({ message }: { message: string }) {
  return (
    <Card>
      <CardContent className="p-12 text-center">
        <div className="text-muted-foreground">
          <p className="text-lg font-medium mb-2">데이터가 없습니다</p>
          <p className="text-sm">{message}</p>
        </div>
      </CardContent>
    </Card>
  );
}

export function DataWrapper<T>({
  data,
  loading = false,
  error,
  emptyMessage = "표시할 데이터가 없습니다.",
  loadingComponent,
  errorComponent,
  emptyComponent,
  onRetry,
  children,
  className,
}: DataWrapperProps<T>) {
  // 로딩 상태
  if (loading) {
    return (
      <div className={className}>
        {loadingComponent || <DefaultLoadingSkeleton />}
      </div>
    );
  }

  // 에러 상태
  if (error) {
    return (
      <div className={className}>
        {errorComponent || (
          <DefaultErrorComponent error={error} onRetry={onRetry} />
        )}
      </div>
    );
  }

  // 데이터가 없는 상태
  if (!data) {
    return (
      <div className={className}>
        {emptyComponent || <DefaultEmptyComponent message={emptyMessage} />}
      </div>
    );
  }

  // 데이터가 있는 정상 상태
  return <div className={className}>{children(data)}</div>;
}

// 특정 데이터 타입을 위한 특화된 래퍼들
export function PostsDataWrapper({
  children,
  ...props
}: Omit<DataWrapperProps<any[]>, "children"> & {
  children: (posts: any[]) => ReactNode;
}) {
  const loadingComponent = (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <Card key={i}>
          <CardContent className="p-6">
            <Skeleton className="h-6 w-3/4 mb-2" />
            <Skeleton className="h-4 w-full mb-1" />
            <Skeleton className="h-4 w-2/3" />
            <div className="flex justify-between mt-4">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-16" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  return (
    <DataWrapper {...props} loadingComponent={loadingComponent}>
      {children}
    </DataWrapper>
  );
}

export function PostDataWrapper({
  children,
  ...props
}: Omit<DataWrapperProps<any>, "children"> & {
  children: (post: any) => ReactNode;
}) {
  const loadingComponent = (
    <Card>
      <CardContent className="p-8">
        <Skeleton className="h-8 w-3/4 mb-4" />
        <div className="space-y-3 mb-6">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>
        <div className="flex items-center space-x-4">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-3 w-16" />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <DataWrapper {...props} loadingComponent={loadingComponent}>
      {children}
    </DataWrapper>
  );
}

