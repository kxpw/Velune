import type { ElementType, ForwardedRef } from "react";
import { createElement, forwardRef } from "react";
import { clsx } from "clsx";
import type { PolymorphicComponent } from "../shared/polymorphic";
import type { ContainerProps } from "./Container.types";
import { containerClasses } from "./Container.classes";

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
      className: clsx(containerClasses({ size }), className),
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
