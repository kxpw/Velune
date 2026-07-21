import type { ElementType } from "react";
import type { BoxSpacing } from "../box";
import type { PolymorphicProps } from "../shared/polymorphic";
import type { Responsive } from "../shared/responsive";

export type FlexDirection = "row" | "row-reverse" | "column" | "column-reverse";
export type FlexAlign = "start" | "center" | "end" | "stretch" | "baseline";
export type FlexJustify =
  | "start"
  | "center"
  | "end"
  | "between"
  | "around"
  | "evenly";
export type FlexWrap = boolean | "wrap" | "nowrap" | "wrap-reverse";

export interface FlexOwnProps {
  direction?: Responsive<FlexDirection>;
  align?: Responsive<FlexAlign>;
  justify?: Responsive<FlexJustify>;
  gap?: Responsive<BoxSpacing>;
  /** Enable wrapping. Pass `"wrap-reverse"` for reverse wrap. */
  wrap?: Responsive<FlexWrap>;
  /** `display: inline-flex` instead of `flex`. */
  inline?: Responsive<boolean>;
  /** Stretch to parent width. */
  fullWidth?: Responsive<boolean>;
}

export type FlexProps<TElement extends ElementType = "div"> = PolymorphicProps<
  TElement,
  FlexOwnProps
>;
