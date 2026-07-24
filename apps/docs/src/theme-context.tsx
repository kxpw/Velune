import { createContext, useContext } from "react";

export type PortalTheme = "light" | "dark";

export const PortalThemeContext = createContext<{
  theme: PortalTheme;
  toggleTheme: () => void;
  setTheme: (theme: PortalTheme) => void;
}>({
  theme: "light",
  toggleTheme: () => undefined,
  setTheme: () => undefined,
});

export function usePortalTheme() {
  return useContext(PortalThemeContext);
}
