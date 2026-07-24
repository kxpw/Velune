import type { ElementType } from "react";
import type { BoxSpacing } from "../box";
import type { FlexAlign } from "../flex";
import type { PolymorphicProps } from "../shared/polymorphic";
import type { Responsive } from "../shared/responsive";

export type GridColumns = 1 | 2 | 3 | 4 | 6 | 12;
export type GridJustify = "start" | "center" | "end" | "stretch";

export interface GridOwnProps {
  columns?: Responsive<GridColumns>;
  gap?: Responsive<BoxSpacing>;
  /** Collapse to a single column below the md breakpoint. Default: `true`. */
  responsive?: boolean;
  align?: Responsive<FlexAlign>;
  justify?: Responsive<GridJustify>;
  /**
   * Stretch to parent width. Default: `true`.
   * Layout primitives (Grid) default to full width; form controls default to `false`.
   */
  fullWidth?: Responsive<boolean>;
}

export type GridProps<TElement extends ElementType = "div"> = PolymorphicProps<
  TElement,
  GridOwnProps
>;
