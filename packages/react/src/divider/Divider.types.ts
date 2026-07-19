import type { HTMLAttributes, ReactNode } from "react";

export type DividerOrientation = "horizontal" | "vertical";
export type DividerAlign = "start" | "center" | "end";
export type DividerTone = "default" | "muted" | "subtle";

export interface DividerProps extends HTMLAttributes<HTMLDivElement> {
  orientation?: DividerOrientation;
  /** Label alignment when children are provided. Default: `center`. */
  align?: DividerAlign;
  /** Visual strength of the rule. Default: `default`. */
  tone?: DividerTone;
  /** Use a dashed rule. */
  dashed?: boolean;
  children?: ReactNode;
}
