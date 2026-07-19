import { readFile, readdir } from "node:fs/promises";
import { describe, expect, it } from "vitest";

const tokensCss = await readFile(
  new URL("./tokens.css", import.meta.url),
  "utf8",
);
const baseCss = await readFile(new URL("./style.css", import.meta.url), "utf8");
const foundationCss = await readFile(
  new URL("./foundation.css", import.meta.url),
  "utf8",
);
const buttonCss = await readFile(
  new URL("./components/button.css", import.meta.url),
  "utf8",
);
const tailwindCss = await readFile(
  new URL("../tailwind.css", import.meta.url),
  "utf8",
);

describe("theme CSS coverage", () => {
  it("registers the packaged React components as a Tailwind source", () => {
    expect(tailwindCss).toContain('@source "./**/*.tsx"');
    expect(tailwindCss).toContain('@source "./**/*.mjs"');
  });

  it("defines explicit and system color schemes", () => {
    expect(tokensCss).toContain(':root:not([data-theme="light"])');
    expect(tokensCss).toContain("(prefers-color-scheme: dark)");
    expect(tokensCss).toContain('[data-theme="dark"]');
    expect(baseCss).toContain("color-scheme: light dark");
    expect(baseCss).toContain("color-scheme: light");
    expect(baseCss).toContain("color-scheme: dark");
  });

  it("defines accessibility theme overrides", () => {
    expect(tokensCss).toContain('[data-high-contrast="true"]');
    expect(tokensCss).toContain("(prefers-reduced-motion: reduce)");
    expect(tokensCss).toContain('[data-reduced-motion="true"]');
  });

  it("defines porcelain surface, typography, elevation, and motion tokens", () => {
    expect(tokensCss).toContain("--color-canvas: #fff");
    expect(tokensCss).toContain("--color-surface: #fff");
    expect(tokensCss).toContain("--color-surface-mist: #f4f4f5");
    expect(tokensCss).toContain("--color-primary: #ad7c4f");
    expect(tokensCss).toContain("--color-primary-strong: #96683f");
    expect(tokensCss).toContain("--font-size-display: 34px");
    expect(tokensCss).toContain("--line-height-body: 1.75");
    expect(tokensCss).toContain("--control-hit-target: 44px");
    expect(tokensCss).toContain("--shadow-level-3:");
    expect(tokensCss).toContain("--duration-fast: 200ms");
    expect(tokensCss).toContain("--duration-glaze: 500ms");
    expect(tokensCss).not.toContain("--shadow-glow:");
    expect(tokensCss).not.toContain("--easing-bounce:");
  });

  it("styles both document and nested theme roots", () => {
    expect(baseCss).toContain(":where([data-theme])");
    expect(baseCss).toContain(".gs-theme-root");
    expect(baseCss).toContain('data-theme="light"');
    expect(baseCss).toContain('data-theme="dark"');
  });

  it("inherits unchanged component tokens instead of repeating them per mode", () => {
    expect(tokensCss.match(/--table-cell-padding-y:/g)).toHaveLength(1);
    expect(tokensCss.match(/--button-bg-primary:/g)).toHaveLength(4);
  });

  it("separates shared and component-specific theme tokens", () => {
    expect(foundationCss).toContain("--color-primary:");
    expect(foundationCss).not.toContain("--button-bg-primary:");
    expect(buttonCss).toContain("--button-bg-primary:");
    expect(buttonCss).not.toContain("--input-bg:");
  });

  it("keeps namespaced color aliases for component internals", () => {
    expect(tailwindCss).toContain("--color-gs-surface: var(--color-surface);");
    expect(tailwindCss).toContain(
      "--color-gs-border-default: var(--color-border-default);",
    );
    expect(tailwindCss).toContain(
      "--color-gs-text-accent: var(--color-text-accent);",
    );
  });

  it("exposes concise semantic color utilities to applications", () => {
    expect(tailwindCss).toContain("@utility text-gs-default");
    expect(tailwindCss).toContain("@utility text-gs-accent");
    expect(tailwindCss).toContain("@utility border-gs-default");
    expect(tailwindCss).toContain("@utility outline-gs-focus");
  });

  it("exposes concise foundation token utilities", () => {
    expect(tailwindCss).toContain("--radius-gs-xs: var(--radius-xs);");
    expect(tailwindCss).toContain("--spacing-gs-sm: var(--spacing-sm);");
    expect(tailwindCss).toContain("--shadow-gs-1: var(--shadow-level-1);");
    expect(tailwindCss).toContain(
      "--transition-duration-gs-fast: var(--duration-fast);",
    );
  });

  it("exposes reusable inheritance utilities", () => {
    expect(tailwindCss).toContain("@utility font-inherit");
    expect(tailwindCss).toContain("@utility text-size-inherit");
    expect(tailwindCss).toContain("@utility leading-inherit");
    expect(tailwindCss).toContain("@utility rounded-inherit");
  });

  it("preserves every foundation declaration across generated slices", async () => {
    const foundationDirectory = new URL("./foundations/", import.meta.url);
    const sliceFiles = (await readdir(foundationDirectory)).filter((name) =>
      name.endsWith(".css"),
    );
    const slices = await Promise.all(
      sliceFiles.map((name) =>
        readFile(new URL(name, foundationDirectory), "utf8"),
      ),
    );

    expect(sliceFiles.length).toBeGreaterThan(1);
    expect(slices.every((css) => extractDeclarations(css).length > 0)).toBe(
      true,
    );
    expect(slices.flatMap(extractDeclarations).sort()).toEqual(
      extractDeclarations(foundationCss).sort(),
    );
  });
});

function extractDeclarations(css: string): string[] {
  return Array.from(css.matchAll(/--[a-z0-9-]+\s*:[^;]+;/g), (match) =>
    match[0].replace(/\s+/g, " "),
  );
}
