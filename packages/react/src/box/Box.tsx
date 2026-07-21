import type { ElementType, ForwardedRef } from "react";
import { createElement, forwardRef } from "react";
import { clsx } from "clsx";
import type { BoxProps } from "./Box.types";
import type { PolymorphicComponent } from "../shared/polymorphic";
import { marginClasses, paddingClasses } from "../shared/tailwind-classes";
import { responsiveClasses } from "../shared/responsive";

const displayClasses = {
  block: "block",
  inline: "inline",
  "inline-block": "inline-block",
  flex: "flex",
  "inline-flex": "inline-flex",
  grid: "grid",
  none: "hidden",
} as const;

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
      className: clsx(
        "gs-box box-border",
        responsiveClasses(padding, paddingClasses),
        responsiveClasses(margin, marginClasses),
        responsiveClasses(display, displayClasses),
        className,
      ),
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
