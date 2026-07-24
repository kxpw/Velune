import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Locator, type Page } from "@playwright/test";

async function expectNoSeriousAxeViolations(page: Page) {
  const results = await new AxeBuilder({ page }).analyze();
  const violations = results.violations
    .filter(
      (violation) =>
        violation.impact === "critical" || violation.impact === "serious",
    )
    .map((violation) => ({
      id: violation.id,
      impact: violation.impact,
      targets: violation.nodes.flatMap((node) => node.target),
    }));

  expect(violations).toEqual([]);
}

async function readHoveredColors(
  page: Page,
  hoverTarget: Locator,
  colorTarget: Locator = hoverTarget,
): Promise<{ background: string; border: string }> {
  await hoverTarget.hover();
  await page.waitForTimeout(250);
  return colorTarget.evaluate((element) => {
    const styles = getComputedStyle(element);
    return {
      background: styles.backgroundColor,
      border: styles.borderTopColor,
    };
  });
}

test("Cmd/Ctrl+K searches pages and supports keyboard navigation", async ({
  page,
}) => {
  await page.goto("/");
  await page.keyboard.press("Control+k");

  const search = page.getByRole("combobox", {
    name: "Search components and pages",
  });
  await expect(search).toBeFocused();
  await search.fill("theme playground");
  await expect(
    page.getByRole("option", { name: /Theme playground/ }),
  ).toBeVisible();
  await expectNoSeriousAxeViolations(page);

  await search.press("Enter");
  await expect(page).toHaveURL(/\/theme-playground(?:\?.*)?$/);
  await expect(page.getByRole("heading", { name: "New theme" })).toBeVisible();
});

test("theme builder updates tokens, URL configuration, and preview scenes", async ({
  page,
}) => {
  test.setTimeout(60_000);
  await page.goto("/theme-playground");

  const preview = page.getByTestId("theme-playground-preview");
  const initialBrand = await preview.evaluate((element) =>
    element.style.getPropertyValue("--color-brand-400"),
  );
  const previewCard = preview.locator(".gs-card").first();
  const initialCanvas = await preview.evaluate(
    (element) => getComputedStyle(element).backgroundColor,
  );
  const initialCardBackground = await previewCard.evaluate(
    (element) => getComputedStyle(element).backgroundColor,
  );

  async function pickLabeledOption(label: string, optionName: string) {
    await page.getByRole("combobox", { name: label }).click();
    await page.getByRole("option", { name: optionName }).click();
  }

  await pickLabeledOption("Base", "Use Slate base palette");
  await expect
    .poll(() =>
      preview.evaluate((element) => getComputedStyle(element).backgroundColor),
    )
    .not.toBe(initialCanvas);
  await expect
    .poll(() =>
      previewCard.evaluate(
        (element) => getComputedStyle(element).backgroundColor,
      ),
    )
    .not.toBe(initialCardBackground);

  await page.getByRole("tab", { name: "Forms" }).click();
  const weeklyDigest = preview.locator(".gs-switch").filter({
    hasText: "Weekly digest",
  });
  await expect(weeklyDigest).toBeVisible();
  const initialSwitchHover = await readHoveredColors(
    page,
    weeklyDigest,
    weeklyDigest.locator(".gs-switch-track"),
  );
  await page.getByRole("tab", { name: "Components" }).click();

  const secondaryButton = preview.getByRole("button", {
    name: "Share",
    exact: true,
  });
  const ghostButton = preview.getByRole("button", {
    name: "Notifications",
    exact: true,
  });
  const inputShell = preview.locator(".gs-input-shell").first();
  const selectControl = preview.locator(".gs-select-control").first();
  const initialSecondaryHover = await readHoveredColors(page, secondaryButton);
  const initialGhostHover = await readHoveredColors(page, ghostButton);
  const initialInputHover = await readHoveredColors(page, inputShell);
  const initialSelectHover = await readHoveredColors(page, selectControl);

  await page.getByRole("button", { name: "Use Cobalt brand color" }).click();
  expect(await readHoveredColors(page, secondaryButton)).not.toEqual(
    initialSecondaryHover,
  );
  expect(await readHoveredColors(page, ghostButton)).not.toEqual(
    initialGhostHover,
  );
  expect(await readHoveredColors(page, inputShell)).not.toEqual(
    initialInputHover,
  );
  expect(await readHoveredColors(page, selectControl)).not.toEqual(
    initialSelectHover,
  );
  await page.getByRole("tab", { name: "Forms" }).click();
  expect(
    await readHoveredColors(
      page,
      weeklyDigest,
      weeklyDigest.locator(".gs-switch-track"),
    ),
  ).not.toEqual(initialSwitchHover);
  await pickLabeledOption("Mood", "Futuristic");
  await pickLabeledOption("Contrast", "WCAG AAA");
  await pickLabeledOption("Radius", "Soft");
  await pickLabeledOption("Font", "Source Serif");
  await page.getByRole("tab", { name: "Dark" }).click();

  await expect(preview).toHaveAttribute("data-theme", "dark");
  await expect
    .poll(() =>
      preview.evaluate((element) =>
        element.style.getPropertyValue("--color-brand-400"),
      ),
    )
    .not.toBe(initialBrand);
  await expect
    .poll(() =>
      preview.evaluate((element) => ({
        radius: element.style.getPropertyValue("--radius-sm"),
        font: element.style.getPropertyValue("--font-family-sans"),
      })),
    )
    .toEqual({
      radius: "16px",
      font: "'Source Serif 4', 'Noto Serif SC', Georgia, serif",
    });
  await expect
    .poll(() =>
      previewCard.evaluate(
        (element) => getComputedStyle(element).borderTopLeftRadius,
      ),
    )
    .toBe("16px");
  await expect
    .poll(() =>
      previewCard.evaluate(
        (element) => getComputedStyle(element).backgroundColor,
      ),
    )
    .not.toBe("rgb(255, 255, 255)");

  const params = new URL(page.url()).searchParams;
  expect(Object.fromEntries(params)).toMatchObject({
    brand: "2463eb",
    mood: "futuristic",
    base: "slate",
    contrast: "AAA",
    mode: "dark",
    radius: "soft",
    font: "serif",
  });

  await page.getByRole("tab", { name: "Dashboard" }).click();
  await expect(
    page.getByRole("heading", { name: "Good morning, Maya" }),
  ).toBeVisible();
  await page.getByRole("tab", { name: "Forms" }).click();
  await expect(
    page.getByRole("heading", { name: "Create your workspace" }),
  ).toBeVisible();
  await expectNoSeriousAxeViolations(page);
});

test("theme builder exports CSS and React configuration without mobile overflow", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/theme-playground");

  await expect
    .poll(() =>
      page.evaluate(
        () =>
          document.documentElement.scrollWidth <=
          document.documentElement.clientWidth,
      ),
    )
    .toBe(true);

  await page.getByRole("button", { name: "Export", exact: true }).click();
  const dialog = page.getByRole("dialog", { name: "Export theme" });
  await expect(dialog).toBeVisible();
  await expect(
    dialog.getByText("--color-primary", { exact: false }),
  ).toBeVisible();

  await dialog.getByRole("tab", { name: "React" }).click();
  await expect(dialog.getByText("brandColor", { exact: false })).toBeVisible();
  await expectNoSeriousAxeViolations(page);
});
