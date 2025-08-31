import { expect, test } from "@playwright/test";

test.describe("Home Page", () => {
  test("should load home page correctly", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // 페이지 제목 확인
    await expect(page).toHaveTitle(/WeProud/);

    // 메인 헤더 확인
    await expect(page.locator("h1")).toContainText("WeProud");

    // 테마 토글 버튼 존재 확인
    await expect(
      page.locator("button").filter({ hasText: "Toggle theme" }),
    ).toBeVisible();

    // 피처 카드들 확인
    await expect(page.locator("text=콘텐츠 관리")).toBeVisible();
    await expect(page.locator("text=커뮤니티")).toBeVisible();
    await expect(page.locator("text=설정 및 테마")).toBeVisible();
  });

  test("should toggle theme correctly", async ({ page }) => {
    await page.goto("/");

    // 라이트 모드에서 다크 모드로 변경
    const themeToggle = page.locator('button[aria-label*="Toggle theme"]');
    await themeToggle.click();

    // 드롭다운 메뉴에서 Dark 선택
    await page.locator("text=Dark").click();

    // HTML 요소에 dark 클래스가 추가되었는지 확인
    await expect(page.locator("html")).toHaveClass(/dark/);

    // 다시 라이트 모드로 변경
    await themeToggle.click();
    await page.locator("text=Light").click();

    // dark 클래스가 제거되었는지 확인
    await expect(page.locator("html")).not.toHaveClass(/dark/);
  });

  test("should navigate to auth pages", async ({ page }) => {
    await page.goto("/");

    // 로그인 버튼 클릭
    await page.locator("text=로그인").first().click();

    // 로그인 페이지로 이동했는지 확인
    await expect(page).toHaveURL("/auth/signin");
    await expect(page.locator("text=로그인")).toBeVisible();

    // 뒤로가기 후 회원가입 버튼 클릭
    await page.goBack();
    await page.locator("text=회원가입").first().click();

    // 회원가입 페이지로 이동했는지 확인
    await expect(page).toHaveURL("/auth/signup");
    await expect(page.locator("text=회원가입")).toBeVisible();
  });
});
