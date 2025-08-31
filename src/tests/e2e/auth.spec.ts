import { expect, test } from "@playwright/test";

test.describe("Authentication", () => {
  test("should register new user", async ({ page }) => {
    await page.goto("/auth/signup");
    await page.waitForLoadState("networkidle");

    // 페이지가 로드되었는지 확인
    await expect(
      page.locator('[data-slot="card-title"]').filter({ hasText: "회원가입" }),
    ).toBeVisible();

    // 회원가입 폼 입력
    await page.fill('input[name="name"]', "테스트 유저");
    await page.fill('input[name="email"]', `test${Date.now()}@example.com`);
    await page.fill('input[name="password"]', "password123");
    await page.fill('input[name="confirmPassword"]', "password123");

    // 회원가입 버튼 클릭
    await page.click('button[type="submit"]');

    // 잠시 기다렸다가 URL 확인
    await page.waitForTimeout(2000);
    await expect(page).toHaveURL(/.*signin/);
  });

  test("should login with valid credentials", async ({ page }) => {
    // 먼저 테스트 유저 생성 (실제로는 API를 통해)
    const testEmail = `login-test${Date.now()}@example.com`;

    // 회원가입 API 직접 호출
    await page.request.post("/api/auth/register", {
      data: {
        name: "로그인 테스트 유저",
        email: testEmail,
        password: "password123",
      },
    });

    // 로그인 페이지로 이동
    await page.goto("/auth/signin");

    // 로그인 폼 입력
    await page.fill('input[name="email"]', testEmail);
    await page.fill('input[name="password"]', "password123");

    // 로그인 버튼 클릭
    await page.click('button[type="submit"]');

    // 홈페이지로 리다이렉트되는지 확인
    await expect(page).toHaveURL("/");

    // 사용자 메뉴가 표시되는지 확인
    await expect(
      page.locator('button[aria-label*="Toggle theme"]').first(),
    ).toBeVisible();
  });

  test("should show error for invalid login", async ({ page }) => {
    await page.goto("/auth/signin");

    // 잘못된 자격 증명 입력
    await page.fill('input[name="email"]', "invalid@example.com");
    await page.fill('input[name="password"]', "wrongpassword");

    // 로그인 버튼 클릭
    await page.click('button[type="submit"]');

    // 에러 메시지가 표시되는지 확인
    await expect(
      page.locator("text=잘못된 이메일 또는 비밀번호입니다"),
    ).toBeVisible();
  });

  test("should validate form inputs", async ({ page }) => {
    await page.goto("/auth/signup");

    // 빈 폼 제출
    await page.click('button[type="submit"]');

    // 브라우저 기본 유효성 검증이 작동하는지 확인 (HTML5 validation)
    const nameInput = page.locator('input[name="name"]');
    const emailInput = page.locator('input[name="email"]');
    const passwordInput = page.locator('input[name="password"]');
    const confirmPasswordInput = page.locator('input[name="confirmPassword"]');

    await expect(nameInput).toHaveAttribute("required");
    await expect(emailInput).toHaveAttribute("required");
    await expect(passwordInput).toHaveAttribute("required");
    await expect(confirmPasswordInput).toHaveAttribute("required");
  });
});
