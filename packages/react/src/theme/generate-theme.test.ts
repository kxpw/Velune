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
    expect(theme.cssVars.light["--color-canvas"]).toBe("#F7F2E8");
    expect(theme.cssVars.light["--color-surface"]).toBe("#FDFBF6");
    expect(theme.cssVars.dark["--color-canvas"]).toBe("#1C1915");
    expect(theme.cssVars.dark["--color-surface"]).toBe("#242019");
    expect(theme.cssVars.light["--color-accent"]).not.toContain("gradient");
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

  it("serializes CSS for SSR", () => {
    const theme = generateTheme({ brand: "#00A3FF" });
    const css = getThemeCss(theme);
    expect(css).toContain("--color-primary:");
    expect(css).toContain("--color-surface-raised:");
    expect(css).toContain("--color-brand-400:");
    expect(css).toContain('[data-theme="dark"]');
    expect(css).toContain('[data-high-contrast="true"]');
  });
});
