import type { ElementType, ForwardedRef } from "react";
import { createElement, forwardRef } from "react";
import { clsx } from "clsx";
import type { PolymorphicComponent } from "../shared/polymorphic";
import type { ContainerProps } from "./Container.types";
import { responsiveClasses } from "../shared/responsive";

const sizeClasses = {
  xs: "max-w-gs-breakpoint-sm",
  sm: "max-w-gs-breakpoint-md",
  md: "max-w-gs-breakpoint-lg",
  lg: "max-w-gs-breakpoint-xl",
  xl: "max-w-gs-breakpoint-2xl",
} as const;

function ContainerImpl(
  {
    as = "div",
    size = "lg",
    className,
    children,
    ...props
  }: ContainerProps<ElementType>,
  ref: ForwardedRef<HTMLElement>,
) {
  return createElement(
    as,
    {
      ref,
      className: clsx(
        "gs-container mx-auto box-border w-full px-4",
        responsiveClasses(size, sizeClasses, "lg"),
        className,
      ),
      "data-size": typeof size === "string" ? size : undefined,
      ...props,
    },
    children,
  );
}

export const Container = forwardRef(
  ContainerImpl,
) as unknown as PolymorphicComponent<
  "div",
  import("./Container.types").ContainerOwnProps
>;
Container.displayName = "Container";
