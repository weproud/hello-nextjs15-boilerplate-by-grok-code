"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ReactNode, Suspense, useEffect, useState } from "react";

interface SuspenseWrapperProps {
  children: ReactNode;
  fallback?: ReactNode;
  variant?: "default" | "posts" | "post" | "comments" | "dashboard";
}

// 다양한 로딩 상태를 위한 스켈레톤 컴포넌트들
function DefaultSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-2/3" />
    </div>
  );
}

function PostsSkeleton() {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <Card key={i}>
          <CardContent className="p-6">
            <div className="space-y-4">
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
              <div className="flex items-center space-x-2 mt-4">
                <Skeleton className="h-8 w-8 rounded-full" />
                <Skeleton className="h-4 w-20" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function PostSkeleton() {
  return (
    <Card>
      <CardContent className="p-8">
        <div className="space-y-6">
          <Skeleton className="h-8 w-3/4" />
          <div className="space-y-3">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-2/3" />
          </div>
          <div className="flex items-center space-x-4 mt-6">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-3 w-16" />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function CommentsSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 3 }).map((_, i) => (
        <Card key={i}>
          <CardContent className="p-4">
            <div className="flex space-x-3">
              <Skeleton className="h-8 w-8 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <Skeleton className="h-12 w-64 mb-8" />

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardContent className="p-6">
              <Skeleton className="h-6 w-32 mb-4" />
              <div className="space-y-3">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-2/3" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <Skeleton className="h-6 w-32 mb-4" />
              <div className="space-y-3">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="mt-6">
          <CardContent className="p-6">
            <Skeleton className="h-6 w-32 mb-4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function getFallback(variant?: SuspenseWrapperProps["variant"]) {
  switch (variant) {
    case "posts":
      return <PostsSkeleton />;
    case "post":
      return <PostSkeleton />;
    case "comments":
      return <CommentsSkeleton />;
    case "dashboard":
      return <DashboardSkeleton />;
    default:
      return <DefaultSkeleton />;
  }
}

export function SuspenseWrapper({
  children,
  fallback,
  variant = "default",
}: SuspenseWrapperProps) {
  return (
    <Suspense fallback={fallback || getFallback(variant)}>{children}</Suspense>
  );
}

// 스트리밍을 위한 컴포넌트들
export function StreamingWrapper({
  children,
  priority = "normal",
}: {
  children: ReactNode;
  priority?: "high" | "normal" | "low";
}) {
  const priorityClass = {
    high: "animate-pulse",
    normal: "",
    low: "opacity-60",
  }[priority];

  return (
    <div className={`transition-opacity duration-300 ${priorityClass}`}>
      <SuspenseWrapper>{children}</SuspenseWrapper>
    </div>
  );
}

// 프로그레시브 로딩을 위한 컴포넌트
export function ProgressiveLoader({
  children,
  delay = 100,
}: {
  children: ReactNode;
  delay?: number;
}) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShow(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  if (!show) return null;

  return <>{children}</>;
}
