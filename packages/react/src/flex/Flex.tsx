import type { ElementType, ForwardedRef } from "react";
import { createElement, forwardRef } from "react";
import { clsx } from "clsx";
import type { FlexProps } from "./Flex.types";
import type { PolymorphicComponent } from "../shared/polymorphic";
import {
  alignItemsClasses,
  gapClasses,
  justifyContentClasses,
} from "../shared/tailwind-classes";
import {
  responsiveBooleanClasses,
  responsiveClasses,
} from "../shared/responsive";

const directionClasses = {
  row: "flex-row",
  "row-reverse": "flex-row-reverse",
  column: "flex-col",
  "column-reverse": "flex-col-reverse",
} as const;

const wrapClasses = {
  true: "flex-wrap",
  false: "flex-nowrap",
  wrap: "flex-wrap",
  nowrap: "flex-nowrap",
  "wrap-reverse": "flex-wrap-reverse",
} as const;

function FlexImpl(
  {
    as = "div",
    direction = "row",
    align,
    justify,
    gap,
    wrap = false,
    inline = false,
    fullWidth = false,
    className,
    children,
    ...props
  }: FlexProps<ElementType>,
  ref: ForwardedRef<HTMLElement>,
) {
  return createElement(
    as,
    {
      ref,
      className: clsx(
        "gs-flex min-w-0",
        "flex",
        responsiveBooleanClasses(inline, "inline-flex", "flex"),
        responsiveBooleanClasses(fullWidth, "w-full", "w-auto"),
        responsiveClasses(direction, directionClasses, "row"),
        responsiveClasses(align, alignItemsClasses),
        responsiveClasses(justify, justifyContentClasses),
        responsiveClasses(gap, gapClasses),
        responsiveClasses(wrap, wrapClasses, false),
        className,
      ),
      "data-direction": typeof direction === "string" ? direction : undefined,
      "data-align": typeof align === "string" ? align : undefined,
      "data-justify": typeof justify === "string" ? justify : undefined,
      "data-gap": typeof gap === "string" ? gap : undefined,
      "data-wrap":
        typeof wrap === "boolean"
          ? wrap
            ? "wrap"
            : "nowrap"
          : typeof wrap === "string"
            ? wrap
            : undefined,
      "data-inline": typeof inline === "boolean" && inline ? "true" : undefined,
      "data-full-width":
        typeof fullWidth === "boolean" && fullWidth ? "true" : undefined,
      ...props,
    },
    children,
  );
}

export const Flex = forwardRef(FlexImpl) as unknown as PolymorphicComponent<
  "div",
  import("./Flex.types").FlexOwnProps
>;
Flex.displayName = "Flex";
