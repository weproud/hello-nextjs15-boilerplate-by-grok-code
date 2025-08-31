import { Skeleton } from "./skeleton";
import { cn } from "@/lib/utils";

interface SkeletonLoaderProps {
  className?: string;
  variant?: "card" | "list" | "text" | "avatar" | "button";
  lines?: number;
  showAvatar?: boolean;
  showButton?: boolean;
}

// Card Skeleton
export function CardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("rounded-lg border p-6 space-y-4", className)}>
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
      <div className="flex items-center space-x-2">
        <Skeleton className="h-8 w-8 rounded-full" />
        <Skeleton className="h-4 w-24" />
      </div>
    </div>
  );
}

// List Item Skeleton
export function ListSkeleton({
  className,
  lines = 3,
}: {
  className?: string;
  lines?: number;
}) {
  return (
    <div className={cn("space-y-3", className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <div key={i} className="flex items-center space-x-3">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
          <Skeleton className="h-8 w-20" />
        </div>
      ))}
    </div>
  );
}

// Text Skeleton
export function TextSkeleton({
  className,
  lines = 3,
}: {
  className?: string;
  lines?: number;
}) {
  return (
    <div className={cn("space-y-2", className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className={cn(
            "h-4",
            i === lines - 1 ? "w-3/4" : "w-full" // Last line shorter
          )}
        />
      ))}
    </div>
  );
}

// Avatar Skeleton
export function AvatarSkeleton({ className }: { className?: string }) {
  return <Skeleton className={cn("h-10 w-10 rounded-full", className)} />;
}

// Button Skeleton
export function ButtonSkeleton({ className }: { className?: string }) {
  return <Skeleton className={cn("h-10 w-24", className)} />;
}

// Post Card Skeleton
export function PostCardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("rounded-lg border p-6 space-y-4", className)}>
      <div className="flex items-center space-x-3">
        <AvatarSkeleton />
        <div className="flex-1">
          <Skeleton className="h-4 w-24 mb-1" />
          <Skeleton className="h-3 w-16" />
        </div>
      </div>
      <TextSkeleton lines={4} />
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Skeleton className="h-8 w-16" />
          <Skeleton className="h-8 w-16" />
        </div>
        <Skeleton className="h-8 w-20" />
      </div>
    </div>
  );
}

// Comment Skeleton
export function CommentSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("flex space-x-3", className)}>
      <AvatarSkeleton />
      <div className="flex-1 space-y-2">
        <div className="flex items-center space-x-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-3 w-16" />
        </div>
        <TextSkeleton lines={2} />
        <div className="flex items-center space-x-4">
          <Skeleton className="h-6 w-12" />
          <Skeleton className="h-6 w-12" />
        </div>
      </div>
    </div>
  );
}

// Table Skeleton
export function TableSkeleton({
  className,
  rows = 5,
  columns = 4,
}: {
  className?: string;
  rows?: number;
  columns?: number;
}) {
  return (
    <div className={cn("space-y-4", className)}>
      {/* Header */}
      <div className="flex space-x-4">
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton key={`header-${i}`} className="h-6 flex-1" />
        ))}
      </div>
      {/* Rows */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={`row-${rowIndex}`} className="flex space-x-4">
          {Array.from({ length: columns }).map((_, colIndex) => (
            <Skeleton
              key={`cell-${rowIndex}-${colIndex}`}
              className="h-8 flex-1"
            />
          ))}
        </div>
      ))}
    </div>
  );
}

// Generic Skeleton Loader
export function SkeletonLoader({
  variant = "card",
  lines = 3,
  showAvatar = false,
  showButton = false,
  className,
}: SkeletonLoaderProps) {
  switch (variant) {
    case "card":
      return <CardSkeleton className={className} />;
    case "list":
      return <ListSkeleton className={className} lines={lines} />;
    case "text":
      return <TextSkeleton className={className} lines={lines} />;
    case "avatar":
      return <AvatarSkeleton className={className} />;
    case "button":
      return <ButtonSkeleton className={className} />;
    default:
      return <CardSkeleton className={className} />;
  }
}

// Export all skeleton components
