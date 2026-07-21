import type { ElementType, ForwardedRef } from "react";
import { createElement, forwardRef } from "react";
import { clsx } from "clsx";
import type { GridProps } from "./Grid.types";
import type { PolymorphicComponent } from "../shared/polymorphic";
import { alignItemsClasses, gapClasses } from "../shared/tailwind-classes";
import {
  responsiveBooleanClasses,
  responsiveClasses,
} from "../shared/responsive";

const columnClasses = {
  1: "grid-cols-1",
  2: "grid-cols-2",
  3: "grid-cols-3",
  4: "grid-cols-4",
  6: "grid-cols-6",
  12: "grid-cols-12",
} as const;

const justifyItemsClasses = {
  start: "justify-items-start",
  center: "justify-items-center",
  end: "justify-items-end",
  stretch: "justify-items-stretch",
} as const;

function GridImpl(
  {
    as = "div",
    columns = 12,
    gap = "4",
    responsive = true,
    align,
    justify,
    fullWidth = true,
    className,
    children,
    ...props
  }: GridProps<ElementType>,
  ref: ForwardedRef<HTMLElement>,
) {
  return createElement(
    as,
    {
      ref,
      className: clsx(
        "gs-grid grid min-w-0",
        responsiveClasses(columns, columnClasses, 12),
        responsive && typeof columns !== "object" && "max-md:grid-cols-1",
        responsiveBooleanClasses(fullWidth, "w-full", "w-auto", true),
        responsiveClasses(gap, gapClasses, "4"),
        responsiveClasses(align, alignItemsClasses),
        responsiveClasses(justify, justifyItemsClasses),
        className,
      ),
      "data-columns": typeof columns === "number" ? columns : undefined,
      "data-gap": typeof gap === "string" ? gap : undefined,
      "data-responsive": responsive ? "true" : undefined,
      "data-align": typeof align === "string" ? align : undefined,
      "data-justify": typeof justify === "string" ? justify : undefined,
      "data-full-width":
        typeof fullWidth === "boolean"
          ? fullWidth
            ? "true"
            : undefined
          : undefined,
      ...props,
    },
    children,
  );
}

export const Grid = forwardRef(GridImpl) as unknown as PolymorphicComponent<
  "div",
  import("./Grid.types").GridOwnProps
>;
Grid.displayName = "Grid";
