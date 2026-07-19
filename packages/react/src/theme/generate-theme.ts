import {
  ensureContrast,
  formatOklch,
  generateColorScale,
  oklchToRgb,
  parseHex,
  parseOklch,
  pickScaleStop,
  targetContrast,
  type ColorScale,
  type ColorScaleStop,
  type Oklch,
} from "./color";

export type ThemeMood = "porcelain" | "futuristic" | "warm" | "mono";
export type ThemeContrastLevel = "AA" | "AAA";

export type GenerateThemeOptions = {
  /** Brand seed color as hex (`#00A3FF` or `00A3FF`). */
  brand: string;
  /** Palette personality. Default: `porcelain`. */
  mood?: ThemeMood;
  /** WCAG contrast target for text-on-surface pairs. Default: `AA`. */
  contrastRatio?: ThemeContrastLevel;
};

export type GeneratedThemeModeVars = Record<string, string>;

export type GeneratedTheme = {
  brand: string;
  mood: ThemeMood;
  contrastRatio: ThemeContrastLevel;
  /** 10-stop brand scale in OKLCH. */
  scale: ColorScale;
  /** CSS custom properties for light / dark / high-contrast semantic colors. */
  cssVars: {
    light: GeneratedThemeModeVars;
    dark: GeneratedThemeModeVars;
    highContrast: GeneratedThemeModeVars;
  };
  /**
   * Flat token map ready for injection:
   * brand scale (`--color-brand-400`) + light semantic defaults.
   */
  tokens: GeneratedThemeModeVars;
};

const MOOD_PRESETS: Record<
  ThemeMood,
  { chromaScale: number; hueShift: number }
> = {
  porcelain: { chromaScale: 0.88, hueShift: 0 },
  futuristic: { chromaScale: 1.05, hueShift: 0 },
  warm: { chromaScale: 0.95, hueShift: 18 },
  mono: { chromaScale: 0.18, hueShift: 0 },
};

const LIGHT_BG = parseHex("#f7f2e8");
const DARK_BG = parseHex("#1c1915");

function withPrefix(scale: ColorScale, prefix: string): GeneratedThemeModeVars {
  return Object.fromEntries(
    Object.entries(scale).map(([stop, value]) => [
      `--${prefix}-${stop}`,
      value,
    ]),
  );
}

function resolveStop(
  scale: ColorScale,
  stop: ColorScaleStop,
  against: ReturnType<typeof parseHex>,
  minRatio: number,
): string {
  const base = pickScaleStop(scale, stop);
  const fixed = ensureContrast(base, against, minRatio);
  return formatOklch(fixed);
}

function lightSemantics(
  scale: ColorScale,
  level: ThemeContrastLevel,
): GeneratedThemeModeVars {
  const textRatio = targetContrast(level, "text");

  const primary = resolveStop(scale, "400", LIGHT_BG, textRatio);
  const primaryHover = resolveStop(scale, "500", LIGHT_BG, textRatio);
  const primaryStrong = resolveStop(scale, "500", LIGHT_BG, textRatio);
  const primaryStrongHover = resolveStop(scale, "600", LIGHT_BG, textRatio);
  const primaryStrongActive = resolveStop(scale, "700", LIGHT_BG, textRatio);

  // Ensure primary text on primary fill (approx white on primary).
  const primaryRgb = oklchToRgb(
    parseOklch(primaryStrong) ?? { l: 0.56, c: 0.1, h: 80 },
  );
  const onPrimary = ensureContrast({ l: 1, c: 0, h: 0 }, primaryRgb, textRatio);

  return {
    "--color-primary": primary,
    "--color-primary-hover": primaryHover,
    "--color-primary-active": resolveStop(scale, "600", LIGHT_BG, textRatio),
    "--color-primary-strong": primaryStrong,
    "--color-primary-strong-hover": primaryStrongHover,
    "--color-primary-strong-active": primaryStrongActive,
    "--color-info": "var(--color-border-strong)",
    "--color-focus-ring": `color-mix(in oklab, ${primary} 45%, transparent)`,
    "--color-accent": primary,
    "--color-canvas": "#F7F2E8",
    "--color-surface": "#FDFBF6",
    "--color-surface-raised": "#FDFBF6",
    "--color-surface-mist": "#EEE6D6",
    "--color-text-primary": "#3A342B",
    "--color-text-secondary": "#6E6556",
    "--color-text-disabled": "#8C8272",
    "--color-text-accent": primaryStrongHover,
    "--color-border-default": "#EEE6D6",
    "--color-border-strong": "#8C8272",
    "--color-border-focus": primary,
    "--surface-highlight":
      "linear-gradient(180deg, rgb(255 255 255 / 40%), rgb(255 255 255 / 0%))",
    "--surface-sheen": "inset 0 1px 0 rgb(255 255 255 / 70%)",
    "--color-bg": "var(--color-canvas)",
    "--color-bg-subtle": "var(--color-surface-mist)",
    "--color-border": "var(--color-border-default)",
    "--color-text": "var(--color-text-primary)",
    "--color-text-muted": "var(--color-text-secondary)",
    "--button-color-on-primary": formatOklch(onPrimary),
  };
}

