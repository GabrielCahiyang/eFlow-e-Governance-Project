import { expect, test } from "@playwright/test";

for (const width of [320, 375, 768, 1024]) {
  test(`login keeps the form and project board available at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 740 });
    await page.goto("/", { waitUntil: "domcontentloaded" });

    await expect(page.locator("#login-email")).toBeVisible();
    await expect(page.locator("#login-password")).toBeVisible();
    await expect(page.locator("#login-submit")).toBeVisible();
    await expect(page.getByRole("region", { name: "Interactive project preview board" })).toBeVisible();

    await page.getByRole("button", { name: "Choose a development account" }).click();
    await expect(page.getByRole("dialog", { name: "Development Usage Scenarios" })).toBeVisible();
    await page.getByRole("button", { name: "Close dialog" }).click();

    const dimensions = await page.evaluate(() => ({
      documentWidth: document.documentElement.scrollWidth,
      viewportWidth: window.innerWidth,
    }));
    expect(dimensions.documentWidth).toBeLessThanOrEqual(dimensions.viewportWidth + 1);
  });
}
