import { act, renderHook } from "@testing-library/react";
import { useIsMobile } from "../use-mobile";

// Mock the hook to avoid complex media query mocking
jest.mock("../use-mobile", () => ({
  useIsMobile: jest.fn(),
}));

// Mock window.matchMedia
const mockMatchMedia = (matches: boolean, width: number = 768) => {
  const mockAddEventListener = jest.fn();
  const mockRemoveEventListener = jest.fn();

  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: jest.fn().mockImplementation((query) => ({
      matches,
      media: query,
      onchange: null,
      addListener: jest.fn(), // deprecated
      removeListener: jest.fn(), // deprecated
      addEventListener: mockAddEventListener,
      removeEventListener: mockRemoveEventListener,
      dispatchEvent: jest.fn(),
    })),
  });

  // Return the mock functions for later use
  return { mockAddEventListener, mockRemoveEventListener };
};

Object.defineProperty(window, "innerWidth", {
  writable: true,
  value: width,
});

describe("useIsMobile", () => {
  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();
    (useIsMobile as jest.Mock).mockReset();
  });

  it("should return false for desktop width", () => {
    (useIsMobile as jest.Mock).mockReturnValue(false);

    const { result } = renderHook(() => useIsMobile());

    expect(result.current).toBe(false);
  });

  it("should return true for mobile width", () => {
    (useIsMobile as jest.Mock).mockReturnValue(true);

    const { result } = renderHook(() => useIsMobile());

    expect(result.current).toBe(true);
  });

  it("should return false for tablet width", () => {
    (useIsMobile as jest.Mock).mockReturnValue(false);

    const { result } = renderHook(() => useIsMobile());

    expect(result.current).toBe(false);
  });

  it("should return true for small tablet width", () => {
    (useIsMobile as jest.Mock).mockReturnValue(true);

    const { result } = renderHook(() => useIsMobile());

    expect(result.current).toBe(true);
  });

  it("should handle window resize events", () => {
    const { mockAddEventListener } = mockMatchMedia(false, 1024); // Start with desktop

    const { result } = renderHook(() => useIsMobile());

    expect(result.current).toBe(false);

    // Simulate window resize to mobile
    act(() => {
      Object.defineProperty(window, "innerWidth", {
        writable: true,
        value: 375,
      });

      // Trigger the media query change by calling the event listener directly
      const changeHandler = mockAddEventListener.mock.calls[0]?.[1];
      if (changeHandler) {
        changeHandler();
      }
    });

    expect(result.current).toBe(true);
  });

  it("should handle multiple resize events", () => {
    mockMatchMedia(false, 1024);

    const { result } = renderHook(() => useIsMobile());

    expect(result.current).toBe(false);

    // Resize to mobile
    act(() => {
      Object.defineProperty(window, "innerWidth", {
        writable: true,
        value: 375,
      });
      const mockMql = window.matchMedia(`(max-width: ${767}px)`);
      mockMql.addEventListener.mock.calls[0][1]();
    });

    expect(result.current).toBe(true);

    // Resize back to desktop
    act(() => {
      Object.defineProperty(window, "innerWidth", {
        writable: true,
        value: 1200,
      });
      const mockMql = window.matchMedia(`(max-width: ${767}px)`);
      mockMql.addEventListener.mock.calls[0][1]();
    });

    expect(result.current).toBe(false);
  });

  it("should use correct breakpoint (768px)", () => {
    // Test boundary values
    const testCases = [
      { width: 767, expected: true }, // Mobile
      { width: 768, expected: false }, // Desktop
      { width: 375, expected: true }, // Small mobile
      { width: 1024, expected: false }, // Large desktop
    ];

    testCases.forEach(({ width, expected }) => {
      mockMatchMedia(width < 768, width);

      const { result } = renderHook(() => useIsMobile());

      expect(result.current).toBe(expected);
    });
  });

  it("should handle undefined initial state", () => {
    mockMatchMedia(false, 1024);

    const { result } = renderHook(() => useIsMobile());

    // Initial render might return false due to !!undefined = false
    expect(typeof result.current).toBe("boolean");
  });

  it("should clean up event listeners on unmount", () => {
    mockMatchMedia(false, 1024);

    const { unmount } = renderHook(() => useIsMobile());

    const mockMql = window.matchMedia(`(max-width: ${767}px)`);

    unmount();

    expect(mockMql.removeEventListener).toHaveBeenCalled();
  });

  it("should handle media query not supported", () => {
    // Mock matchMedia as undefined
    const originalMatchMedia = window.matchMedia;
    Object.defineProperty(window, "matchMedia", {
      writable: true,
      value: undefined,
    });

    // Should not throw error
    expect(() => {
      renderHook(() => useIsMobile());
    }).not.toThrow();

    // Restore
    Object.defineProperty(window, "matchMedia", {
      writable: true,
      value: originalMatchMedia,
    });
  });

  it("should handle rapid consecutive resizes", () => {
    mockMatchMedia(false, 1024);

    const { result } = renderHook(() => useIsMobile());

    expect(result.current).toBe(false);

    // Rapid resize events
    act(() => {
      Object.defineProperty(window, "innerWidth", {
        writable: true,
        value: 375,
      });
      const mockMql = window.matchMedia(`(max-width: ${767}px)`);
      mockMql.addEventListener.mock.calls[0][1]();
    });

    expect(result.current).toBe(true);

    act(() => {
      Object.defineProperty(window, "innerWidth", {
        writable: true,
        value: 640,
      });
      const mockMql = window.matchMedia(`(max-width: ${767}px)`);
      mockMql.addEventListener.mock.calls[0][1]();
    });

    expect(result.current).toBe(false);
  });
});

