import { useCallback, useEffect, useRef, useState } from "react";

interface UseAsyncOptions {
  immediate?: boolean;
  onSuccess?: (data: any) => void;
  onError?: (error: Error) => void;
}

interface UseAsyncReturn<T> {
  data: T | null;
  error: Error | null;
  isLoading: boolean;
  isSuccess: boolean;
  isError: boolean;
  execute: (...args: any[]) => Promise<void>;
  reset: () => void;
}

export function useAsync<T = any>(
  asyncFunction: (...args: any[]) => Promise<T>,
  options: UseAsyncOptions = {}
): UseAsyncReturn<T> {
  const { immediate = false, onSuccess, onError } = options;

  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isError, setIsError] = useState(false);

  const mountedRef = useRef(true);

  const execute = useCallback(
    async (...args: any[]) => {
      setIsLoading(true);
      setError(null);
      setIsSuccess(false);
      setIsError(false);

      try {
        const result = await asyncFunction(...args);

        if (mountedRef.current) {
          setData(result);
          setIsSuccess(true);
          onSuccess?.(result);
        }
      } catch (err) {
        const error = err as Error;

        if (mountedRef.current) {
          setError(error);
          setIsError(true);
          onError?.(error);
        }
      } finally {
        if (mountedRef.current) {
          setIsLoading(false);
        }
      }
    },
    [asyncFunction, onSuccess, onError]
  );

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setIsLoading(false);
    setIsSuccess(false);
    setIsError(false);
  }, []);

  useEffect(() => {
    if (immediate) {
      execute();
    }
  }, [immediate, execute]);

  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  return {
    data,
    error,
    isLoading,
    isSuccess,
    isError,
    execute,
    reset,
  };
}
