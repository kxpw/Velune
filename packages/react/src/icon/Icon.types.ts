import type { HTMLAttributes, ReactNode } from "react";

export type IconSize = "sm" | "md" | "lg";

export interface IconProps extends Omit<
  HTMLAttributes<HTMLSpanElement>,
  "children"
> {
  /**
   * Icon content — typically a Lucide (or other) SVG component.
   *
   * @example
   * import { Search } from "lucide-react";
   * <Icon><Search /></Icon>
   */
  children: ReactNode;
  /** Visual size. Default: `"md"`. Maps to design-token spacing. */
  size?: IconSize;
  /**
   * Accessible name. When set, the icon is exposed as `role="img"`.
   * Omit for decorative icons (they stay `aria-hidden`).
   */
  label?: string;
}
