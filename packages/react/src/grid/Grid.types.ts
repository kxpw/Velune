import type { ElementType } from "react";
import type { BoxSpacing } from "../box";
import type { FlexAlign } from "../flex";
import type { PolymorphicProps } from "../shared/polymorphic";

export type GridColumns = 1 | 2 | 3 | 4 | 6 | 12;
export type GridJustify = "start" | "center" | "end" | "stretch";

export interface GridOwnProps {
  columns?: GridColumns;
  gap?: BoxSpacing;
  /** Collapse to a single column below the md breakpoint. Default: `true`. */
  responsive?: boolean;
  align?: FlexAlign;
  justify?: GridJustify;
  /** Stretch to parent width. Default: `true`. */
  fullWidth?: boolean;
}

export type GridProps<TElement extends ElementType = "div"> = PolymorphicProps<
  TElement,
  GridOwnProps
>;
