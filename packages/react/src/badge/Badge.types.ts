import type { HTMLAttributes, ReactNode } from "react";

export type BadgeTone =
  | "default"
  | "primary"
  | "success"
  | "warning"
  | "error"
  | "info";

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  /** Numeric count. Hidden when `0` unless `showZero`. */
  count?: number;
  /** Cap displayed count, e.g. `99` → `99+`. Default: `99`. */
  max?: number;
  /** Dot-only indicator (no number). */
  dot?: boolean;
  tone?: BadgeTone;
  /** Show badge when count is `0`. */
  showZero?: boolean;
  /** Content the badge attaches to. Without children, renders standalone. */
  children?: ReactNode;
}
