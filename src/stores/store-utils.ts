import { StateCreator, StoreApi } from "zustand";

// 로깅 미들웨어
export const withLogging =
  <T>(config: StateCreator<T, [], [], T>): StateCreator<T, [], [], T> =>
  (set, get, api) =>
    config(
      (...args) => {
        if (process.env.NODE_ENV === "development") {
          console.log("State before:", get());
          console.log("Action args:", args);
        }
        (set as any)(...args);
        if (process.env.NODE_ENV === "development") {
          console.log("State after:", get());
        }
      },
      get,
      api
    );

// 에러 처리 미들웨어
export const withErrorHandling =
  <T>(config: StateCreator<T, [], [], T>): StateCreator<T, [], [], T> =>
  (set, get, api) =>
    config(
      (...args) => {
        try {
          (set as any)(...args);
        } catch (error) {
          console.error("Store error:", error);
          // 에러 처리 로직 추가 가능
        }
      },
      get,
      api
    );

// 상태 검증 미들웨어
export const withValidation =
  <T>(
    config: StateCreator<T, [], [], T>,
    validator?: (state: T) => boolean
  ): StateCreator<T, [], [], T> =>
  (set, get, api) =>
    config(
      (...args) => {
        const newState =
          typeof args[0] === "function" ? (args[0] as any)(get()) : args[0];
        if (validator && !validator(newState)) {
          console.warn("Invalid state update:", newState);
          return;
        }
        (set as any)(...args);
      },
      get,
      api
    );

// 액션 타입 정의
export interface BaseActions {
  reset: () => void;
  setLoading: (loading: boolean) => void;
}

// 기본 상태 인터페이스
export interface BaseState {
  isLoading: boolean;
  lastUpdated: number;
}

// 액션 생성 헬퍼
export const createActions = <T extends BaseState>(store: StoreApi<T>) => ({
  reset: () => {
    // 초기 상태로 리셋하는 로직은 각 스토어에서 구현
    console.log("Reset action called");
  },

  setLoading: (isLoading: boolean) => {
    store.setState({
      isLoading,
      lastUpdated: Date.now(),
    } as Partial<T>);
  },

  // 상태 변경 감지
  subscribeToChanges: (callback: (state: T) => void) => {
    return store.subscribe(callback);
  },

  // 상태 유효성 검증
  validateState: (state: T): boolean => {
    return state !== null && typeof state === "object";
  },

  // 상태 직렬화 (localStorage용)
  serialize: (state: T): string => {
    try {
      return JSON.stringify({
        ...state,
        lastUpdated: Date.now(),
      });
    } catch (error) {
      console.error("State serialization failed:", error);
      return "{}";
    }
  },

  // 상태 역직렬화
  deserialize: (serialized: string): Partial<T> | null => {
    try {
      return JSON.parse(serialized);
    } catch (error) {
      console.error("State deserialization failed:", error);
      return null;
    }
  },
});

// 상태 변경 히스토리 (디버깅용)
export class StateHistory<T> {
  private history: T[] = [];
  private maxSize: number;

  constructor(maxSize = 10) {
    this.maxSize = maxSize;
  }

  push(state: T) {
    this.history.push(state);
    if (this.history.length > this.maxSize) {
      this.history.shift();
    }
  }

  getHistory(): T[] {
    return [...this.history];
  }

  getLastState(): T | null {
    return this.history[this.history.length - 1] || null;
  }

  clear() {
    this.history = [];
  }
}

// 서버 상태와 클라이언트 상태 동기화 헬퍼
export const syncWithServer = async <T>(
  serverFetch: () => Promise<T>,
  localUpdate: (data: T) => void,
  options: {
    cacheTime?: number;
    retryCount?: number;
    onError?: (error: Error) => void;
  } = {}
) => {
  const { cacheTime = 5 * 60 * 1000, retryCount = 3, onError } = options;

  let retryAttempts = 0;

  const fetchWithRetry = async (): Promise<T> => {
    try {
      const data = await serverFetch();
      localUpdate(data);
      return data;
    } catch (error) {
      if (retryAttempts < retryCount) {
        retryAttempts++;
        console.warn(
          `Server sync failed, retrying (${retryAttempts}/${retryCount})`
        );
        await new Promise((resolve) =>
          setTimeout(resolve, 1000 * retryAttempts)
        );
        return fetchWithRetry();
      }
      onError?.(error as Error);
      throw error;
    }
  };

  return fetchWithRetry();
};

// 상태 변경 디바운싱
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout | null = null;

  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};
