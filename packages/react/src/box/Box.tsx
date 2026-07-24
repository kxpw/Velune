import type { ElementType, ForwardedRef } from "react";
import { createElement, forwardRef } from "react";
import { clsx } from "clsx";
import type { BoxProps } from "./Box.types";
import type { PolymorphicComponent } from "../shared/polymorphic";
import { boxClasses } from "./Box.classes";

function BoxImpl(
  {
    as = "div",
    padding,
    margin,
    display,
    className,
    children,
    ...props
  }: BoxProps<ElementType>,
  ref: ForwardedRef<HTMLElement>,
) {
  return createElement(
    as,
    {
      ref,
      className: clsx(boxClasses({ padding, margin, display }), className),
      "data-padding": typeof padding === "string" ? padding : undefined,
      "data-margin": typeof margin === "string" ? margin : undefined,
      "data-display": typeof display === "string" ? display : undefined,
      ...props,
    },
    children,
  );
}

export const Box = forwardRef(BoxImpl) as unknown as PolymorphicComponent<
  "div",
  import("./Box.types").BoxOwnProps
>;
Box.displayName = "Box";
