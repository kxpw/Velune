import type { HTMLAttributes, ReactNode } from "react";

export type ScrollAreaOrientation = "vertical" | "horizontal" | "both";

export interface ScrollAreaProps extends HTMLAttributes<HTMLDivElement> {
  children?: ReactNode;
  /** Scroll axes. Default: `"vertical"`. */
  orientation?: ScrollAreaOrientation;
  /** Max height for the scrollport. Numbers are pixels. */
  maxHeight?: number | string;
}
