import { renderHook, act } from "@testing-library/react";
import { useLocalStorage } from "../use-local-storage";

// Mock localStorage
const mockLocalStorage = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, "localStorage", {
  value: mockLocalStorage,
  writable: true,
});

describe("useLocalStorage", () => {
  beforeEach(() => {
    mockLocalStorage.clear();
  });

  it("should return initial value when localStorage is empty", () => {
    const { result } = renderHook(() => useLocalStorage("test-key", "initial"));

    expect(result.current[0]).toBe("initial");
  });

  it("should return stored value when localStorage has data", () => {
    mockLocalStorage.setItem("test-key", JSON.stringify("stored-value"));

    const { result } = renderHook(() => useLocalStorage("test-key", "initial"));

    expect(result.current[0]).toBe("stored-value");
  });

  it("should handle complex objects", () => {
    const complexObject = { id: 1, name: "test", nested: { value: true } };

    const { result } = renderHook(() => useLocalStorage("complex-key", complexObject));

    expect(result.current[0]).toEqual(complexObject);
  });

  it("should update localStorage when setValue is called", () => {
    const { result } = renderHook(() => useLocalStorage("test-key", "initial"));

    act(() => {
      result.current[1]("updated-value");
    });

    expect(result.current[0]).toBe("updated-value");
    expect(mockLocalStorage.getItem("test-key")).toBe(JSON.stringify("updated-value"));
  });

  it("should handle function updater", () => {
    const { result } = renderHook(() => useLocalStorage("counter", 0));

    act(() => {
      result.current[1]((prev) => prev + 1);
    });

    expect(result.current[0]).toBe(1);
    expect(mockLocalStorage.getItem("counter")).toBe("1");
  });

  it("should remove value when removeValue is called", () => {
    mockLocalStorage.setItem("test-key", JSON.stringify("stored"));

    const { result } = renderHook(() => useLocalStorage("test-key", "initial"));

    act(() => {
      result.current[2](); // removeValue
    });

    expect(result.current[0]).toBe("initial");
    expect(mockLocalStorage.getItem("test-key")).toBeNull();
  });

  it("should handle localStorage errors gracefully", () => {
    // Mock JSON.parse to throw error
    const originalParse = JSON.parse;
    JSON.parse = jest.fn(() => {
      throw new Error("Parse error");
    });

    const { result } = renderHook(() => useLocalStorage("error-key", "fallback"));

    expect(result.current[0]).toBe("fallback");

    // Restore JSON.parse
    JSON.parse = originalParse;
  });

  it("should handle localStorage setItem errors", () => {
    const consoleSpy = jest.spyOn(console, "warn").mockImplementation(() => {});

    // Mock localStorage.setItem to throw error
    const originalSetItem = mockLocalStorage.setItem;
    mockLocalStorage.setItem = jest.fn(() => {
      throw new Error("Storage quota exceeded");
    });

    const { result } = renderHook(() => useLocalStorage("error-key", "initial"));

    act(() => {
      result.current[1]("new-value");
    });

    // State should still update despite localStorage error
    expect(result.current[0]).toBe("new-value");
    expect(consoleSpy).toHaveBeenCalledWith(
      'Error setting localStorage key "error-key":',
      expect.any(Error)
    );

    // Restore
    mockLocalStorage.setItem = originalSetItem;
    consoleSpy.mockRestore();
  });

  it("should sync with other tabs/windows via storage event", () => {
    const { result } = renderHook(() => useLocalStorage("sync-key", "initial"));

    // Simulate storage event from another tab
    const storageEvent = new StorageEvent("storage", {
      key: "sync-key",
      newValue: JSON.stringify("external-change"),
      storageArea: window.localStorage,
    });

    act(() => {
      window.dispatchEvent(storageEvent);
    });

    expect(result.current[0]).toBe("external-change");
  });

  it("should not sync when storage event is for different key", () => {
    const { result } = renderHook(() => useLocalStorage("sync-key", "initial"));

    const storageEvent = new StorageEvent("storage", {
      key: "different-key",
      newValue: JSON.stringify("external-change"),
      storageArea: window.localStorage,
    });

    act(() => {
      window.dispatchEvent(storageEvent);
    });

    expect(result.current[0]).toBe("initial");
  });

  it("should handle malformed JSON in storage event", () => {
    const consoleSpy = jest.spyOn(console, "warn").mockImplementation(() => {});

    const { result } = renderHook(() => useLocalStorage("malformed-key", "initial"));

    const storageEvent = new StorageEvent("storage", {
      key: "malformed-key",
      newValue: "invalid-json",
      storageArea: window.localStorage,
    });

    act(() => {
      window.dispatchEvent(storageEvent);
    });

    // Should keep original value when JSON parsing fails
    expect(result.current[0]).toBe("initial");
    expect(consoleSpy).toHaveBeenCalled();

    consoleSpy.mockRestore();
  });

  it("should work in server-side rendering environment", () => {
    // Mock server environment
    const originalWindow = global.window;
    delete (global as any).window;

    const { result } = renderHook(() => useLocalStorage("ssr-key", "server-value"));

    expect(result.current[0]).toBe("server-value");

    // Restore window
    global.window = originalWindow;
  });

  it("should handle removeItem errors", () => {
    const consoleSpy = jest.spyOn(console, "warn").mockImplementation(() => {});

    const originalRemoveItem = mockLocalStorage.removeItem;
    mockLocalStorage.removeItem = jest.fn(() => {
      throw new Error("Remove error");
    });

    const { result } = renderHook(() => useLocalStorage("remove-error-key", "initial"));

    act(() => {
      result.current[2](); // removeValue
    });

    // Should still work despite error
    expect(result.current[0]).toBe("initial");
    expect(consoleSpy).toHaveBeenCalled();

    // Restore
    mockLocalStorage.removeItem = originalRemoveItem;
    consoleSpy.mockRestore();
  });
});

// Integration tests
describe("useLocalStorage Integration", () => {
  it("should persist data across re-renders", () => {
    const { result, rerender } = renderHook(
      ({ key }) => useLocalStorage(key, "default"),
      { initialProps: { key: "persist-test" } }
    );

    act(() => {
      result.current[1]("persisted-value");
    });

    expect(result.current[0]).toBe("persisted-value");

    // Re-render with same key
    rerender({ key: "persist-test" });

    expect(result.current[0]).toBe("persisted-value");
  });

  it("should handle key changes", () => {
    const { result, rerender } = renderHook(
      ({ key }) => useLocalStorage(key, "default"),
      { initialProps: { key: "key1" } }
    );

    act(() => {
      result.current[1]("value1");
    });

    expect(result.current[0]).toBe("value1");

    // Change key
    rerender({ key: "key2" });

    expect(result.current[0]).toBe("default"); // Should use initial value for new key
  });

  it("should work with arrays", () => {
    const initialArray = [1, 2, 3];
    const { result } = renderHook(() => useLocalStorage("array-key", initialArray));

    expect(result.current[0]).toEqual(initialArray);

    act(() => {
      result.current[1]((prev) => [...prev, 4]);
    });

    expect(result.current[0]).toEqual([1, 2, 3, 4]);
  });
});
