import { renderHook, waitFor } from "@testing-library/react";
import { useAsync } from "../use-async";

// Mock fetch
const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>;

describe("useAsync", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should handle successful async operation", async () => {
    const mockData = { id: 1, name: "Test" };
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockData,
    } as Response);

    const mockApiCall = jest.fn().mockResolvedValue(mockData);

    const { result } = renderHook(() =>
      useAsync(mockApiCall, { immediate: true })
    );

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.data).toEqual(mockData);
    expect(result.current.isSuccess).toBe(true);
    expect(result.current.isError).toBe(false);
  });

  it("should handle error in async operation", async () => {
    const mockError = new Error("API Error");
    const mockApiCall = jest.fn().mockRejectedValue(mockError);

    const { result } = renderHook(() =>
      useAsync(mockApiCall, { immediate: true })
    );

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.error).toEqual(mockError);
    expect(result.current.isError).toBe(true);
    expect(result.current.isSuccess).toBe(false);
  });

  it("should not execute immediately when immediate is false", () => {
    const mockApiCall = jest.fn();

    const { result } = renderHook(() =>
      useAsync(mockApiCall, { immediate: false })
    );

    expect(result.current.isLoading).toBe(false);
    expect(mockApiCall).not.toHaveBeenCalled();
  });

  it("should execute on demand", async () => {
    const mockData = { id: 1, name: "Test" };
    const mockApiCall = jest.fn().mockResolvedValue(mockData);

    const { result } = renderHook(() =>
      useAsync(mockApiCall)
    );

    result.current.execute();

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.data).toEqual(mockData);
  });
});
