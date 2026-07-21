import type { ElementType, ReactElement } from "react";
import type { BoxSpacing } from "../box";
import type { FlexAlign, FlexJustify } from "../flex";
import type { PolymorphicProps } from "../shared/polymorphic";
import type { Responsive } from "../shared/responsive";

export interface StackOwnProps {
  /** Vertical gap between children. Defaults to `4`. */
  gap?: Responsive<BoxSpacing>;
  align?: Responsive<FlexAlign>;
  justify?: Responsive<FlexJustify>;
  /** Reverse column order. */
  reverse?: Responsive<boolean>;
  /** Stretch to parent width. */
  fullWidth?: Responsive<boolean>;
  /** Element cloned between each pair of children, e.g. `<Divider />`. */
  divider?: ReactElement;
}

export type StackProps<TElement extends ElementType = "div"> = PolymorphicProps<
  TElement,
  StackOwnProps
>;
