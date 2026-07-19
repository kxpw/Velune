import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import { openWithTheme } from "./porcelain-theme";

const primaryComponents = ["button", "input", "card", "table", "modal"];

for (const component of primaryComponents) {
  test(`${component} page has no serious Axe violations`, async ({ page }) => {
    await openWithTheme(page, `/components/${component}`, "light");

    if (component === "modal") {
      await page
        .getByTestId("component-preview")
        .first()
        .getByRole("button", { name: "Open modal" })
        .click();
      await expect(page.getByRole("dialog")).toBeVisible();
    }

    const results = await new AxeBuilder({ page }).analyze();
    const violations = results.violations
      .filter(
        (violation) =>
          violation.impact === "critical" || violation.impact === "serious",
      )
      .map((violation) => ({
        id: violation.id,
        impact: violation.impact,
        help: violation.help,
        targets: violation.nodes.flatMap((node) => node.target),
      }));

    expect(violations).toEqual([]);
  });
}
