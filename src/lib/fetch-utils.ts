// Next.js 15의 새로운 fetch API들을 활용한 데이터 패칭 유틸리티

export interface FetchOptions extends RequestInit {
  revalidate?: number | false;
  tags?: string[];
  cache?: RequestCache;
}

/**
 * Next.js 15의 새로운 fetch API를 활용한 데이터 패칭 함수
 * 캐싱, 리벨리데이션, 태그 기반 무효화 지원
 */
export async function fetchWithCache(url: string, options: FetchOptions = {}) {
  const {
    revalidate = 300, // 5분 기본 캐시
    tags = [],
    cache = "default",
    ...fetchOptions
  } = options;

  try {
    // Next.js 15에서는 next 옵션을 RequestInit에 직접 적용
    const response = await fetch(url, {
      ...fetchOptions,
      next: {
        revalidate,
        tags,
      },
    } as any);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return response;
  } catch (error) {
    console.error(`Fetch error for ${url}:`, error);
    throw error;
  }
}

/**
 * JSON 데이터를 패칭하는 유틸리티 함수
 */
export async function fetchJson<T = any>(
  url: string,
  options: FetchOptions = {}
): Promise<T> {
  const response = await fetchWithCache(url, options);
  return response.json();
}

/**
 * 외부 API 데이터를 패칭하는 함수 (캐시 적용)
 */
export async function fetchExternalApi<T = any>(
  url: string,
  options: FetchOptions = {}
): Promise<T> {
  return fetchJson<T>(url, {
    ...options,
    // 외부 API는 더 짧은 캐시 시간 적용
    revalidate: 60, // 1분
    cache: "no-store", // 필요시 캐시 비활성화
  });
}

/**
 * 서버 사이드에서 데이터를 패칭하는 함수
 * ISR/SSG에서 사용하기 적합
 */
export async function fetchServerData<T = any>(
  url: string,
  options: Omit<FetchOptions, "cache"> = {}
): Promise<T> {
  return fetchJson<T>(url, {
    ...options,
    cache: "force-cache", // 서버 사이드에서 강제 캐시
  });
}

/**
 * 실시간 데이터를 위한 패칭 함수 (캐시 비활성화)
 */
export async function fetchRealtimeData<T = any>(
  url: string,
  options: Omit<FetchOptions, "cache" | "revalidate"> = {}
): Promise<T> {
  return fetchJson<T>(url, {
    ...options,
    cache: "no-store", // 캐시 비활성화
  });
}

/**
 * 특정 태그로 캐시를 무효화하는 함수
 */
export async function revalidateCacheTags(tags: string[]) {
  try {
    const revalidateUrl = `/api/revalidate?tags=${tags.join(",")}`;
    await fetch(revalidateUrl, { method: "POST" });
  } catch (error) {
    console.error("Cache revalidation failed:", error);
  }
}

/**
 * 온디맨드 리벨리데이션 함수
 */
export async function revalidateData(paths: string[]) {
  try {
    const response = await fetch("/api/revalidate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ paths }),
    });

    if (!response.ok) {
      throw new Error("Revalidation failed");
    }

    return response.json();
  } catch (error) {
    console.error("On-demand revalidation failed:", error);
    throw error;
  }
}

/**
 * 데이터 패칭 에러를 처리하는 유틸리티
 */
export class FetchError extends Error {
  constructor(
    message: string,
    public status?: number,
    public statusText?: string
  ) {
    super(message);
    this.name = "FetchError";
  }
}

/**
 * 에러 핸들링을 포함한 패칭 함수
 */
export async function safeFetch<T = any>(
  url: string,
  options: FetchOptions = {}
): Promise<{ data: T | null; error: FetchError | null }> {
  try {
    const data = await fetchJson<T>(url, options);
    return { data, error: null };
  } catch (error) {
    const fetchError =
      error instanceof FetchError
        ? error
        : new FetchError(
            error instanceof Error ? error.message : "Unknown error"
          );

    return { data: null, error: fetchError };
  }
}
