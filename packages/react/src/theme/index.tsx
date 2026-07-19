import React, {
  createContext,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
} from "react";
// Import tokens as a module side-effect. Do not @import them from CSS —
// Vite/PostCSS can drop `@import url("./tokens.css")` and leave vars empty.
import "./tokens.css";
import "./style.css";
import { tokens } from "./tokens";
import {
  applyTheme,
  clearTheme,
  generateTheme,
  type GeneratedTheme,
  type ThemeContrastLevel,
  type ThemeMood,
} from "./generate-theme";

export { useThemeToggle } from "@velune/hooks";
export type {
  ResolvedTheme,
  ThemeTogglePreference,
  ThemeToggleTheme,
  UseThemeToggleOptions,
  UseThemeToggleReturn,
} from "@velune/hooks";

export type ThemeMode = "light" | "dark" | "system";

export type ThemeConfig = {
  theme?: ThemeMode | undefined;
  highContrast?: boolean | undefined;
  reducedMotion?: boolean | undefined;
  /**
   * Brand seed hex. When set, `generateTheme()` runs and injects CSS variables
   * onto the theme root (and optionally updates on mode change).
   */
  brandColor?: string | undefined;
  mood?: ThemeMood | undefined;
  contrastRatio?: ThemeContrastLevel | undefined;
  /** Extra CSS variables merged on top of generated / default tokens. */
  customTokens?: Record<string, string> | undefined;
};

export type ThemeContextValue = ThemeConfig & {
  generatedTheme: GeneratedTheme | null;
};

export { generateColorScale } from "./color";
export {
  applyTheme,
  clearTheme,
  generateTheme,
  getThemeCss,
  themeVarsToCss,
} from "./generate-theme";
export type {
  GenerateThemeOptions,
  GeneratedTheme,
  ThemeContrastLevel,
  ThemeMood,
} from "./generate-theme";
export { tokens as themeTokens };
export type { ThemeSemanticMode, TokenCategory, TokenName } from "./tokens";

const ThemeContext = createContext<ThemeContextValue>({
  theme: "system",
  generatedTheme: null,
});

const useIsomorphicLayoutEffect =
  typeof window === "undefined" ? useEffect : useLayoutEffect;

const THEME_ATTRIBUTES = [
  "data-theme",
  "data-high-contrast",
  "data-reduced-motion",
] as const;

function generatedTokenNames(theme: GeneratedTheme | null): string[] {
  if (!theme) {
    return [];
  }
  return Array.from(
    new Set([
      ...Object.keys(theme.tokens),
      ...Object.keys(theme.cssVars.light),
      ...Object.keys(theme.cssVars.dark),
      ...Object.keys(theme.cssVars.highContrast),
    ]),
  );
}

function applyCustomTokens(
  target: HTMLElement,
  customTokens: Record<string, string> | undefined,
): void {
  for (const [name, value] of Object.entries(customTokens ?? {})) {
    if (name.startsWith("--")) {
      target.style.setProperty(name, value);
    }
  }
}

export function useTheme(): ThemeContextValue {
  return useContext(ThemeContext);
}

function resolveApplyMode(
  theme: ThemeMode,
  highContrast: boolean,
): "light" | "dark" | "highContrast" {
  if (highContrast) {
    return "highContrast";
  }
  if (theme === "dark") {
    return "dark";
  }
  if (theme === "light") {
    return "light";
  }
  if (typeof window !== "undefined") {
    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  }
  return "light";
}

