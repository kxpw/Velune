import { expect, test } from "@playwright/test";

type ThemeSnapshot = {
  background: string;
  colorScheme: string;
  text: string;
};

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    window.localStorage.setItem("velune-theme", "light");
  });
});

test("every component preview inherits light and dark semantic tokens", async ({
  context,
  page,
}) => {
  test.setTimeout(120_000);

  await page.goto("/components");
  const componentPaths = Array.from(
    new Set(
      await page
        .locator('main a[href^="/components/"]')
        .evaluateAll((links) =>
          links
            .map((link) => link.getAttribute("href"))
            .filter((href): href is string => Boolean(href)),
        ),
    ),
  );
  expect(componentPaths.length).toBeGreaterThan(0);

  for (const path of componentPaths) {
    const componentName = path.split("/").at(-1) ?? path;
    const componentPage = await context.newPage();
    await componentPage.addInitScript(() => {
      window.localStorage.setItem("velune-theme", "light");
    });
    await componentPage.goto(path);
    const previewComponent = componentPage
      .getByTestId("component-preview")
      .first();
    await expect(previewComponent, `${componentName} preview`).toBeVisible();

    const light = await previewComponent.evaluate<ThemeSnapshot>((element) => {
      const style = getComputedStyle(element);
      return {
        background: style.getPropertyValue("--color-bg").trim(),
        text: style.getPropertyValue("--color-text").trim(),
        colorScheme: getComputedStyle(document.documentElement).colorScheme,
      };
    });

    await componentPage
      .getByRole("button", { name: "Switch to dark theme" })
      .first()
      .click();
    await expect(componentPage.locator("html")).toHaveAttribute(
      "data-theme",
      "dark",
    );

    const dark = await previewComponent.evaluate<ThemeSnapshot>((element) => {
      const style = getComputedStyle(element);
      return {
        background: style.getPropertyValue("--color-bg").trim(),
        text: style.getPropertyValue("--color-text").trim(),
        colorScheme: getComputedStyle(document.documentElement).colorScheme,
      };
    });

    expect(dark.background, `${componentName} background token`).not.toBe(
      light.background,
    );
    expect(dark.text, `${componentName} text token`).not.toBe(light.text);
    expect(light.colorScheme).toBe("light");
    expect(dark.colorScheme).toBe("dark");

    await componentPage
      .getByRole("button", { name: "Switch to light theme" })
      .first()
      .click();
    await expect(componentPage.locator("html")).toHaveAttribute(
      "data-theme",
      "light",
    );
    await componentPage.close();
  }
});

test("portaled surfaces inherit the active theme", async ({ page }) => {
  await page.goto("/components/date-picker");
  const trigger = page.getByRole("button", { name: "Launch date" });
  const readSurface = () =>
    page.locator(".gs-datepicker-panel").evaluate((panel) => ({
      panelBackground: getComputedStyle(panel)
        .getPropertyValue("--color-bg")
        .trim(),
      rootBackground: getComputedStyle(
        document.querySelector(".gs-theme-root")!,
      )
        .getPropertyValue("--color-bg")
        .trim(),
      surface: getComputedStyle(panel).backgroundColor,
    }));

  await trigger.click();
  const light = await readSurface();
  await page.keyboard.press("Escape");

  await page
    .getByRole("button", { name: "Switch to dark theme" })
    .first()
    .click();
  await trigger.click();
  const dark = await readSurface();

  expect(light.panelBackground).toBe(light.rootBackground);
  expect(dark.panelBackground).toBe(dark.rootBackground);
  expect(dark.surface).not.toBe(light.surface);
});
