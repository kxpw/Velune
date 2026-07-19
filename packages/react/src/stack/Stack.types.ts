import type { ElementType } from "react";
import type { BoxSpacing } from "../box";
import type { FlexAlign, FlexJustify } from "../flex";
import type { PolymorphicProps } from "../shared/polymorphic";

export interface StackOwnProps {
  /** Vertical gap between children. Defaults to `4`. */
  spacing?: BoxSpacing;
  /** Alias of `spacing`. */
  gap?: BoxSpacing;
  align?: FlexAlign;
  justify?: FlexJustify;
  /** Reverse column order. */
  reverse?: boolean;
  /** Stretch to parent width. */
  fullWidth?: boolean;
}

export type StackProps<TElement extends ElementType = "div"> = PolymorphicProps<
  TElement,
  StackOwnProps
>;
