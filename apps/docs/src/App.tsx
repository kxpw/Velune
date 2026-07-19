import { useMemo } from "react";
import { RouterProvider } from "@tanstack/react-router";
import { ThemeProvider, ToastProvider, useThemeToggle } from "velune/react";
import { router } from "./router";
import { PortalThemeContext } from "./theme-context";

export default function App() {
  const { theme, resolvedTheme, toggleTheme } = useThemeToggle();
  const context = useMemo(
    () => ({
      theme: resolvedTheme,
      toggleTheme,
    }),
    [resolvedTheme, toggleTheme],
  );
  return (
    <ThemeProvider theme={theme}>
      <PortalThemeContext.Provider value={context}>
        <ToastProvider position="bottom-right">
          <RouterProvider router={router} />
        </ToastProvider>
      </PortalThemeContext.Provider>
    </ThemeProvider>
  );
}
