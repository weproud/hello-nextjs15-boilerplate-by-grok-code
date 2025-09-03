"use client";

import { useEffect, useRef } from "react";

// 키보드 내비게이션 강화 훅
export function useKeyboardNavigation() {
  const containerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      // Tab 키 포커스 관리
      if (event.key === "Tab") {
        const focusableElements = container.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );

        const firstElement = focusableElements[0] as HTMLElement;
        const lastElement = focusableElements[
          focusableElements.length - 1
        ] as HTMLElement;

        if (event.shiftKey) {
          // Shift + Tab: 마지막 요소에서 첫 번째 요소로
          if (document.activeElement === firstElement) {
            event.preventDefault();
            lastElement?.focus();
          }
        } else {
          // Tab: 첫 번째 요소에서 마지막 요소로
          if (document.activeElement === lastElement) {
            event.preventDefault();
            firstElement?.focus();
          }
        }
      }

      // Escape 키로 모달 닫기 등
      if (event.key === "Escape") {
        const modal = container.closest('[role="dialog"]');
        if (modal) {
          const closeButton = modal.querySelector(
            '[aria-label="닫기"]'
          ) as HTMLElement;
          closeButton?.click();
        }
      }
    };

    container.addEventListener("keydown", handleKeyDown);
    return () => container.removeEventListener("keydown", handleKeyDown);
  }, []);

  return containerRef;
}

// 포커스 트랩 컴포넌트
export function FocusTrap({
  children,
  autoFocus = true,
}: {
  children: React.ReactNode;
  autoFocus?: boolean;
}) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!autoFocus) return;

    const container = containerRef.current;
    if (!container) return;

    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );

    const firstElement = focusableElements[0] as HTMLElement;
    firstElement?.focus();

    // 외부 클릭 시 포커스 유지
    const handleOutsideClick = (event: MouseEvent) => {
      if (!container.contains(event.target as Node)) {
        event.preventDefault();
        firstElement?.focus();
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [autoFocus]);

  return (
    <div ref={containerRef} tabIndex={-1}>
      {children}
    </div>
  );
}

// 스킵 링크 컴포넌트
export function SkipLinks() {
  return (
    <div className="sr-only focus-within:not-sr-only">
      <a
        href="#main-content"
        className="fixed top-4 left-4 z-50 bg-primary text-primary-foreground px-4 py-2 rounded-md shadow-lg focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
      >
        본문으로 건너뛰기
      </a>
    </div>
  );
}

// 스크린 리더 전용 텍스트 컴포넌트
export function ScreenReaderOnly({
  children,
  ...props
}: {
  children: React.ReactNode;
} & Record<string, unknown>) {
  return (
    <span className="sr-only" {...props}>
      {children}
    </span>
  );
}

// 라이브 리전 컴포넌트 (동적 콘텐츠 알림용)
export function LiveRegion({
  children,
  priority = "polite",
  ...props
}: {
  children: React.ReactNode;
  priority?: "polite" | "assertive";
} & Record<string, unknown>) {
  return (
    <div aria-live={priority} aria-atomic="true" className="sr-only" {...props}>
      {children}
    </div>
  );
}

// 접근성 개선을 위한 고차 컴포넌트
export function withAccessibility<P extends object>(
  Component: React.ComponentType<P>,
  options: {
    skipLink?: boolean;
    focusTrap?: boolean;
    keyboardNavigation?: boolean;
  } = {}
) {
  const {
    skipLink = false,
    focusTrap = false,
    keyboardNavigation = false,
  } = options;

  const WrappedComponent = (props: P) => {
    const containerRef = useKeyboardNavigation();

    return (
      <div
        ref={
          keyboardNavigation
            ? (containerRef as React.RefObject<HTMLDivElement>)
            : undefined
        }
      >
        {skipLink && <SkipLinks />}
        {focusTrap ? (
          <FocusTrap>
            <Component {...props} />
          </FocusTrap>
        ) : (
          <Component {...props} />
        )}
      </div>
    );
  };

  WrappedComponent.displayName = `withAccessibility(${
    Component.displayName || Component.name
  })`;

  return WrappedComponent;
}

// 접근성 관련 유틸리티 함수들
export const accessibilityUtils = {
  // 요소에 포커스 설정
  focusElement: (element: HTMLElement | null) => {
    if (element) {
      element.focus();
      // 스크롤하여 요소가 보이도록 함
      element.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  },

  // 포커스 가능한 요소들 찾기
  getFocusableElements: (container: HTMLElement) => {
    return container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
  },

  // 다음 포커스 가능한 요소로 이동
  moveFocus: (direction: "next" | "previous", container: HTMLElement) => {
    const focusableElements =
      accessibilityUtils.getFocusableElements(container);
    const currentIndex = Array.from(focusableElements).indexOf(
      document.activeElement as Element
    );

    let nextIndex;
    if (direction === "next") {
      nextIndex =
        currentIndex + 1 >= focusableElements.length ? 0 : currentIndex + 1;
    } else {
      nextIndex =
        currentIndex - 1 < 0 ? focusableElements.length - 1 : currentIndex - 1;
    }

    accessibilityUtils.focusElement(
      focusableElements[nextIndex] as HTMLElement
    );
  },

  // ARIA 속성 동적 업데이트
  updateAriaAttributes: (
    element: HTMLElement,
    attributes: Record<string, string | boolean | null>
  ) => {
    Object.entries(attributes).forEach(([key, value]) => {
      if (value === null) {
        element.removeAttribute(key);
      } else if (typeof value === "boolean") {
        element.setAttribute(key, value.toString());
      } else {
        element.setAttribute(key, value);
      }
    });
  },
};
