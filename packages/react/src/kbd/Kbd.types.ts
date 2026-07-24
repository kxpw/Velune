import type { HTMLAttributes, ReactNode } from "react";

export type KbdSize = "sm" | "md";

export interface KbdProps extends HTMLAttributes<HTMLElement> {
  /** Keyboard key label or chord content. */
  children?: ReactNode;
  /** Visual size. Default: `"md"`. */
  size?: KbdSize;
}
