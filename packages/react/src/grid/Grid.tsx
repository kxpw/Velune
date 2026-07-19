import type { ElementType, ForwardedRef } from "react";
import { createElement, forwardRef } from "react";
import { clsx } from "clsx";
import type { GridProps } from "./Grid.types";
import type { PolymorphicComponent } from "../shared/polymorphic";
import { alignItemsClasses, gapClasses } from "../shared/tailwind-classes";

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
        columnClasses[columns],
        responsive && "max-md:grid-cols-1",
        fullWidth && "w-full",
        gapClasses[gap],
        align && alignItemsClasses[align],
        justify && justifyItemsClasses[justify],
        className,
      ),
      "data-columns": columns,
      "data-gap": gap,
      "data-responsive": responsive ? "true" : undefined,
      "data-align": align,
      "data-justify": justify,
      "data-full-width": fullWidth ? "true" : undefined,
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
