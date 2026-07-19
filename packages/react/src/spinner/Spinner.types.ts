import type { HTMLAttributes } from "react";

export type SpinnerSize = "sm" | "md" | "lg";
export type SpinnerTone =
  | "primary"
  | "current"
  | "muted"
  | "success"
  | "warning"
  | "error"
  | "info";

export interface SpinnerProps extends HTMLAttributes<HTMLSpanElement> {
  /** Visual size. Default: `md`. */
  size?: SpinnerSize;
  /** Color tone. Default: `primary`. Use `current` to inherit text color. */
  tone?: SpinnerTone;
}
