import type { ElementType, ForwardedRef } from "react";
import { createElement, forwardRef } from "react";
import { clsx } from "clsx";
import type { GridProps } from "./Grid.types";
import type { PolymorphicComponent } from "../shared/polymorphic";
import { gridClasses } from "./Grid.classes";

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
        gridClasses({ columns, gap, responsive, align, justify, fullWidth }),
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
