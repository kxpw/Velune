import { useMemo } from "react";
import { RouterProvider } from "@tanstack/react-router";
import { ThemeProvider, ToastProvider, useThemeToggle } from "velune/react";
import { router } from "./router";
import { PortalThemeContext } from "./theme-context";

export default function App() {
  const { resolvedTheme, setTheme, toggleTheme } = useThemeToggle();
  const context = useMemo(
    () => ({
      theme: resolvedTheme,
      setTheme,
      toggleTheme,
    }),
    [resolvedTheme, setTheme, toggleTheme],
  );
  return (
    <ThemeProvider theme={resolvedTheme}>
      <PortalThemeContext.Provider value={context}>
        <ToastProvider position="bottom-right">
          <RouterProvider router={router} />
        </ToastProvider>
      </PortalThemeContext.Provider>
    </ThemeProvider>
  );
}
