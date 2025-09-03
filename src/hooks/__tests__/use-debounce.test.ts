import { renderHook, act, waitFor } from "@testing-library/react";
import { useDebounce, useDebouncedCallback, useThrottle } from "../use-debounce";

// Mock timers
beforeEach(() => {
  jest.useFakeTimers();
});

afterEach(() => {
  jest.clearAllTimers();
  jest.useRealTimers();
});

describe("useDebounce", () => {
  it("should return initial value immediately", () => {
    const { result } = renderHook(() => useDebounce("initial", 500));

    expect(result.current).toBe("initial");
  });

  it("should update value after delay", async () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      {
        initialProps: { value: "initial", delay: 500 },
      }
    );

    expect(result.current).toBe("initial");

    // 값 변경
    rerender({ value: "updated", delay: 500 });

    // 타이머가 만료되기 전에는 이전 값 유지
    expect(result.current).toBe("initial");

    // 타이머 만료
    act(() => {
      jest.advanceTimersByTime(500);
    });

    await waitFor(() => {
      expect(result.current).toBe("updated");
    });
  });

  it("should reset timer when value changes before delay", () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 500),
      { initialProps: { value: "first" } }
    );

    expect(result.current).toBe("first");

    // 첫 번째 값 변경
    rerender({ value: "second" });
    expect(result.current).toBe("first");

    // 타이머 절반 진행
    act(() => {
      jest.advanceTimersByTime(250);
    });

    // 두 번째 값 변경 (타이머 리셋)
    rerender({ value: "third" });
    expect(result.current).toBe("first");

    // 타이머 완료
    act(() => {
      jest.advanceTimersByTime(500);
    });

    expect(result.current).toBe("third");
  });

  it("should work with different delay values", () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: "test", delay: 100 } }
    );

    rerender({ value: "updated", delay: 100 });

    act(() => {
      jest.advanceTimersByTime(50);
    });

    expect(result.current).toBe("test");

    act(() => {
      jest.advanceTimersByTime(50);
    });

    expect(result.current).toBe("updated");
  });
});

describe("useDebouncedCallback", () => {
  it("should call callback after delay", () => {
    const mockCallback = jest.fn();
    const { result } = renderHook(() => useDebouncedCallback(mockCallback, 500));

    act(() => {
      result.current("arg1", "arg2");
    });

    expect(mockCallback).not.toHaveBeenCalled();

    act(() => {
      jest.advanceTimersByTime(500);
    });

    expect(mockCallback).toHaveBeenCalledWith("arg1", "arg2");
  });

  it("should reset timer when called again before delay", () => {
    const mockCallback = jest.fn();
    const { result } = renderHook(() => useDebouncedCallback(mockCallback, 500));

    act(() => {
      result.current("first");
    });

    act(() => {
      jest.advanceTimersByTime(250);
    });

    act(() => {
      result.current("second");
    });

    act(() => {
      jest.advanceTimersByTime(250);
    });

    expect(mockCallback).not.toHaveBeenCalled();

    act(() => {
      jest.advanceTimersByTime(250);
    });

    expect(mockCallback).toHaveBeenCalledWith("second");
    expect(mockCallback).toHaveBeenCalledTimes(1);
  });

  it("should work with different callback functions", () => {
    const mockCallback1 = jest.fn();
    const mockCallback2 = jest.fn();

    const { result, rerender } = renderHook(
      ({ callback }) => useDebouncedCallback(callback, 500),
      { initialProps: { callback: mockCallback1 } }
    );

    act(() => {
      result.current("test");
    });

    rerender({ callback: mockCallback2 });

    act(() => {
      jest.advanceTimersByTime(500);
    });

    expect(mockCallback1).not.toHaveBeenCalled();
    expect(mockCallback2).toHaveBeenCalledWith("test");
  });
});

describe("useThrottle", () => {
  it("should call callback immediately on first call", () => {
    const mockCallback = jest.fn();
    const { result } = renderHook(() => useThrottle(mockCallback, 500));

    act(() => {
      result.current("arg1");
    });

    expect(mockCallback).toHaveBeenCalledWith("arg1");
    expect(mockCallback).toHaveBeenCalledTimes(1);
  });

  it("should throttle subsequent calls", () => {
    const mockCallback = jest.fn();
    const { result } = renderHook(() => useThrottle(mockCallback, 500));

    // 첫 번째 호출
    act(() => {
      result.current("first");
    });
    expect(mockCallback).toHaveBeenCalledWith("first");

    // 두 번째 호출 (스로틀링됨)
    act(() => {
      result.current("second");
    });
    expect(mockCallback).toHaveBeenCalledTimes(1);

    // 시간 경과 후 세 번째 호출
    act(() => {
      jest.advanceTimersByTime(500);
    });

    act(() => {
      result.current("third");
    });
    expect(mockCallback).toHaveBeenCalledWith("third");
    expect(mockCallback).toHaveBeenCalledTimes(2);
  });

  it("should work with different delay values", () => {
    const mockCallback = jest.fn();
    const { result } = renderHook(() => useThrottle(mockCallback, 100));

    act(() => {
      result.current("first");
    });
    expect(mockCallback).toHaveBeenCalledTimes(1);

    act(() => {
      result.current("second");
    });
    expect(mockCallback).toHaveBeenCalledTimes(1);

    act(() => {
      jest.advanceTimersByTime(100);
    });

    act(() => {
      result.current("third");
    });
    expect(mockCallback).toHaveBeenCalledWith("third");
    expect(mockCallback).toHaveBeenCalledTimes(2);
  });

  it("should handle rapid successive calls", () => {
    const mockCallback = jest.fn();
    const { result } = renderHook(() => useThrottle(mockCallback, 200));

    // 빠른 연속 호출
    act(() => {
      result.current("call1");
      result.current("call2");
      result.current("call3");
    });

    expect(mockCallback).toHaveBeenCalledTimes(1);
    expect(mockCallback).toHaveBeenCalledWith("call1");

    // 시간 경과 후 다시 호출 가능
    act(() => {
      jest.advanceTimersByTime(200);
    });

    act(() => {
      result.current("call4");
    });
    expect(mockCallback).toHaveBeenCalledWith("call4");
    expect(mockCallback).toHaveBeenCalledTimes(2);
  });
});

// 통합 테스트
describe("Hook Integration", () => {
  it("should work together: useDebounce + useDebouncedCallback", () => {
    const mockCallback = jest.fn();
    const { result: debounceResult } = renderHook(() => useDebounce("test", 300));
    const { result: debouncedCallbackResult } = renderHook(() =>
      useDebouncedCallback(mockCallback, 200)
    );

    // 디바운스된 콜백 호출
    act(() => {
      debouncedCallbackResult.current(debounceResult.current);
    });

    // 콜백이 즉시 호출되지 않음
    expect(mockCallback).not.toHaveBeenCalled();

    // 디바운스 시간 경과
    act(() => {
      jest.advanceTimersByTime(200);
    });

    expect(mockCallback).toHaveBeenCalledWith("test");
  });
});
