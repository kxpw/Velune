import { createContext } from "react";

export type PortalThemeContextValue = {
  theme: "light" | "dark" | "system";
  highContrast: boolean;
  reducedMotion: boolean;
  customTokens?: Record<string, string> | undefined;
  generatedStyles?:
    | {
        light: Record<string, string>;
        dark: Record<string, string>;
        highContrast: Record<string, string>;
      }
    | undefined;
};

export const PortalThemeContext = createContext<PortalThemeContextValue | null>(
  null,
);