function darkSemantics(
  scale: ColorScale,
  level: ThemeContrastLevel,
): GeneratedThemeModeVars {
  const textRatio = targetContrast(level, "text");

  const primary = resolveStop(scale, "300", DARK_BG, textRatio);
  const primaryHover = resolveStop(scale, "200", DARK_BG, textRatio);
  const primaryActive = resolveStop(scale, "400", DARK_BG, textRatio);

  const primaryRgb = oklchToRgb(
    parseOklch(primary) ?? { l: 0.76, c: 0.1, h: 80 },
  );
  const onPrimary = ensureContrast(
    { l: 0.09, c: 0.008, h: 80 },
    primaryRgb,
    textRatio,
  );

  return {
    "--color-primary": primary,
    "--color-primary-hover": primaryHover,
    "--color-primary-active": primaryActive,
    "--color-primary-strong": primary,
    "--color-primary-strong-hover": primaryHover,
    "--color-primary-strong-active": primaryActive,
    "--color-info": "var(--color-border-strong)",
    "--color-focus-ring": `color-mix(in oklab, ${primary} 45%, transparent)`,
    "--color-accent": primary,
    "--color-canvas": "#1C1915",
    "--color-surface": "#242019",
    "--color-surface-raised": "#2B261E",
    "--color-surface-mist": "#352F25",
    "--color-text-primary": "#EFE9DC",
    "--color-text-secondary": "#AFA491",
    "--color-text-disabled": "#7C7260",
    "--color-text-accent": primary,
    "--color-border-default": "#3E382C",
    "--color-border-strong": "#8C8272",
    "--color-border-focus": primary,
    "--surface-highlight":
      "linear-gradient(180deg, rgb(255 255 255 / 5%), rgb(255 255 255 / 0%))",
    "--surface-sheen": "inset 0 1px 0 rgb(255 255 255 / 8%)",
    "--color-bg": "var(--color-canvas)",
    "--color-bg-subtle": "var(--color-surface-mist)",
    "--color-border": "var(--color-border-default)",
    "--color-text": "var(--color-text-primary)",
    "--color-text-muted": "var(--color-text-secondary)",
    "--button-color-on-primary": formatOklch(onPrimary),
  };
}

function highContrastSemantics(
  scale: ColorScale,
  level: ThemeContrastLevel,
): GeneratedThemeModeVars {
  const textRatio = targetContrast(level, "text");
  const primary = resolveStop(scale, "800", LIGHT_BG, textRatio);
  const primaryHover = resolveStop(scale, "900", LIGHT_BG, textRatio);
  const focus = resolveStop(scale, "700", LIGHT_BG, textRatio);

  return {
    "--color-primary": primary,
    "--color-primary-hover": primaryHover,
    "--color-primary-active": primaryHover,
    "--color-primary-strong": primary,
    "--color-primary-strong-hover": primaryHover,
    "--color-primary-strong-active": primaryHover,
    "--color-info": "oklch(31% 0.012 79.65deg)",
    "--color-focus-ring": focus,
    "--color-accent": primary,
    "--color-canvas": "#FFFFFF",
    "--color-surface": "#FFFFFF",
    "--color-surface-raised": "#FFFFFF",
    "--color-surface-mist": "oklch(93% 0.012 79.65deg)",
    "--color-text-primary": "oklch(9% 0.008 79.65deg)",
    "--color-text-secondary": "oklch(31% 0.012 79.65deg)",
    "--color-text-disabled": "oklch(40% 0.012 79.65deg)",
    "--color-text-accent": primary,
    "--color-border-default": "oklch(9% 0.008 79.65deg)",
    "--color-border-strong": "oklch(9% 0.008 79.65deg)",
    "--color-border-focus": focus,
    "--surface-highlight": "none",
    "--surface-sheen": "0 0 0 transparent",
    "--color-bg": "var(--color-canvas)",
    "--color-bg-subtle": "var(--color-surface-mist)",
    "--color-border": "var(--color-border-default)",
    "--color-text": "var(--color-text-primary)",
    "--color-text-muted": "var(--color-text-secondary)",
    "--button-color-on-primary": "oklch(100% 0 0deg)",
  };
}

