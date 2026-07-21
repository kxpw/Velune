import type { HTMLAttributes, ReactNode } from "react";

export type AlertTone = "neutral" | "info" | "success" | "warning" | "error";

export interface AlertProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * Visual and semantic tone. Defaults to `"info"`.
   *
   * @example
   * <Alert tone="success">Saved.</Alert>
   */
  tone?: AlertTone;
  /** Custom leading icon. Pass `null` to hide the tone icon. */
  icon?: ReactNode;
  /** Shows a dismiss button that hides the alert. */
  closable?: boolean;
  /** Controls visibility. Use with `onOpenChange` for controlled dismissal. */
  open?: boolean;
  /** Initial visibility for uncontrolled usage. Default: `true`. */
  defaultOpen?: boolean;
  /** Fires when the dismiss button requests a visibility change. */
  onOpenChange?: (open: boolean) => void;
  /** Fires when the dismiss button is pressed. */
  onClose?: () => void;
  /** Accessible name for the dismiss button. Defaults to `"Dismiss"`. */
  closeLabel?: string;
  children?: ReactNode;
}

export interface AlertTitleProps extends HTMLAttributes<HTMLDivElement> {
  children?: ReactNode;
}

export interface AlertDescriptionProps extends HTMLAttributes<HTMLDivElement> {
  children?: ReactNode;
}
