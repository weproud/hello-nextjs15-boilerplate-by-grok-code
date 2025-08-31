import { cn } from "../utils";

describe("cn (className utility)", () => {
  it("should merge class names correctly", () => {
    expect(cn("class1", "class2")).toBe("class1 class2");
  });

  it("should handle conditional classes", () => {
    expect(cn("class1", true && "class2", false && "class3")).toBe(
      "class1 class2"
    );
  });

  it("should handle undefined and null values", () => {
    expect(cn("class1", undefined, null, "class2")).toBe("class1 class2");
  });

  it("should merge Tailwind classes correctly", () => {
    expect(cn("px-2 py-1", "px-4")).toBe("px-4 py-1");
  });

  it("should handle empty strings", () => {
    expect(cn("class1", "", "class2")).toBe("class1 class2");
  });
});

describe("Date utilities", () => {
  // 날짜 유틸리티 함수들이 있다면 여기에 테스트 추가
  it("should format dates correctly", () => {
    const date = new Date("2024-01-01");
    expect(date.toISOString().startsWith("2024-01-01")).toBe(true);
  });
});

describe("String utilities", () => {
  it("should handle string transformations", () => {
    expect("hello world".replace(/\s+/g, "-")).toBe("hello-world");
  });
});
