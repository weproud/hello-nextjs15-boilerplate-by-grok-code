import { useForm, UseFormProps, UseFormReturn } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

// Generic form hook with Zod validation
export function useZodForm<T extends z.ZodSchema>(
  schema: T,
  options?: Omit<UseFormProps<z.infer<T>>, "resolver">
): UseFormReturn<z.infer<T>> {
  return useForm<z.infer<T>>({
    ...options,
    resolver: zodResolver(schema),
  });
}

// Hook for form submission with loading states
export function useFormSubmit<T extends Record<string, any>>(
  submitFn: (data: T) => Promise<any>,
  options?: {
    onSuccess?: (result: any) => void;
    onError?: (error: any) => void;
    resetOnSuccess?: boolean;
  }
) {
  const { onSuccess, onError, resetOnSuccess = false } = options || {};

  const submit = async (data: T) => {
    try {
      const result = await submitFn(data);

      if (result?.success) {
        onSuccess?.(result);
        if (resetOnSuccess) {
          // Form reset logic would go here
        }
      } else {
        onError?.(result?.error || "작업에 실패했습니다");
      }

      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "알 수 없는 오류가 발생했습니다";
      onError?.(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  return { submit };
}
