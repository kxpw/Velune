import type { ElementType } from "react";
import type { BoxSpacing } from "../box";
import type { PolymorphicProps } from "../shared/polymorphic";

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
  direction?: FlexDirection;
  align?: FlexAlign;
  justify?: FlexJustify;
  gap?: BoxSpacing;
  /** Enable wrapping. Pass `"wrap-reverse"` for reverse wrap. */
  wrap?: FlexWrap;
  /** `display: inline-flex` instead of `flex`. */
  inline?: boolean;
  /** Stretch to parent width. */
  fullWidth?: boolean;
}

export type FlexProps<TElement extends ElementType = "div"> = PolymorphicProps<
  TElement,
  FlexOwnProps
>;
