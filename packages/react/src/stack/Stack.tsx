import type { ElementType, ForwardedRef } from "react";
import { createElement, forwardRef } from "react";
import { clsx } from "clsx";
import type { StackProps } from "./Stack.types";
import type { PolymorphicComponent } from "../shared/polymorphic";
import {
  alignItemsClasses,
  gapClasses,
  justifyContentClasses,
} from "../shared/tailwind-classes";

function StackImpl(
  {
    as = "div",
    spacing,
    gap,
    align,
    justify,
    reverse = false,
    fullWidth = false,
    className,
    children,
    ...props
  }: StackProps<ElementType>,
  ref: ForwardedRef<HTMLElement>,
) {
  const resolvedSpacing = gap ?? spacing ?? "4";

  return createElement(
    as,
    {
      ref,
      className: clsx(
        "gs-stack flex min-w-0",
        reverse ? "flex-col-reverse" : "flex-col",
        fullWidth && "w-full",
        gapClasses[resolvedSpacing],
        align && alignItemsClasses[align],
        justify && justifyContentClasses[justify],
        className,
      ),
      "data-spacing": resolvedSpacing,
      "data-align": align,
      "data-justify": justify,
      "data-reverse": reverse ? "true" : undefined,
      "data-full-width": fullWidth ? "true" : undefined,
      ...props,
    },
    children,
  );
}

export const Stack = forwardRef(StackImpl) as unknown as PolymorphicComponent<
  "div",
  import("./Stack.types").StackOwnProps
>;
Stack.displayName = "Stack";
