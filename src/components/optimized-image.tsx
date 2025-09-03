import { cn } from "@/lib/utils";
import Image from "next/image";
import { useCallback, useState } from "react";

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  priority?: boolean;
  quality?: number;
  placeholder?: "blur" | "empty";
  blurDataURL?: string;
  className?: string;
  onLoad?: () => void;
  onError?: () => void;
  fallbackSrc?: string;
  sizes?: string;
  fill?: boolean;
}

// 로딩 상태를 관리하는 커스텀 Image 컴포넌트
export function OptimizedImage({
  src,
  alt,
  width,
  height,
  priority = false,
  quality = 75,
  placeholder = "empty",
  blurDataURL,
  className,
  onLoad,
  onError,
  fallbackSrc = "/placeholder-image.png",
  sizes,
  fill = false,
  ...props
}: OptimizedImageProps) {
  const [currentSrc, setCurrentSrc] = useState(src);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const handleLoad = useCallback(() => {
    setIsLoading(false);
    onLoad?.();
  }, [onLoad]);

  const handleError = useCallback(() => {
    setHasError(true);
    setIsLoading(false);

    // 폴백 이미지가 있고 현재 이미지가 폴백이 아닌 경우 폴백으로 전환
    if (fallbackSrc && currentSrc !== fallbackSrc) {
      setCurrentSrc(fallbackSrc);
      setHasError(false);
      setIsLoading(true);
    } else {
      onError?.();
    }
  }, [currentSrc, fallbackSrc, onError]);

  // src가 빈 문자열이거나 유효하지 않은 경우 렌더링하지 않음
  if (!currentSrc || currentSrc.trim() === "") {
    return (
      <div
        className={cn(
          "bg-muted flex items-center justify-center text-muted-foreground",
          className
        )}
        style={{ width, height }}
        role="img"
        aria-label="이미지를 불러올 수 없습니다"
      >
        <svg
          className="h-8 w-8"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden">
      <Image
        src={currentSrc}
        alt={alt}
        width={fill ? undefined : width}
        height={fill ? undefined : height}
        fill={fill}
        priority={priority}
        quality={quality}
        placeholder={placeholder}
        blurDataURL={blurDataURL}
        sizes={sizes}
        className={cn(
          "transition-opacity duration-300",
          isLoading ? "opacity-0" : "opacity-100",
          hasError && "opacity-50",
          className
        )}
        onLoad={handleLoad}
        onError={handleError}
        {...props}
      />

      {/* 로딩 인디케이터 */}
      {isLoading && (
        <div className="absolute inset-0 bg-muted animate-pulse flex items-center justify-center">
          <div className="w-6 h-6 border-2 border-muted-foreground/20 border-t-muted-foreground rounded-full animate-spin" />
        </div>
      )}

      {/* 에러 상태 표시 */}
      {hasError && currentSrc === fallbackSrc && (
        <div className="absolute inset-0 bg-muted flex items-center justify-center">
          <svg
            className="h-8 w-8 text-muted-foreground"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
            />
          </svg>
        </div>
      )}
    </div>
  );
}

// 프로필 이미지용 최적화 컴포넌트
export function ProfileImage({
  src,
  alt,
  size = 40,
  priority = false,
  className,
  ...props
}: Omit<OptimizedImageProps, "width" | "height"> & { size?: number }) {
  return (
    <OptimizedImage
      src={src}
      alt={alt}
      width={size}
      height={size}
      priority={priority}
      className={cn("rounded-full object-cover", className)}
      sizes={`${size}px`}
      quality={80}
      {...props}
    />
  );
}

// 콘텐츠 이미지용 최적화 컴포넌트
export function ContentImage({
  src,
  alt,
  width,
  height,
  priority = false,
  className,
  ...props
}: OptimizedImageProps) {
  return (
    <OptimizedImage
      src={src}
      alt={alt}
      width={width}
      height={height}
      priority={priority}
      className={cn("rounded-lg object-cover", className)}
      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
      quality={85}
      placeholder="blur"
      blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAoACgDASIAAhEBAxEB/8QAFwAAAwEAAAAAAAAAAAAAAAAAAAMEB//EACUQAAIBAwMEAwEBAAAAAAAAAAECAwAEEQUSITFBURNhcZEigf/EABUBAFEAAAAAAAAAAAAAAAAAAAH/xAAVEQEBAAAAAAAAAAAAAAAAAAAAAf/aAAwDAQACEQMRAD8A4+iiigAooooAKKKKACiiigAooooAKKKKACiiigD/2Q=="
      {...props}
    />
  );
}

// 반응형 이미지 컴포넌트
export function ResponsiveImage({
  src,
  alt,
  aspectRatio = "16/9",
  priority = false,
  className,
  ...props
}: Omit<OptimizedImageProps, "width" | "height" | "sizes"> & {
  aspectRatio?: string;
}) {
  return (
    <div
      className={cn("relative overflow-hidden", className)}
      style={{ aspectRatio }}
    >
      <OptimizedImage
        src={src}
        alt={alt}
        fill
        priority={priority}
        sizes="(max-width: 640px) 100vw, (max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
        className="object-cover"
        quality={85}
        placeholder="blur"
        {...props}
      />
    </div>
  );
}

// 이미지 최적화 유틸리티 함수들
export const imageUtils = {
  // 이미지 URL이 유효한지 확인
  isValidImageUrl: (url: string): boolean => {
    if (!url || typeof url !== "string") return false;

    try {
      const parsedUrl = new URL(url);
      return parsedUrl.protocol === "http:" || parsedUrl.protocol === "https:";
    } catch {
      return false;
    }
  },

  // 이미지 사이즈 계산
  calculateOptimalSize: (
    containerWidth: number,
    aspectRatio: number = 16 / 9
  ) => {
    return {
      width: containerWidth,
      height: Math.round(containerWidth / aspectRatio),
    };
  },

  // WebP 지원 여부 확인
  supportsWebP: async (): Promise<boolean> => {
    if (typeof window === "undefined") return true;

    return new Promise((resolve) => {
      const webP = document.createElement("img") as HTMLImageElement;
      webP.onload = webP.onerror = () => {
        resolve(webP.height === 2);
      };
      webP.src =
        "data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA";
    });
  },

  // 이미지 프리로딩
  preloadImage: (src: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      const img = document.createElement("img") as HTMLImageElement;
      img.onload = () => resolve();
      img.onerror = reject;
      img.src = src;
    });
  },

  // 이미지 포맷 변환
  getOptimizedFormat: (
    src: string,
    format: "webp" | "avif" | "original" = "webp"
  ): string => {
    if (format === "original") return src;

    const url = new URL(src);
    const pathParts = url.pathname.split(".");
    const extension = pathParts.pop();

    if (extension) {
      pathParts.push(`${format}.${extension}`);
      url.pathname = pathParts.join(".");
    }

    return url.toString();
  },
};
