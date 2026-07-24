import type { HTMLAttributes, ReactNode } from "react";

export type AspectRatioValue = number | `${number}/${number}`;

export interface AspectRatioProps extends HTMLAttributes<HTMLDivElement> {
  children?: ReactNode;
  /**
   * Desired aspect ratio. Accepts a number (width / height) or a CSS ratio
   * string such as `"16/9"`. Default: `"16/9"`.
   */
  ratio?: AspectRatioValue;
}
