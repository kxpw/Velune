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
import type { FlexAlign, FlexJustify } from "../flex";

export const reverseClasses = {
  true: "flex-col-reverse",
  false: "flex-col",
} as const;

export type StackClassesOptions = {
  /** Default: `"4"`. */
  gap?: Responsive<BoxSpacing> | undefined;
  align?: Responsive<FlexAlign> | undefined;
  justify?: Responsive<FlexJustify> | undefined;
  reverse?: Responsive<boolean> | undefined;
  fullWidth?: Responsive<boolean> | undefined;
};

/** Style recipe for the Stack component. */
export function stackClasses({
  gap,
  align,
  justify,
  reverse = false,
  fullWidth = false,
}: StackClassesOptions = {}): string {
  return clsx(
    "gs-stack flex min-w-gs-0",
    responsiveClasses(reverse, reverseClasses, false),
    responsiveBooleanClasses(fullWidth, "w-full", "w-auto"),
    responsiveClasses(gap, gapClasses, "4"),
    responsiveClasses(align, alignItemsClasses),
    responsiveClasses(justify, justifyContentClasses),
  );
}
