import { expect, type Page } from "@playwright/test";

export type PorcelainTheme = "light" | "dark" | "high-contrast";

export async function openWithTheme(
  page: Page,
  path: string,
  theme: PorcelainTheme,
): Promise<void> {
  await page.addInitScript((selectedTheme) => {
    window.localStorage.setItem(
      "velune-theme",
      selectedTheme === "dark" ? "dark" : "light",
    );
    if (selectedTheme === "high-contrast") {
      document.documentElement.setAttribute("data-high-contrast", "true");
    }
  }, theme);
  await page.goto(path);

  if (theme === "high-contrast") {
    await page.evaluate(() => {
      document.documentElement.setAttribute("data-high-contrast", "true");
      document
        .querySelectorAll<HTMLElement>(".gs-theme-root")
        .forEach((root) => root.setAttribute("data-high-contrast", "true"));
    });
    await expect(page.locator("html")).toHaveAttribute(
      "data-high-contrast",
      "true",
    );
    await waitForFonts(page);
    return;
  }

  await expect(page.locator("html")).toHaveAttribute("data-theme", theme);
  await waitForFonts(page);
}

/**
 * The docs app loads webfonts (Inter / Source Serif) asynchronously. Wait for
 * them to settle so screenshots don't capture the fallback face mid-swap.
 */
async function waitForFonts(page: Page): Promise<void> {
  await page.evaluate(() => document.fonts.ready);
}