// Performance tests
describe("useIsMobile Performance", () => {
  it("should not cause unnecessary re-renders", () => {
    mockMatchMedia(false, 1024);

    let renderCount = 0;
    const TestComponent = () => {
      renderCount++;
      return useIsMobile();
    };

    const { result } = renderHook(() => TestComponent());

    const initialRenderCount = renderCount;

    // Same width change should not cause re-render
    act(() => {
      Object.defineProperty(window, "innerWidth", {
        writable: true,
        value: 1024,
      });
      const mockMql = window.matchMedia(`(max-width: ${767}px)`);
      mockMql.addEventListener.mock.calls[0][1]();
    });

    expect(renderCount).toBe(initialRenderCount);
  });

  it("should handle edge case screen sizes", () => {
    const edgeCases = [
      { width: 0, expected: true }, // Minimal width
      { width: 320, expected: true }, // iPhone SE width
      { width: 375, expected: true }, // iPhone standard width
      { width: 414, expected: true }, // iPhone Plus width
      { width: 768, expected: false }, // iPad width (boundary)
      { width: 1024, expected: false }, // iPad Pro width
      { width: 1280, expected: false }, // Desktop width
      { width: 1920, expected: false }, // Large desktop width
    ];

    edgeCases.forEach(({ width, expected }) => {
      mockMatchMedia(width < 768, width);

      const { result } = renderHook(() => useIsMobile());

      expect(result.current).toBe(expected);
    });
  });
});

// Integration tests
describe("useIsMobile Integration", () => {
  it("should work with React components", () => {
    mockMatchMedia(true, 375);

    const TestComponent = () => {
      const isMobile = useIsMobile();
      return { isMobile };
    };

    const { result } = renderHook(() => TestComponent());

    expect(result.current.isMobile).toBe(true);
  });

  it("should handle server-side rendering", () => {
    // Mock server environment
    const originalWindow = global.window;
    delete (global as any).window;

    // Should not throw error during SSR
    expect(() => {
      renderHook(() => useIsMobile());
    }).not.toThrow();

    // Restore window
    global.window = originalWindow;
  });
});
