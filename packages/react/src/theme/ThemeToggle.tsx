import type { MouseEvent, ReactNode } from "react";
import { Moon, Sun } from "lucide-react";
import { Button } from "../button";
import {
  useThemeToggle,
  type ThemeToggleTheme,
  type UseThemeToggleOptions,
} from "@velune/hooks";

export type ThemeToggleProps = UseThemeToggleOptions & {
  className?: string | undefined;
  disabled?: boolean | undefined;
  variant?: "primary" | "secondary" | "ghost" | "text" | undefined;
  tone?: "default" | "danger" | undefined;
  size?: "sm" | "md" | "lg" | undefined;
  /** Replace the default sun/moon icon content. */
  children?: ReactNode;
  onClick?: ((event: MouseEvent<HTMLButtonElement>) => void) | undefined;
  /** Accessible name when switching to light. Default: `"Light theme"`. */
  lightLabel?: string | undefined;
  /** Accessible name when switching to dark. Default: `"Dark theme"`. */
  darkLabel?: string | undefined;
  "aria-label"?: string | undefined;
  theme?: ThemeToggleTheme | undefined;
  onThemeChange?: ((theme: ThemeToggleTheme) => void) | undefined;
};

export function ThemeToggle({
  defaultTheme,
  storageKey,
  persist,
  applyToDocument,
  onClick,
  lightLabel = "Light theme",
  darkLabel = "Dark theme",
  "aria-label": ariaLabel,
  children,
  className,
  disabled,
  variant,
  tone,
  size,
  theme,
  onThemeChange,
}: ThemeToggleProps) {
  const internalTheme = useThemeToggle({
    defaultTheme: theme === undefined ? defaultTheme : "system",
    storageKey,
    persist: theme === undefined ? persist : false,
    applyToDocument: theme === undefined ? applyToDocument : false,
  });
  const resolvedTheme =
    theme === "system"
      ? internalTheme.resolvedTheme
      : (theme ?? internalTheme.resolvedTheme);
  const nextLabel = resolvedTheme === "dark" ? lightLabel : darkLabel;
  const NextIcon = resolvedTheme === "dark" ? Sun : Moon;

  return (
    <Button
      type="button"
      className={className}
      disabled={disabled ?? false}
      variant={variant ?? "secondary"}
      tone={tone ?? "default"}
      size={size ?? "sm"}
      aria-label={ariaLabel ?? `Switch to ${nextLabel.toLowerCase()}`}
      onClick={(event) => {
        onClick?.(event);
        if (event.defaultPrevented) return;
        if (theme !== undefined) {
          onThemeChange?.(resolvedTheme === "dark" ? "light" : "dark");
        } else {
          internalTheme.toggleTheme();
        }
      }}
    >
      {children ?? (
        <Button.Leading>
          <NextIcon aria-hidden="true" />
        </Button.Leading>
      )}
    </Button>
  );
}
