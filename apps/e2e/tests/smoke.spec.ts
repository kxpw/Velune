import { expect, test } from "@playwright/test";

test("docs loads", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Velune" })).toBeVisible();
  await expect(page.getByRole("button", { name: /Browse all/ })).toBeVisible();
});
