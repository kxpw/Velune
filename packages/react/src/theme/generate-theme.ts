import {
  ensureContrast,
  formatOklch,
  generateColorScale,
  hexToOklch,
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
export type ThemeBase = "porcelain" | "neutral" | "stone" | "zinc" | "slate";

export type GenerateThemeOptions = {
  /** Brand seed color as hex (`#00A3FF` or `00A3FF`). */
  brand: string;
  /** Palette personality. Default: `porcelain`. */
  mood?: ThemeMood;
  /** Surface palette for canvas, cards, and neutral UI states. Default: `porcelain`. */
  base?: ThemeBase;
  /** WCAG contrast target for text-on-surface pairs. Default: `AA`. */
  contrastRatio?: ThemeContrastLevel;
};

export type GeneratedThemeModeVars = Record<string, string>;

export type GeneratedTheme = {
  brand: string;
  mood: ThemeMood;
  base: ThemeBase;
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

type SurfacePalette = {
  canvas: string;
  surface: string;
  surfaceRaised: string;
  surfaceMist: string;
  textPrimary: string;
  textSecondary: string;
  textDisabled: string;
  borderDefault: string;
  borderStrong: string;
};

type ThemeBasePalette = {
  light: SurfacePalette;
  dark: SurfacePalette;
};

const BASE_PALETTES: Record<ThemeBase, ThemeBasePalette> = {
  porcelain: {
    light: {
      canvas: "#F7F2E8",
      surface: "#FDFBF6",
      surfaceRaised: "#FDFBF6",
      surfaceMist: "#EEE6D6",
      textPrimary: "#3A342B",
      textSecondary: "#6E6556",
      textDisabled: "#8C8272",
      borderDefault: "#EEE6D6",
      borderStrong: "#8C8272",
    },
    dark: {
      canvas: "#1C1915",
      surface: "#242019",
      surfaceRaised: "#2B261E",
      surfaceMist: "#352F25",
      textPrimary: "#EFE9DC",
      textSecondary: "#AFA491",
      textDisabled: "#7C7260",
      borderDefault: "#3E382C",
      borderStrong: "#8C8272",
    },
  },
  neutral: {
    light: {
      canvas: "#FAFAFA",
      surface: "#FFFFFF",
      surfaceRaised: "#FFFFFF",
      surfaceMist: "#F5F5F5",
      textPrimary: "#171717",
      textSecondary: "#525252",
      textDisabled: "#A3A3A3",
      borderDefault: "#E5E5E5",
      borderStrong: "#737373",
    },
    dark: {
      canvas: "#171717",
      surface: "#212121",
      surfaceRaised: "#262626",
      surfaceMist: "#404040",
      textPrimary: "#FAFAFA",
      textSecondary: "#D4D4D4",
      textDisabled: "#737373",
      borderDefault: "#404040",
      borderStrong: "#A3A3A3",
    },
  },
  stone: {
    light: {
      canvas: "#FAFAF9",
      surface: "#FFFFFF",
      surfaceRaised: "#FFFFFF",
      surfaceMist: "#F5F5F4",
      textPrimary: "#292524",
      textSecondary: "#57534E",
      textDisabled: "#A8A29E",
      borderDefault: "#E7E5E4",
      borderStrong: "#78716C",
    },
    dark: {
      canvas: "#1C1917",
      surface: "#25211F",
      surfaceRaised: "#302B28",
      surfaceMist: "#3A342F",
      textPrimary: "#F5F5F4",
      textSecondary: "#D6D3D1",
      textDisabled: "#78716C",
      borderDefault: "#44403C",
      borderStrong: "#A8A29E",
    },
  },
  zinc: {
    light: {
      canvas: "#FAFAFA",
      surface: "#FFFFFF",
      surfaceRaised: "#FFFFFF",
      surfaceMist: "#F4F4F5",
      textPrimary: "#18181B",
      textSecondary: "#52525B",
      textDisabled: "#A1A1AA",
      borderDefault: "#E4E4E7",
      borderStrong: "#71717A",
    },
    dark: {
      canvas: "#18181B",
      surface: "#202024",
      surfaceRaised: "#27272A",
      surfaceMist: "#3F3F46",
      textPrimary: "#FAFAFA",
      textSecondary: "#D4D4D8",
      textDisabled: "#71717A",
      borderDefault: "#3F3F46",
      borderStrong: "#A1A1AA",
    },
  },
  slate: {
    light: {
      canvas: "#F8FAFC",
      surface: "#FFFFFF",
      surfaceRaised: "#FFFFFF",
      surfaceMist: "#E2E8F0",
      textPrimary: "#0F172A",
      textSecondary: "#475569",
      textDisabled: "#94A3B8",
      borderDefault: "#E2E8F0",
      borderStrong: "#64748B",
    },
    dark: {
      canvas: "#0F172A",
      surface: "#162033",
      surfaceRaised: "#1E293B",
      surfaceMist: "#334155",
      textPrimary: "#F8FAFC",
      textSecondary: "#CBD5E1",
      textDisabled: "#64748B",
      borderDefault: "#334155",
      borderStrong: "#94A3B8",
    },
  },
};

const HIGH_CONTRAST_BG = parseHex("#FFFFFF");

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
  palette: SurfacePalette,
): GeneratedThemeModeVars {
  const textRatio = targetContrast(level, "text");
  const textSecondary = formatOklch(
    ensureContrast(
      hexToOklch(palette.textSecondary),
      parseHex(palette.surfaceMist),
      textRatio,
    ),
  );
  const canvas = parseHex(palette.canvas);

  const primary = resolveStop(scale, "400", canvas, textRatio);
  const primaryHover = resolveStop(scale, "500", canvas, textRatio);
  const primaryStrong = resolveStop(scale, "500", canvas, textRatio);
  const primaryStrongHover = resolveStop(scale, "600", canvas, textRatio);
  const primaryStrongActive = resolveStop(scale, "700", canvas, textRatio);

  // Ensure primary text on primary fill (approx white on primary).
  const primaryRgb = oklchToRgb(
    parseOklch(primaryStrong) ?? { l: 0.56, c: 0.1, h: 80 },
  );
  const onPrimary = ensureContrast({ l: 1, c: 0, h: 0 }, primaryRgb, textRatio);

  return {
    "--color-primary": primary,
    "--color-primary-hover": primaryHover,
    "--color-primary-active": resolveStop(scale, "600", canvas, textRatio),
    "--color-primary-strong": primaryStrong,
    "--color-primary-strong-hover": primaryStrongHover,
    "--color-primary-strong-active": primaryStrongActive,
    "--color-info": "var(--color-border-strong)",
    "--color-focus-ring": `color-mix(in oklab, ${primary} 45%, transparent)`,
    "--color-canvas": palette.canvas,
    "--color-surface": palette.surface,
    "--color-surface-raised": palette.surfaceRaised,
    "--color-surface-mist": palette.surfaceMist,
    "--color-text-primary": palette.textPrimary,
    "--color-text-secondary": textSecondary,
    "--color-text-disabled": palette.textDisabled,
    "--color-text-accent": primaryStrongHover,
    "--color-border-default": palette.borderDefault,
    "--color-border-strong": palette.borderStrong,
    "--color-border-focus": primary,
    "--color-action-hover":
      "color-mix(in oklab, var(--color-primary) 8%, var(--color-surface))",
    "--color-action-active":
      "color-mix(in oklab, var(--color-primary-strong) 14%, var(--color-surface))",
    "--surface-highlight":
      "linear-gradient(180deg, rgb(255 255 255 / 40%), rgb(255 255 255 / 0%))",
    "--surface-sheen": "inset 0 1px 0 rgb(255 255 255 / 70%)",
    "--color-on-primary": formatOklch(onPrimary),
  };
}

function darkSemantics(
  scale: ColorScale,
  level: ThemeContrastLevel,
  palette: SurfacePalette,
): GeneratedThemeModeVars {
  const textRatio = targetContrast(level, "text");
  const textSecondary = formatOklch(
    ensureContrast(
      hexToOklch(palette.textSecondary),
      parseHex(palette.surfaceMist),
      textRatio,
    ),
  );
  const canvas = parseHex(palette.canvas);

  const primary = resolveStop(scale, "300", canvas, textRatio);
  const primaryHover = resolveStop(scale, "200", canvas, textRatio);
  const primaryActive = resolveStop(scale, "400", canvas, textRatio);

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
    "--color-canvas": palette.canvas,
    "--color-surface": palette.surface,
    "--color-surface-raised": palette.surfaceRaised,
    "--color-surface-mist": palette.surfaceMist,
    "--color-text-primary": palette.textPrimary,
    "--color-text-secondary": textSecondary,
    "--color-text-disabled": palette.textDisabled,
    "--color-text-accent": primary,
    "--color-border-default": palette.borderDefault,
    "--color-border-strong": palette.borderStrong,
    "--color-border-focus": primary,
    "--color-action-hover":
      "color-mix(in oklab, var(--color-primary) 16%, var(--color-surface))",
    "--color-action-active":
      "color-mix(in oklab, var(--color-primary-strong) 24%, var(--color-surface))",
    "--surface-highlight":
      "linear-gradient(180deg, rgb(255 255 255 / 5%), rgb(255 255 255 / 0%))",
    "--surface-sheen": "inset 0 1px 0 rgb(255 255 255 / 8%)",
    "--color-on-primary": formatOklch(onPrimary),
  };
}

