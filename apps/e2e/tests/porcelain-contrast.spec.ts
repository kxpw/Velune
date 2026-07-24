import { expect, test, type Page } from "@playwright/test";
import { openWithTheme, type PorcelainTheme } from "./porcelain-theme";

type ContrastPair = {
  name: string;
  foreground: string;
  background: string;
  minimum: number | ((theme: PorcelainTheme) => number);
};

const themes: PorcelainTheme[] = ["light", "dark", "high-contrast"];
const pairs: ContrastPair[] = [
  {
    name: "primary text",
    foreground: "--color-text-primary",
    background: "--color-canvas",
    minimum: 4.5,
  },
  {
    name: "secondary text",
    foreground: "--color-text-secondary",
    background: "--color-canvas",
    minimum: 4.5,
  },
  {
    name: "default border",
    foreground: "--color-border-default",
    background: "--color-surface",
    minimum: (theme) => (theme === "high-contrast" ? 3 : 1.15),
  },
  {
    name: "focus border",
    foreground: "--color-border-focus",
    background: "--color-surface",
    minimum: 3,
  },
  {
    name: "success status",
    foreground: "--color-success",
    background: "--color-surface",
    minimum: 3,
  },
  {
    name: "warning status",
    foreground: "--color-warning",
    background: "--color-surface",
    minimum: 3,
  },
  {
    name: "error status",
    foreground: "--color-error",
    background: "--color-surface",
    minimum: 3,
  },
  {
    name: "primary CTA",
    foreground: "--color-on-primary",
    background: "--color-primary-strong",
    minimum: 4.5,
  },
];

for (const theme of themes) {
  test(`${theme} semantic colors meet contrast gates`, async ({ page }) => {
    await openWithTheme(page, "/components/button", theme);

    for (const pair of pairs) {
      const ratio = await tokenContrast(page, pair.foreground, pair.background);
      const minimum =
        typeof pair.minimum === "function" ? pair.minimum(theme) : pair.minimum;
      expect(
        ratio,
        `${theme} ${pair.name}: ${pair.foreground} on ${pair.background}`,
      ).toBeGreaterThanOrEqual(minimum);
    }
  });
}

async function tokenContrast(
  page: Page,
  foreground: string,
  background: string,
): Promise<number> {
  const colors = await page.evaluate(
    ({ foregroundToken, backgroundToken }) => {
      const probe = document.createElement("span");
      probe.style.color = `var(${foregroundToken})`;
      probe.style.backgroundColor = `var(${backgroundToken})`;
      probe.style.position = "fixed";
      probe.style.inset = "-1px auto auto -1px";
      document.querySelector(".gs-theme-root")?.append(probe);
      const style = getComputedStyle(probe);
      const canvas = document.createElement("canvas");
      canvas.width = 1;
      canvas.height = 1;
      const context = canvas.getContext("2d", { willReadFrequently: true });
      if (!context) {
        throw new Error("Unable to create a color sampling canvas");
      }
      const sample = (color: string): [number, number, number] => {
        context.clearRect(0, 0, 1, 1);
        context.fillStyle = color;
        context.fillRect(0, 0, 1, 1);
        const [red, green, blue] = context.getImageData(0, 0, 1, 1).data;
        return [red!, green!, blue!];
      };
      const result = {
        foreground: sample(style.color),
        background: sample(style.backgroundColor),
      };
      probe.remove();
      return result;
    },
    { foregroundToken: foreground, backgroundToken: background },
  );

  return contrastRatio(colors.foreground, colors.background);
}

function contrastRatio(
  foreground: [number, number, number],
  background: [number, number, number],
): number {
  const lighter = Math.max(luminance(foreground), luminance(background));
  const darker = Math.min(luminance(foreground), luminance(background));
  return (lighter + 0.05) / (darker + 0.05);
}

function luminance([red, green, blue]: [number, number, number]): number {
  const [r, g, b] = [red, green, blue].map((channel) => {
    const value = channel / 255;
    return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r! + 0.7152 * g! + 0.0722 * b!;
}
