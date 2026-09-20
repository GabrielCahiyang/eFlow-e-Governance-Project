import { expect, test } from "@playwright/test";

test("admin creation dialogs remain usable on a narrow phone", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 740 });
  await page.goto("/", { waitUntil: "domcontentloaded" });

  const quickLogin = page.getByRole("button", { name: "Choose a development account" });
  test.skip(!(await quickLogin.isVisible()), "Local development account shortcuts are unavailable.");
  await quickLogin.click();
  await page.getByRole("menuitem", { name: /^Super Admin —/ }).click();
  await page.getByRole("button", { name: "Open navigation" }).waitFor();
  const dismissTour = page.getByRole("button", { name: "Maybe later" });
  await dismissTour.waitFor({ timeout: 3000 }).then(() => dismissTour.click()).catch(() => {});

  await page.getByRole("button", { name: "Open navigation" }).click();
  await page.locator('.eflow-mobile-navigation [data-tour-section="users"] .eflow-productivity-sidebar__item').click();
  await page.getByRole("button", { name: "Create user" }).click();
  const userDialog = page.getByRole("dialog", { name: "Create New User" });
  await expect(userDialog).toBeVisible();
  const userBounds = await userDialog.boundingBox();
  expect(userBounds).not.toBeNull();
  expect(userBounds!.x).toBeGreaterThanOrEqual(0);
  expect(userBounds!.x + userBounds!.width).toBeLessThanOrEqual(320);
  await expect(userDialog.getByPlaceholder("Juan Dela Cruz")).toBeVisible();
  await userDialog.getByRole("button", { name: "Close dialog" }).click();

  await page.getByRole("button", { name: "Open navigation" }).click();
  await page.locator('.eflow-mobile-navigation [data-tour-section="projects"] .eflow-productivity-sidebar__item').click();
  await page.getByRole("button", { name: "Create work plan" }).first().click();
  const planDialog = page.getByRole("dialog", { name: "Create a work plan" });
  await expect(planDialog).toBeVisible();
  const planInput = planDialog.getByPlaceholder(/2026 Coastal/i);
  await expect(planInput).toBeVisible();
  const inputBounds = await planInput.boundingBox();
  expect(inputBounds!.width).toBeGreaterThan(150);
});
