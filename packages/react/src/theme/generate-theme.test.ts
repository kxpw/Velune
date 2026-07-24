import { describe, expect, it } from "vitest";
import { contrastRatio, oklchToRgb, parseOklch } from "./color";
import { generateTheme, getThemeCss } from "./generate-theme";

describe("generateTheme", () => {
  it("is stable for the same seed", () => {
    const a = generateTheme({ brand: "#00A3FF" });
    const b = generateTheme({ brand: "#00A3FF" });
    expect(a.tokens).toEqual(b.tokens);
    expect(a.scale).toEqual(b.scale);
  });

  it("produces a 10-stop brand scale", () => {
    const theme = generateTheme({ brand: "#00A3FF", mood: "futuristic" });
    expect(Object.keys(theme.scale)).toEqual([
      "50",
      "100",
      "200",
      "300",
      "400",
      "500",
      "600",
      "700",
      "800",
      "900",
    ]);
    expect(theme.scale["400"]).toMatch(/^oklch\(/);
  });

  it("uses the restrained porcelain mood by default", () => {
    const theme = generateTheme({ brand: "#2F63B3" });
    expect(theme.mood).toBe("porcelain");
    expect(theme.base).toBe("porcelain");
    expect(theme.cssVars.light["--color-canvas"]).toBe("#F7F2E8");
    expect(theme.cssVars.light["--color-surface"]).toBe("#FDFBF6");
    expect(theme.cssVars.dark["--color-canvas"]).toBe("#1C1915");
    expect(theme.cssVars.dark["--color-surface"]).toBe("#242019");
    expect(theme.cssVars.light["--color-primary"]).not.toContain("gradient");
    expect(theme.cssVars.light).not.toHaveProperty("--color-accent");
    expect(theme.cssVars.light).not.toHaveProperty("--color-bg");
    expect(theme.cssVars.light).not.toHaveProperty("--color-text");
    expect(theme.cssVars.light).not.toHaveProperty("--color-surface-hover");
  });

  it("derives canvas and surface tokens from the selected base palette", () => {
    const porcelain = generateTheme({ brand: "#2463eb" });
    const slate = generateTheme({ brand: "#2463eb", base: "slate" });

    expect(slate.base).toBe("slate");
    expect(slate.scale).toEqual(porcelain.scale);
    expect(slate.cssVars.light["--color-canvas"]).toBe("#F8FAFC");
    expect(slate.cssVars.light["--color-surface-mist"]).toBe("#E2E8F0");
    expect(slate.cssVars.dark["--color-canvas"]).toBe("#0F172A");
    expect(slate.cssVars.dark["--color-surface-raised"]).toBe("#1E293B");
    expect(slate.cssVars.light["--color-canvas"]).not.toBe(
      porcelain.cssVars.light["--color-canvas"],
    );
  });

  it("meets AA contrast for light primary on white", () => {
    const theme = generateTheme({
      brand: "#7dd3fc",
      contrastRatio: "AA",
    });
    const primary = parseOklch(theme.cssVars.light["--color-primary"]!);
    expect(primary).not.toBeNull();
    const ratio = contrastRatio(oklchToRgb(primary!), {
      r: 255,
      g: 255,
      b: 255,
    });
    expect(ratio).toBeGreaterThanOrEqual(4.5);
  });

  it("meets AAA contrast for secondary text on the most muted surfaces", () => {
    const theme = generateTheme({
      brand: "#2463eb",
      mood: "futuristic",
      contrastRatio: "AAA",
    });
    const lightSecondary = parseOklch(
      theme.cssVars.light["--color-text-secondary"]!,
    );
    const darkSecondary = parseOklch(
      theme.cssVars.dark["--color-text-secondary"]!,
    );

    expect(lightSecondary).not.toBeNull();
    expect(darkSecondary).not.toBeNull();
    expect(
      contrastRatio(oklchToRgb(lightSecondary!), {
        r: 238,
        g: 230,
        b: 214,
      }),
    ).toBeGreaterThanOrEqual(7);
    expect(
      contrastRatio(oklchToRgb(darkSecondary!), {
        r: 53,
        g: 47,
        b: 37,
      }),
    ).toBeGreaterThanOrEqual(7);
  });

  it("applies mood differences", () => {
    const futuristic = generateTheme({ brand: "#3366FF", mood: "futuristic" });
    const porcelain = generateTheme({ brand: "#3366FF", mood: "porcelain" });
    const mono = generateTheme({ brand: "#3366FF", mood: "mono" });
    const warm = generateTheme({ brand: "#3366FF", mood: "warm" });

    const futC = parseOklch(futuristic.scale["500"]!)!.c;
    const porcelainC = parseOklch(porcelain.scale["500"]!)!.c;
    const monoC = parseOklch(mono.scale["500"]!)!.c;
    expect(monoC).toBeLessThan(futC);
    expect(porcelainC).toBeLessThan(futC);

    const futH = parseOklch(futuristic.scale["500"]!)!.h;
    const warmH = parseOklch(warm.scale["500"]!)!.h;
    // Warm shifts hue toward orange relative to brand.
    expect(Math.abs(warmH - futH)).toBeGreaterThan(5);
  });

  it("derives neutral interaction states from the active theme colors", () => {
    const theme = generateTheme({ brand: "#2463eb" });

    expect(theme.cssVars.light["--color-action-hover"]).toContain(
      "var(--color-primary)",
    );
    expect(theme.cssVars.light["--color-action-active"]).toContain(
      "var(--color-primary-strong)",
    );
    expect(theme.cssVars.dark["--color-action-hover"]).toContain(
      "var(--color-primary)",
    );
    expect(theme.cssVars.highContrast["--color-action-active"]).toContain(
      "var(--color-primary-strong)",
    );
    expect(theme.cssVars.highContrast).not.toHaveProperty(
      "--color-surface-active",
    );
  });

  it("serializes CSS for SSR", () => {
    const theme = generateTheme({ brand: "#00A3FF" });
    const css = getThemeCss(theme);
    expect(css).toContain(":root {");
    expect(css).toContain("--color-primary:");
    expect(css).toContain("--color-action-hover:");
    expect(css).toContain("--color-surface-raised:");
    expect(css).toContain("--color-brand-400:");
    expect(css).toContain('[data-theme="dark"]');
    expect(css).toContain("@media (prefers-color-scheme: dark)");
    expect(css).toContain('[data-high-contrast="true"]');
    expect(css).not.toContain('.gs-theme-root[data-theme="dark"]');
    expect(css).toContain('.gs-theme-root[data-high-contrast="true"]');
  });

  it("supports an explicit scoped root selector", () => {
    const theme = generateTheme({ brand: "#00A3FF" });
    const css = getThemeCss(theme, { rootSelector: ".gs-theme-root" });

    expect(css).toContain(".gs-theme-root {");
    expect(css).not.toContain(":root {");
    expect(css).toContain('.gs-theme-root[data-theme="dark"]');
    expect(css).toContain('.gs-theme-root[data-theme="system"]');
    expect(css).toContain('.gs-theme-root[data-high-contrast="true"]');
  });
});