function highContrastSemantics(
  scale: ColorScale,
  level: ThemeContrastLevel,
): GeneratedThemeModeVars {
  const textRatio = targetContrast(level, "text");
  const primary = resolveStop(scale, "800", HIGH_CONTRAST_BG, textRatio);
  const primaryHover = resolveStop(scale, "900", HIGH_CONTRAST_BG, textRatio);
  const focus = resolveStop(scale, "700", HIGH_CONTRAST_BG, textRatio);

  return {
    "--color-primary": primary,
    "--color-primary-hover": primaryHover,
    "--color-primary-active": primaryHover,
    "--color-primary-strong": primary,
    "--color-primary-strong-hover": primaryHover,
    "--color-primary-strong-active": primaryHover,
    "--color-info": "oklch(31% 0.012 79.65deg)",
    "--color-focus-ring": focus,
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
    "--color-action-hover":
      "color-mix(in oklab, var(--color-primary) 10%, var(--color-surface))",
    "--color-action-active":
      "color-mix(in oklab, var(--color-primary-strong) 16%, var(--color-surface))",
    "--surface-highlight": "none",
    "--surface-sheen": "0 0 0 transparent",
    "--color-on-primary": "oklch(100% 0 0deg)",
  };
}

/**
 * Derive a full brand-driven theme from a seed color.
 * Output is pure data (CSS variable maps) — no DOM writes.
 */
