import { expect, test } from "@playwright/test";

test.describe("Responsive Design", () => {
  test("should work on mobile viewport", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 }); // iPhone SE
    await page.goto("/");

    // 모바일에서 로그인 버튼이 보이는지 확인
    await expect(page.locator("text=로그인").first()).toBeVisible();

    // 헤더 텍스트 크기가 모바일에 맞게 조정되는지 확인
    const header = page.locator("h1").first();
    await expect(header).toHaveClass(/text-3xl/);

    // 피처 카드들이 모바일에 맞게 표시되는지 확인
    const featureCards = page.locator('[class*="border"][class*="rounded-lg"]');
    await expect(featureCards.first()).toBeVisible();

    // 테마 토글 버튼이 모바일에서도 작동하는지 확인
    const themeToggle = page.locator('button[aria-label*="Toggle theme"]');
    await themeToggle.click();
    await page.locator("text=Dark").click();
    await expect(page.locator("html")).toHaveClass(/dark/);
  });

  test("should work on tablet viewport", async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 }); // iPad
    await page.goto("/");

    // 태블릿에서 그리드 레이아웃이 제대로 작동하는지 확인
    const featureCards = page.locator('[class*="border"][class*="rounded-lg"]');
    await expect(featureCards).toHaveCount(3);

    // 로그인/회원가입 버튼들이 보이는지 확인
    await expect(page.locator("text=로그인").first()).toBeVisible();
    await expect(page.locator("text=회원가입").first()).toBeVisible();
  });

  test("should work on desktop viewport", async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 }); // Desktop
    await page.goto("/");

    // 데스크톱에서 모든 요소가 제대로 표시되는지 확인
    await expect(page.locator("h1")).toContainText("WeProud");

    // 피처 카드들이 3열로 표시되는지 확인
    const featureCards = page.locator('[class*="border"][class*="rounded-lg"]');
    await expect(featureCards).toHaveCount(3);

    // 네비게이션 메뉴가 완전히 표시되는지 확인
    const loginButton = page
      .locator("button")
      .filter({ hasText: "로그인" })
      .first();
    const signupButton = page
      .locator("button")
      .filter({ hasText: "회원가입" })
      .first();

    await expect(loginButton).toBeVisible();
    await expect(signupButton).toBeVisible();
  });

  test("should handle navigation on mobile", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto("/");

    // 모바일에서 로그인 페이지로 이동
    await page.locator("text=로그인").first().click();
    await expect(page).toHaveURL(/.*signin/);

    // 모바일에서도 폼이 제대로 작동하는지 확인
    await expect(page.locator('input[name="email"]')).toBeVisible();
    await expect(page.locator('input[name="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });
});
