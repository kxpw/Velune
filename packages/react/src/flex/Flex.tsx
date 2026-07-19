import type { ElementType, ForwardedRef } from "react";
import { createElement, forwardRef } from "react";
import { clsx } from "clsx";
import type { FlexProps, FlexWrap } from "./Flex.types";
import type { PolymorphicComponent } from "../shared/polymorphic";
import {
  alignItemsClasses,
  gapClasses,
  justifyContentClasses,
} from "../shared/tailwind-classes";

const directionClasses = {
  row: "flex-row",
  "row-reverse": "flex-row-reverse",
  column: "flex-col",
  "column-reverse": "flex-col-reverse",
} as const;

const wrapClasses = {
  wrap: "flex-wrap",
  nowrap: "flex-nowrap",
  "wrap-reverse": "flex-wrap-reverse",
} as const;

function resolveWrap(
  wrap: FlexWrap | undefined,
): "wrap" | "nowrap" | "wrap-reverse" | undefined {
  if (wrap === true || wrap === "wrap") {
    return "wrap";
  }
  if (wrap === "wrap-reverse") {
    return "wrap-reverse";
  }
  if (wrap === false || wrap === "nowrap") {
    return "nowrap";
  }
  return undefined;
}

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
  const resolvedWrap = resolveWrap(wrap);

  return createElement(
    as,
    {
      ref,
      className: clsx(
        "gs-flex min-w-0",
        inline ? "inline-flex" : "flex",
        fullWidth && "w-full",
        directionClasses[direction],
        align && alignItemsClasses[align],
        justify && justifyContentClasses[justify],
        gap && gapClasses[gap],
        resolvedWrap && wrapClasses[resolvedWrap],
        className,
      ),
      "data-direction": direction,
      "data-align": align,
      "data-justify": justify,
      "data-gap": gap,
      "data-wrap": resolvedWrap,
      "data-inline": inline ? "true" : undefined,
      "data-full-width": fullWidth ? "true" : undefined,
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
