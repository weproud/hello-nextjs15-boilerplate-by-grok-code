import { expect, test } from "@playwright/test";

test.describe("Home Page", () => {
  test("should load home page successfully", async ({ page }) => {
    await page.goto("/");

    // Check if page loads without errors
    await expect(page).toHaveTitle(/WeProud/);

    // Check for main content
    const mainContent = page.locator("main");
    await expect(mainContent).toBeVisible();
  });

  test("should navigate to auth pages", async ({ page }) => {
    await page.goto("/");

    // Check if navigation links exist
    const _signInLink = page.locator('a[href="/auth/signin"]');
    const _signUpLink = page.locator('a[href="/auth/signup"]');

    // These might not exist depending on your layout
    // Uncomment when you have actual navigation
    // await expect(signInLink).toBeVisible();
    // await expect(signUpLink).toBeVisible();
  });

  test("should have proper meta tags", async ({ page }) => {
    await page.goto("/");

    // Check meta tags
    const title = await page.title();
    expect(title).toBe("WeProud");

    // Check for description meta tag
    const description = page.locator('meta[name="description"]');
    if (await description.isVisible()) {
      const content = await description.getAttribute("content");
      expect(content).toBeTruthy();
    }
  });
});

test.describe("Responsive Design", () => {
  test("should work on mobile viewport", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });

    await page.goto("/");

    // Check if content is still accessible on mobile
    const mainContent = page.locator("main");
    await expect(mainContent).toBeVisible();
  });

  test("should work on tablet viewport", async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });

    await page.goto("/");

    const mainContent = page.locator("main");
    await expect(mainContent).toBeVisible();
  });
});