export function generateTheme(options: GenerateThemeOptions): GeneratedTheme {
  const mood = options.mood ?? "porcelain";
  const base = options.base ?? "porcelain";
  const contrastRatio = options.contrastRatio ?? "AA";
  const preset = MOOD_PRESETS[mood];
  const palette = BASE_PALETTES[base];
  const brand = options.brand.startsWith("#")
    ? options.brand
    : `#${options.brand}`;

  // Validate seed early.
  parseHex(brand);

  const scale = generateColorScale(brand, {
    chromaScale: preset.chromaScale,
    hueShift: preset.hueShift,
  });

  const light = lightSemantics(scale, contrastRatio, palette.light);
  const dark = darkSemantics(scale, contrastRatio, palette.dark);
  const highContrast = highContrastSemantics(scale, contrastRatio);
  const brandVars = withPrefix(scale, "color-brand");

  return {
    brand,
    mood,
    base,
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
    systemSelector?: string;
    highContrastSelector?: string;
  },
): string {
  const root = options?.rootSelector ?? ":root";
  const dark =
    options?.darkSelector ??
    (options?.rootSelector
      ? `${root}[data-theme="dark"]`
      : '[data-theme="dark"]');
  const system =
    options?.systemSelector ??
    (options?.rootSelector
      ? `${root}[data-theme="system"]`
      : ':root:not([data-theme="light"]), .gs-theme-root[data-theme="system"]');
  const hc =
    options?.highContrastSelector ??
    (options?.rootSelector
      ? `${root}[data-high-contrast="true"]`
      : ':root[data-high-contrast="true"], .gs-theme-root[data-high-contrast="true"], [data-high-contrast="true"]');

  const brandVars = withPrefix(theme.scale, "color-brand");

  return [
    `${root} {\n${themeVarsToCss({ ...brandVars, ...theme.cssVars.light })}\n}`,
    `${dark} {\n${themeVarsToCss(theme.cssVars.dark)}\n}`,
    `@media (prefers-color-scheme: dark) {\n  ${system} {\n${themeVarsToCss(
      theme.cssVars.dark,
    )
      .split("\n")
      .map((line) => `  ${line}`)
      .join("\n")}\n  }\n}`,
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
