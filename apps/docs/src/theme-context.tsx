import { createContext, useContext } from "react";

export type PortalTheme = "light" | "dark";

export const PortalThemeContext = createContext<{
  theme: PortalTheme;
  toggleTheme: () => void;
}>({ theme: "light", toggleTheme: () => undefined });

export function usePortalTheme() {
  return useContext(PortalThemeContext);
}
