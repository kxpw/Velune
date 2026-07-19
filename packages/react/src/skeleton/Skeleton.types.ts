import type { CSSProperties, HTMLAttributes } from "react";

export type SkeletonVariant = "text" | "rectangular" | "rounded" | "circular";
export type SkeletonAnimation = "pulse" | "wave" | "none";
export type SkeletonDimension = number | string;

export interface SkeletonProps extends Omit<
  HTMLAttributes<HTMLSpanElement>,
  "children"
> {
  /** Placeholder shape. Default: `text`. */
  variant?: SkeletonVariant;
  /** Loading animation. Default: `pulse`. */
  animation?: SkeletonAnimation;
  /** CSS width. Numbers are interpreted as pixels. */
  width?: SkeletonDimension;
  /** CSS height. Numbers are interpreted as pixels. */
  height?: SkeletonDimension;
  style?: CSSProperties;
}