/**
 * Derive a full brand-driven theme from a seed color.
 * Output is pure data (CSS variable maps) — no DOM writes.
 */
export function generateTheme(options: GenerateThemeOptions): GeneratedTheme {
  const mood = options.mood ?? "porcelain";
  const contrastRatio = options.contrastRatio ?? "AA";
  const preset = MOOD_PRESETS[mood];
  const brand = options.brand.startsWith("#")
    ? options.brand
    : `#${options.brand}`;

  // Validate seed early.
  parseHex(brand);

  const scale = generateColorScale(brand, {
    chromaScale: preset.chromaScale,
    hueShift: preset.hueShift,
  });

  const light = lightSemantics(scale, contrastRatio);
  const dark = darkSemantics(scale, contrastRatio);
  const highContrast = highContrastSemantics(scale, contrastRatio);
  const brandVars = withPrefix(scale, "color-brand");

  return {
    brand,
    mood,
    contrastRatio,
    scale,
    cssVars: {
      light,
      dark,
      highContrast,
    },
    tokens: {
      ...brandVars,
      ...light,
    },
  };
}

/** Serialize a token map to a CSS declaration block body. */
export function themeVarsToCss(vars: GeneratedThemeModeVars): string {
  return Object.entries(vars)
    .map(([key, value]) => `  ${key}: ${value};`)
    .join("\n");
}

/**
 * Build a full CSS string for SSR / style tags.
 * Includes brand scale + light defaults, plus dark / high-contrast selectors.
 */
export function getThemeCss(
  theme: GeneratedTheme,
  options?: {
    rootSelector?: string;
    darkSelector?: string;
    highContrastSelector?: string;
  },
): string {
  const root = options?.rootSelector ?? ":root, .gs-theme-root";
  const dark =
    options?.darkSelector ??
    '[data-theme="dark"], .gs-theme-root[data-theme="dark"]';
  const hc =
    options?.highContrastSelector ??
    '[data-high-contrast="true"], .gs-theme-root[data-high-contrast="true"]';

  const brandVars = withPrefix(theme.scale, "color-brand");

  return [
    `${root} {\n${themeVarsToCss({ ...brandVars, ...theme.cssVars.light })}\n}`,
    `${dark} {\n${themeVarsToCss(theme.cssVars.dark)}\n}`,
    `${hc} {\n${themeVarsToCss(theme.cssVars.highContrast)}\n}`,
  ].join("\n\n");
}

/** Apply theme CSS variables to a DOM element (defaults to documentElement). */
export function applyTheme(
  theme: GeneratedTheme,
  target?: HTMLElement | null,
  mode: "light" | "dark" | "highContrast" = "light",
): void {
  if (typeof document === "undefined") {
    return;
  }
  const el = target ?? document.documentElement;
  const brandVars = withPrefix(theme.scale, "color-brand");
  const modeVars =
    mode === "dark"
      ? theme.cssVars.dark
      : mode === "highContrast"
        ? theme.cssVars.highContrast
        : theme.cssVars.light;

  for (const [key, value] of Object.entries({ ...brandVars, ...modeVars })) {
    el.style.setProperty(key, value);
  }
}

/** Remove previously applied generated theme vars from an element. */
export function clearTheme(
  theme: GeneratedTheme,
  target?: HTMLElement | null,
): void {
  if (typeof document === "undefined") {
    return;
  }
  const el = target ?? document.documentElement;
  const keys = new Set([
    ...Object.keys(withPrefix(theme.scale, "color-brand")),
    ...Object.keys(theme.cssVars.light),
    ...Object.keys(theme.cssVars.dark),
    ...Object.keys(theme.cssVars.highContrast),
  ]);
  for (const key of keys) {
    el.style.removeProperty(key);
  }
}

// Re-export ensureContrast helpers for advanced consumers.
export type { ColorScale, Oklch };
