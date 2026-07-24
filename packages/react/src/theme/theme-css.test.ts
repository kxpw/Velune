import { readFile, readdir } from "node:fs/promises";
import { describe, expect, it } from "vitest";
import { tokens } from "./tokens";

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
const controlCss = await readFile(
  new URL("./components/control.css", import.meta.url),
  "utf8",
);
const focusCss = await readFile(
  new URL("./components/focus.css", import.meta.url),
  "utf8",
);
const spinnerCss = await readFile(
  new URL("./components/spinner.css", import.meta.url),
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

  it("aggregates foundation and component sheets without inlining values", () => {
    expect(tokensCss).toContain('@import "./foundation.css";');
    expect(tokensCss).toContain('@import "./components/alert.css";');
    expect(tokensCss).toContain('@import "./components/button.css";');
    expect(tokensCss).toContain('@import "./components/toast.css";');
    expect(tokensCss).not.toContain("--color-canvas:");
    expect(tokensCss).not.toContain("--button-bg-danger-active:");
    expect(tokensCss).not.toContain("--spinner-duration:");
  });

  it("defines explicit and system color schemes", () => {
    expect(foundationCss).toContain(':root:not([data-theme="light"])');
    expect(foundationCss).toContain("(prefers-color-scheme: dark)");
    expect(foundationCss).toContain('[data-theme="dark"]');
    expect(baseCss).toContain("color-scheme: light dark");
    expect(baseCss).toContain("color-scheme: light");
    expect(baseCss).toContain("color-scheme: dark");
    expect(baseCss).toContain(':root[data-high-contrast="true"]');
    expect(baseCss).toContain('.gs-theme-root[data-high-contrast="true"]');
    expect(baseCss).toContain('.gs-theme-root[data-theme="system"]');
  });

  it("defines accessibility theme overrides", () => {
    expect(foundationCss).toContain('[data-high-contrast="true"]');
    expect(foundationCss).toContain("(prefers-reduced-motion: reduce)");
    expect(foundationCss).toContain('[data-reduced-motion="true"]');
  });

  it("defines porcelain surface, typography, elevation, and motion tokens", () => {
    expect(foundationCss).toContain("--color-canvas: #fff");
    expect(foundationCss).toContain("--color-surface: #fff");
    expect(foundationCss).toContain("--color-surface-mist: #f4f4f5");
    expect(foundationCss).toContain("--color-primary: #ad7c4f");
    expect(foundationCss).toContain("--color-primary-strong: #96683f");
    expect(foundationCss).toContain("--font-size-4xl:");
    expect(foundationCss).not.toContain("--font-size-display:");
    expect(foundationCss).not.toContain("--radius-md:");
    expect(foundationCss).not.toContain("--radius-xl:");
    expect(foundationCss).not.toContain("--easing-decelerate:");
    expect(foundationCss).not.toContain("--spacing-sm:");
    expect(foundationCss).toContain("--line-height-body: 1.75");
    expect(foundationCss).toContain("--space-11: 44px");
    expect(foundationCss).not.toContain("--control-hit-target:");
    expect(foundationCss).toContain("--shadow-level-3:");
    expect(foundationCss).toContain("--duration-fast: 200ms");
    expect(foundationCss).toContain("--duration-glaze: 500ms");
    expect(foundationCss).not.toContain("--shadow-glow:");
    expect(foundationCss).not.toContain("--easing-bounce:");
  });

  it("styles both document and nested theme roots", () => {
    expect(baseCss).toContain(":where([data-theme])");
    expect(baseCss).toContain(".gs-theme-root");
    expect(baseCss).toContain('data-theme="light"');
    expect(baseCss).toContain('data-theme="dark"');
    expect(foundationCss).toContain('.gs-theme-root[data-theme="light"]');
    expect(foundationCss).toContain('.gs-theme-root[data-theme="system"]');
  });

  it("keeps shared colors out of component token scopes", () => {
    expect(spinnerCss.match(/--spinner-duration:/g)).toHaveLength(1);
    expect(foundationCss).not.toContain("--button-spinner-duration:");
    expect(foundationCss).not.toContain("--button-padding-x:");
    expect(foundationCss).not.toContain("--button-bg-primary:");
    expect(foundationCss).not.toContain("--button-border-width:");
    expect(controlCss).toContain("--control-border-width:");
    expect(focusCss).toContain("--focus-ring-invalid:");
    expect(foundationCss).toContain("--color-on-primary:");
    expect(foundationCss).toContain("--space-0\\.5:");
    expect(foundationCss).toContain("--space-1\\.5:");
    expect(foundationCss).toContain("--space-2\\.5:");
    expect(
      Object.values(tokens.component).filter((value) =>
        value.startsWith("var(--color-"),
      ),
    ).toEqual([]);
  });

  it("separates shared and component-specific theme tokens", () => {
    expect(foundationCss).toContain("--color-primary:");
    expect(foundationCss).not.toContain("--button-bg-primary:");
    expect(buttonCss).toContain("--button-bg-danger-active:");
    expect(buttonCss).not.toContain("--button-bg-primary:");
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
    expect(tailwindCss).toContain(
      "--color-gs-action-hover: var(--color-action-hover);",
    );
  });

  it("does not point Tailwind aliases at deleted theme tokens", () => {
    const defined = new Set<string>();
    const collectNames = (value: unknown) => {
      if (!value || typeof value !== "object") return;
      for (const [name, child] of Object.entries(value)) {
        if (typeof child === "string") defined.add(`--${name}`);
        else collectNames(child);
      }
    };
    collectNames(tokens);

    const dangling = Array.from(
      tailwindCss.matchAll(
        /--(?:color|spacing|text|border-width)-gs-[^:]+:\s*var\((--[^,)]+)\);/g,
      ),
      // CSS may escape `.` in custom properties (`--space-1\.5`); token
      // maps keep the unescaped key (`space-1.5`).
      (match) => match[1]!.replace(/\\(.)/g, "$1"),
    ).filter((name) => !name.startsWith("--gs-") && !defined.has(name));

    expect(dangling).toEqual([]);
  });

  it("exposes concise semantic color utilities to applications", () => {
    expect(tailwindCss).toContain(
      "--color-gs-text: var(--color-text-primary);",
    );
    expect(tailwindCss).toContain(
      "--color-gs-text-secondary: var(--color-text-secondary);",
    );
    expect(tailwindCss).toContain(
      "--color-gs-text-accent: var(--color-text-accent);",
    );
    expect(tailwindCss).toContain(
      "--color-gs-border-default: var(--color-border-default);",
    );
    expect(tailwindCss).toContain("--color-gs-canvas: var(--color-canvas);");
    expect(tailwindCss).not.toContain("--color-gs-bg:");
    expect(tailwindCss).not.toContain("--color-gs-text-muted:");
    expect(tailwindCss).not.toContain("--color-gs-surface-mist-hover:");
    expect(tailwindCss).not.toContain("--color-gs-error-tint:");
    expect(tailwindCss).not.toContain("--color-gs-error-muted:");
    expect(tailwindCss).not.toContain("--color-gs-surface-muted:");
    expect(tailwindCss).not.toContain("@utility outline-gs-focus");
    expect(tailwindCss).not.toContain("@utility bg-gs-text-secondary");
    expect(tailwindCss).toContain("@utility border-gs-focus");
  });

  it("exposes concise foundation token utilities", () => {
    expect(tailwindCss).toContain("--radius-gs-none: var(--radius-none);");
    expect(tailwindCss).toContain("--radius-gs-xs: var(--radius-xs);");
    expect(tailwindCss).toContain("--radius-gs-sm: var(--radius-sm);");
    expect(tailwindCss).toContain("--radius-gs-lg: var(--radius-lg);");
    expect(tailwindCss).toContain("--radius-gs-full: var(--radius-full);");
    expect(tailwindCss).not.toContain("--radius-gs-md:");
    expect(tailwindCss).not.toContain("--radius-gs-xl:");
    expect(tailwindCss).toContain("--shadow-gs-1: var(--shadow-level-1);");
    expect(tailwindCss).toContain("--shadow-gs-2: var(--shadow-level-2);");
    expect(tailwindCss).toContain("--shadow-gs-3: var(--shadow-level-3);");
    expect(tailwindCss).toContain("--shadow-gs-0: var(--shadow-level-0);");
    expect(tailwindCss).toContain("--leading-gs-none: 1;");
    expect(tailwindCss).toContain("--tracking-gs-normal: 0;");
    expect(tailwindCss).toContain("--z-index-gs-modal: var(--z-modal);");
    expect(tailwindCss).toContain("--z-index-gs-popover: var(--z-popover);");
    expect(tailwindCss).toContain("--z-index-gs-toast: var(--z-toast);");
    expect(tailwindCss).toContain("--spacing-gs-4: var(--space-4);");
    expect(tailwindCss).not.toContain("--spacing-gs-sm:");
    expect(tailwindCss).toContain(
      "--transition-duration-gs-fast: var(--duration-fast);",
    );
  });

  it("does not expose per-component radius aliases", () => {
    expect(tailwindCss).not.toMatch(/--radius-gs-\w+-radius:/);
  });

  it("does not expose per-component shadow or z-index aliases", () => {
    expect(tailwindCss).not.toMatch(/--shadow-gs-\w+-shadow:/);
    expect(tailwindCss).not.toContain("--z-index-gs-datepicker:");
    expect(tailwindCss).not.toContain("--z-index-gs-select:");
    expect(tailwindCss).not.toContain("--z-index-gs-tooltip:");
  });

  it("does not expose pure component font/space passthrough aliases", () => {
    expect(tailwindCss).not.toContain("--text-gs-button-font-size:");
    expect(tailwindCss).not.toContain("--spacing-gs-button-height-md:");
    expect(tailwindCss).not.toContain("--font-weight-gs-button-font-weight:");
    expect(tailwindCss).not.toContain("--spacing-gs-avatar-size-md:");
    expect(tailwindCss).not.toMatch(/--spacing-gs-space-\d+:/);
    expect(tailwindCss).not.toMatch(/--spacing-gs-font-size-/);
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
