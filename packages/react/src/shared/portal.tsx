import type { CSSProperties, ReactNode } from "react";
import { useContext, useLayoutEffect, useState } from "react";
import { createPortal } from "react-dom";
import { PortalThemeContext } from "./portal-theme-context";

export function Portal({
  children,
  container,
  disabled = false,
}: {
  children: ReactNode;
  container?: HTMLElement | null;
  disabled?: boolean;
}) {
  const [mounted, setMounted] = useState(false);
  const portalTheme = useContext(PortalThemeContext);
  const [systemDark, setSystemDark] = useState(
    () =>
      typeof window !== "undefined" &&
      Boolean(window.matchMedia?.("(prefers-color-scheme: dark)").matches),
  );

  // Layout (not passive effect) so overlays can measure in the same frame as
  // open, instead of waiting until after the first paint.
  useLayoutEffect(() => {
    setMounted(true);
  }, []);

  useLayoutEffect(() => {
    if (portalTheme?.theme !== "system" || !window.matchMedia) return;
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => setSystemDark(media.matches);
    onChange();
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, [portalTheme?.theme]);

  if (disabled) {
    return <>{children}</>;
  }

  if (!mounted) {
    return null;
  }

  const target = container ?? document.body;
  if (!portalTheme) {
    return createPortal(children, target);
  }

  const mode = portalTheme.highContrast
    ? "highContrast"
    : portalTheme.theme === "system"
      ? systemDark
        ? "dark"
        : "light"
      : portalTheme.theme;
  const style = {
    display: "contents",
    ...portalTheme.generatedStyles?.[mode],
    ...portalTheme.customTokens,
  } as CSSProperties;

  return createPortal(
    <div
      className="gs-theme-root gs-portal-theme-root"
      data-theme={portalTheme.theme}
      data-high-contrast={portalTheme.highContrast ? "true" : undefined}
      data-reduced-motion={portalTheme.reducedMotion ? "true" : undefined}
      style={style}
    >
      {children}
    </div>,
    target,
  );
}
