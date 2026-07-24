import React, {
  createContext,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
} from "react";
import { PortalThemeContext } from "../shared/portal-theme-context";
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
  type ThemeBase,
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
export { ThemeToggle } from "./ThemeToggle";
export type { ThemeToggleProps } from "./ThemeToggle";

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
  base?: ThemeBase | undefined;
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
  ThemeBase,
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

type DocumentThemeState = {
  order: number;
  theme: ThemeMode;
  highContrast: boolean;
  reducedMotion: boolean;
  generatedTheme: GeneratedTheme | null;
  customTokens: Record<string, string> | undefined;
};

type StyleValue = { value: string; priority: string };

const documentThemeStates = new Map<symbol, DocumentThemeState>();
const documentThemeAttributes = new Map<string, string | null>();
const documentThemeTokens = new Map<string, StyleValue>();
let themeProviderOrder = 0;

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

function restoreDocumentTokens(root: HTMLElement): void {
  for (const [name, previous] of documentThemeTokens) {
    if (previous.value) {
      root.style.setProperty(name, previous.value, previous.priority);
    } else {
      root.style.removeProperty(name);
    }
  }
}

function syncDocumentTheme(): void {
  const root = document.documentElement;
  const active = Array.from(documentThemeStates.values()).reduce<
    DocumentThemeState | undefined
  >(
    (latest, state) => (!latest || state.order > latest.order ? state : latest),
    undefined,
  );

  restoreDocumentTokens(root);

  if (!active) {
    for (const [name, value] of documentThemeAttributes) {
      if (value == null) root.removeAttribute(name);
      else root.setAttribute(name, value);
    }
    documentThemeAttributes.clear();
    documentThemeTokens.clear();
    return;
  }

  root.setAttribute("data-theme", active.theme);
  if (active.highContrast) root.setAttribute("data-high-contrast", "true");
  else root.removeAttribute("data-high-contrast");
  if (active.reducedMotion) root.setAttribute("data-reduced-motion", "true");
  else root.removeAttribute("data-reduced-motion");

  if (active.generatedTheme) {
    applyTheme(
      active.generatedTheme,
      root,
      resolveApplyMode(active.theme, active.highContrast),
    );
  }
  applyCustomTokens(root, active.customTokens);
}

function updateDocumentTheme(id: symbol, state: DocumentThemeState): void {
  const root = document.documentElement;
  if (documentThemeStates.size === 0) {
    for (const name of THEME_ATTRIBUTES) {
      documentThemeAttributes.set(name, root.getAttribute(name));
    }
  }

  const tokenNames = new Set([
    ...generatedTokenNames(state.generatedTheme),
    ...Object.keys(state.customTokens ?? {}).filter((name) =>
      name.startsWith("--"),
    ),
  ]);
  for (const name of tokenNames) {
    if (!documentThemeTokens.has(name)) {
      documentThemeTokens.set(name, {
        value: root.style.getPropertyValue(name),
        priority: root.style.getPropertyPriority(name),
      });
    }
  }

  documentThemeStates.set(id, state);
  syncDocumentTheme();
}

function removeDocumentTheme(id: symbol): void {
  documentThemeStates.delete(id);
  syncDocumentTheme();
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
  if (typeof window !== "undefined" && window.matchMedia) {
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
  base = "porcelain",
  contrastRatio = "AA",
  customTokens,
  children,
}: React.PropsWithChildren<ThemeConfig>) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const previousThemeRef = useRef<GeneratedTheme | null>(null);
  const documentThemeIdRef = useRef(Symbol("theme-provider"));
  const documentThemeOrderRef = useRef(++themeProviderOrder);

  const generatedTheme = useMemo(() => {
    if (!brandColor) {
      return null;
    }
    try {
      return generateTheme({
        brand: brandColor,
        mood,
        base,
        contrastRatio,
      });
    } catch {
      return null;
    }
  }, [base, brandColor, contrastRatio, mood]);

  const value = useMemo<ThemeContextValue>(
    () => ({
      theme,
      highContrast,
      reducedMotion,
      brandColor,
      mood,
      base,
      contrastRatio,
      customTokens,
      generatedTheme,
    }),
    [
      base,
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

  const portalTheme = useMemo(
    () => ({
      theme,
      highContrast,
      reducedMotion,
      customTokens,
      generatedStyles: generatedTheme
        ? {
            light: generatedTheme.tokens,
            dark: { ...generatedTheme.tokens, ...generatedTheme.cssVars.dark },
            highContrast: {
              ...generatedTheme.tokens,
              ...generatedTheme.cssVars.highContrast,
            },
          }
        : undefined,
    }),
    [customTokens, generatedTheme, highContrast, reducedMotion, theme],
  );

  // Portals render under document.body, outside the provider wrapper. Keep the
  // topmost provider's contract on the document root for those overlays.
  useIsomorphicLayoutEffect(() => {
    updateDocumentTheme(documentThemeIdRef.current, {
      order: documentThemeOrderRef.current,
      theme,
      highContrast,
      reducedMotion,
      generatedTheme,
      customTokens,
    });

    return () => {
      removeDocumentTheme(documentThemeIdRef.current);
    };
  }, [customTokens, generatedTheme, highContrast, reducedMotion, theme]);

  useIsomorphicLayoutEffect(() => {
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
      previousThemeRef.current = generatedTheme;
    } else {
      previousThemeRef.current = null;
    }
    applyCustomTokens(el, customTokens);

    return () => {
      if (generatedTheme) {
        clearTheme(generatedTheme, el);
      }
    };
  }, [customTokens, generatedTheme, highContrast, theme]);

  // Follow system scheme when theme=system and brand theme is active.
  useEffect(() => {
    if (
      theme !== "system" ||
      !generatedTheme ||
      !rootRef.current ||
      !window.matchMedia
    ) {
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
      applyCustomTokens(rootRef.current, customTokens);
      syncDocumentTheme();
    };
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, [customTokens, generatedTheme, highContrast, theme]);

  return (
    <ThemeContext.Provider value={value}>
      <PortalThemeContext.Provider value={portalTheme}>
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
      </PortalThemeContext.Provider>
    </ThemeContext.Provider>
  );
}
