import { clsx } from "clsx";
import type { Responsive } from "../shared/responsive";
import {
  responsiveBooleanClasses,
  responsiveClasses,
} from "../shared/responsive";
import {
  alignItemsClasses,
  gapClasses,
  justifyContentClasses,
} from "../shared/tailwind-classes";
import type { BoxSpacing } from "../box";
import type {
  FlexAlign,
  FlexDirection,
  FlexJustify,
  FlexWrap,
} from "./Flex.types";

export const directionClasses: Record<FlexDirection, string> = {
  row: "flex-row",
  "row-reverse": "flex-row-reverse",
  column: "flex-col",
  "column-reverse": "flex-col-reverse",
};

export const wrapClasses = {
  true: "flex-wrap",
  false: "flex-nowrap",
  wrap: "flex-wrap",
  nowrap: "flex-nowrap",
  "wrap-reverse": "flex-wrap-reverse",
} as const;

export type FlexClassesOptions = {
  /** Default: `"row"`. */
  direction?: Responsive<FlexDirection> | undefined;
  align?: Responsive<FlexAlign> | undefined;
  justify?: Responsive<FlexJustify> | undefined;
  gap?: Responsive<BoxSpacing> | undefined;
  wrap?: Responsive<FlexWrap> | undefined;
  inline?: Responsive<boolean> | undefined;
  fullWidth?: Responsive<boolean> | undefined;
};

/** Style recipe for the Flex component. */
export function flexClasses({
  direction = "row",
  align,
  justify,
  gap,
  wrap = false,
  inline = false,
  fullWidth = false,
}: FlexClassesOptions = {}): string {
  return clsx(
    "gs-flex min-w-gs-0",
    "flex",
    responsiveBooleanClasses(inline, "inline-flex", "flex"),
    responsiveBooleanClasses(fullWidth, "w-full", "w-auto"),
    responsiveClasses(direction, directionClasses, "row"),
    responsiveClasses(align, alignItemsClasses),
    responsiveClasses(justify, justifyContentClasses),
    responsiveClasses(gap, gapClasses),
    responsiveClasses(wrap, wrapClasses, false),
  );
}
