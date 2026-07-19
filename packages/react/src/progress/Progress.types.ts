import type { HTMLAttributes } from "react";

export type ProgressSize = "sm" | "md";

export type ProgressProps = Omit<HTMLAttributes<HTMLDivElement>, "children"> & {
  /** Current value between 0 and `max`. Omit for an indeterminate bar. */
  value?: number;
  /** Upper bound of the range. Default: `100`. */
  max?: number;
  /** Track thickness. Default: `md`. */
  size?: ProgressSize;
  /** Builds the accessible value text. Defaults to a rounded percentage. */
  getValueLabel?: (value: number, max: number) => string;
  /** Renders the rounded percentage next to the track. */
  showValue?: boolean;
};
