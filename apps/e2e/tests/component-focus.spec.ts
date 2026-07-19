import { expect, test } from "@playwright/test";

test("DatePicker moves and restores keyboard focus", async ({ page }) => {
  await page.goto("/components/date-picker");

  const preview = page.getByTestId("component-preview").first();
  const trigger = preview.getByRole("button", { name: "Launch date" });
  await trigger.click();

  await expect(page.locator(".gs-datepicker-panel")).toHaveAttribute(
    "data-ready",
    "true",
    { timeout: 10_000 },
  );
  const focusedDay = page.locator(".gs-datepicker-day:focus");
  await expect(focusedDay).toHaveText("13", { timeout: 10_000 });

  await focusedDay.press("ArrowRight");
  await expect(page.locator(".gs-datepicker-day:focus")).toHaveText("14");

  await page.keyboard.press("Home");
  await expect(page.locator(".gs-datepicker-day:focus")).toHaveText("12");
  await page.keyboard.press("End");
  await expect(page.locator(".gs-datepicker-day:focus")).toHaveText("18");

  await page.keyboard.press("Escape");
  await expect(trigger).toBeFocused();
  await expect(page.getByRole("dialog")).toBeHidden();
});

test("searchable Select restores focus when Escape closes its portal", async ({
  page,
}) => {
  await page.goto("/components/select");

  const trigger = page.getByRole("combobox", { name: "Member" });
  await trigger.click();

  const search = page.getByRole("searchbox", { name: "Search…" });
  await expect(search).toBeFocused();
  await search.press("Escape");

  await expect(trigger).toBeFocused();
  await expect(page.getByRole("listbox", { name: "Member" })).toBeHidden();
});
