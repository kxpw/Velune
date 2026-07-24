import type { ElementType, ForwardedRef } from "react";
import { createElement, forwardRef } from "react";
import { clsx } from "clsx";
import type { FlexProps } from "./Flex.types";
import type { PolymorphicComponent } from "../shared/polymorphic";
import { flexClasses } from "./Flex.classes";

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
        flexClasses({
          direction,
          align,
          justify,
          gap,
          wrap,
          inline,
          fullWidth,
        }),
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