export function ThemeProvider({
  theme = "system",
  highContrast = false,
  reducedMotion = false,
  brandColor,
  mood = "porcelain",
  contrastRatio = "AA",
  customTokens,
  children,
}: React.PropsWithChildren<ThemeConfig>) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const previousThemeRef = useRef<GeneratedTheme | null>(null);

  const generatedTheme = useMemo(() => {
    if (!brandColor) {
      return null;
    }
    try {
      return generateTheme({
        brand: brandColor,
        mood,
        contrastRatio,
      });
    } catch {
      return null;
    }
  }, [brandColor, contrastRatio, mood]);

  const value = useMemo<ThemeContextValue>(
    () => ({
      theme,
      highContrast,
      reducedMotion,
      brandColor,
      mood,
      contrastRatio,
      customTokens,
      generatedTheme,
    }),
    [
      brandColor,
      contrastRatio,
      customTokens,
      generatedTheme,
      highContrast,
      mood,
      reducedMotion,
      theme,
    ],
  );

  const customStyle = useMemo(() => {
    if (!customTokens) {
      return undefined;
    }
    return customTokens as React.CSSProperties;
  }, [customTokens]);

  // Portals render under document.body, outside the provider wrapper. Mirror the
  // active theme contract to the document root so every overlay inherits the
  // same semantic tokens, then restore the host page exactly on cleanup.
  useIsomorphicLayoutEffect(() => {
    const root = document.documentElement;
    const previousAttributes = new Map(
      THEME_ATTRIBUTES.map((name) => [name, root.getAttribute(name)]),
    );
    const customTokenNames = Object.keys(customTokens ?? {}).filter((name) =>
      name.startsWith("--"),
    );
    const tokenNames = Array.from(
      new Set([...generatedTokenNames(generatedTheme), ...customTokenNames]),
    );
    const previousTokens = new Map(
      tokenNames.map((name) => [
        name,
        {
          value: root.style.getPropertyValue(name),
          priority: root.style.getPropertyPriority(name),
        },
      ]),
    );

    root.setAttribute("data-theme", theme);
    if (highContrast) {
      root.setAttribute("data-high-contrast", "true");
    } else {
      root.removeAttribute("data-high-contrast");
    }
    if (reducedMotion) {
      root.setAttribute("data-reduced-motion", "true");
    } else {
      root.removeAttribute("data-reduced-motion");
    }

    if (generatedTheme) {
      applyTheme(generatedTheme, root, resolveApplyMode(theme, highContrast));
    }
    applyCustomTokens(root, customTokens);

    return () => {
      for (const [name, value] of previousAttributes) {
        if (value == null) {
          root.removeAttribute(name);
        } else {
          root.setAttribute(name, value);
        }
      }
      for (const [name, previous] of previousTokens) {
        if (previous.value) {
          root.style.setProperty(name, previous.value, previous.priority);
        } else {
          root.style.removeProperty(name);
        }
      }
    };
  }, [customTokens, generatedTheme, highContrast, reducedMotion, theme]);

  useEffect(() => {
    const el = rootRef.current;
    if (!el) {
      return;
    }

    if (
      previousThemeRef.current &&
      previousThemeRef.current !== generatedTheme
    ) {
      clearTheme(previousThemeRef.current, el);
    }

    if (generatedTheme) {
      const mode = resolveApplyMode(theme, highContrast);
      applyTheme(generatedTheme, el, mode);
      applyCustomTokens(el, customTokens);
      previousThemeRef.current = generatedTheme;
    } else {
      previousThemeRef.current = null;
    }

    return () => {
      if (generatedTheme) {
        clearTheme(generatedTheme, el);
      }
    };
  }, [customTokens, generatedTheme, highContrast, theme]);

  // Follow system scheme when theme=system and brand theme is active.
  useEffect(() => {
    if (theme !== "system" || !generatedTheme || !rootRef.current) {
      return;
    }
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => {
      if (!rootRef.current || !generatedTheme) {
        return;
      }
      applyTheme(
        generatedTheme,
        rootRef.current,
        resolveApplyMode("system", highContrast),
      );
      applyTheme(
        generatedTheme,
        document.documentElement,
        resolveApplyMode("system", highContrast),
      );
      applyCustomTokens(rootRef.current, customTokens);
      applyCustomTokens(document.documentElement, customTokens);
    };
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, [customTokens, generatedTheme, highContrast, theme]);

  return (
    <ThemeContext.Provider value={value}>
      <div
        ref={rootRef}
        className="gs-theme-root"
        data-theme={theme}
        data-high-contrast={highContrast ? "true" : undefined}
        data-reduced-motion={reducedMotion ? "true" : undefined}
        data-brand={brandColor ? "true" : undefined}
        style={customStyle}
      >
        {children}
      </div>
    </ThemeContext.Provider>
  );
}
