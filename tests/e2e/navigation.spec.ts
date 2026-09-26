import { expect, test } from "@playwright/test";
import { getRoleNavigation } from "../../src/app/features/navigation/roleNavigation";
import { getNavigationPath } from "../../src/app/features/navigation/navigationUrl";

interface E2EAccount {
  role: string;
  email: string;
  password: string;
}

const enabled = process.env.EFLOW_E2E === "1";
const accounts: E2EAccount[] = process.env.EFLOW_E2E_ACCOUNTS
  ? JSON.parse(process.env.EFLOW_E2E_ACCOUNTS) as E2EAccount[]
  : [];

test.describe("authenticated navigation smoke coverage", () => {
  test("requires configured test accounts", () => {
    test.skip(!enabled || accounts.length === 0, "Requires EFLOW_E2E=1 and EFLOW_E2E_ACCOUNTS test credentials.");
  });

  for (const account of accounts) {
    test(account.role + " can reach every visible sidebar destination", async ({ page }) => {
      await page.goto("/");
      await page.locator("#login-email").fill(account.email);
      await page.locator("#login-password").fill(account.password);
      await page.locator("#login-submit").click();
      await expect(page.getByRole("main", { name: "Active workspace" })).toBeVisible();

      for (const item of getRoleNavigation(account.role).navItems) {
        await page.getByRole("button", { name: item.label, exact: true }).click();
        await expect(page.getByText(item.label, { exact: true }).first()).toBeVisible();
        expect(new URL(page.url()).pathname).toBe(getNavigationPath(item.id));
      }
    });
  }
});
