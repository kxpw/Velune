import { clsx } from "clsx";
import type { Responsive } from "../shared/responsive";
import {
  responsiveBooleanClasses,
  responsiveClasses,
} from "../shared/responsive";
import { alignItemsClasses, gapClasses } from "../shared/tailwind-classes";
import type { BoxSpacing } from "../box";
import type { FlexAlign } from "../flex";
import type { GridColumns, GridJustify } from "./Grid.types";

export const columnClasses: Record<GridColumns, string> = {
  1: "grid-cols-1",
  2: "grid-cols-2",
  3: "grid-cols-3",
  4: "grid-cols-4",
  6: "grid-cols-6",
  12: "grid-cols-12",
};

export const justifyItemsClasses: Record<GridJustify, string> = {
  start: "justify-items-start",
  center: "justify-items-center",
  end: "justify-items-end",
  stretch: "justify-items-stretch",
};

export type GridClassesOptions = {
  /** Default: `12`. */
  columns?: Responsive<GridColumns> | undefined;
  /** Default: `"4"`. */
  gap?: Responsive<BoxSpacing> | undefined;
  /** Collapse to a single column below the md breakpoint. Default: `true`. */
  responsive?: boolean | undefined;
  align?: Responsive<FlexAlign> | undefined;
  justify?: Responsive<GridJustify> | undefined;
  /** Default: `true`. */
  fullWidth?: Responsive<boolean> | undefined;
};

/** Style recipe for the Grid component. */
export function gridClasses({
  columns = 12,
  gap = "4",
  responsive = true,
  align,
  justify,
  fullWidth = true,
}: GridClassesOptions = {}): string {
  return clsx(
    "gs-grid grid min-w-gs-0",
    responsiveClasses(columns, columnClasses, 12),
    responsive && typeof columns !== "object" && "max-md:grid-cols-1",
    responsiveBooleanClasses(fullWidth, "w-full", "w-auto", true),
    responsiveClasses(gap, gapClasses, "4"),
    responsiveClasses(align, alignItemsClasses),
    responsiveClasses(justify, justifyItemsClasses),
  );
}
