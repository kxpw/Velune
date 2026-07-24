import type { ElementType, ForwardedRef, ReactElement, ReactNode } from "react";
import {
  Children,
  cloneElement,
  createElement,
  forwardRef,
  Fragment,
  isValidElement,
} from "react";
import { clsx } from "clsx";
import type { StackProps } from "./Stack.types";
import type { PolymorphicComponent } from "../shared/polymorphic";
import { stackClasses } from "./Stack.classes";

function interleaveDivider(
  children: ReactNode,
  divider: ReactElement,
): ReactNode {
  // Children.toArray already removes null, undefined, and boolean children.
  const items = Children.toArray(children);
  return items.map((child, index) => (
    <Fragment
      key={isValidElement(child) && child.key != null ? child.key : index}
    >
      {index > 0 ? cloneElement(divider) : null}
      {child}
    </Fragment>
  ));
}

function StackImpl(
  {
    as = "div",
    gap,
    align,
    justify,
    reverse = false,
    fullWidth = false,
    divider,
    className,
    children,
    ...props
  }: StackProps<ElementType>,
  ref: ForwardedRef<HTMLElement>,
) {
  const content =
    divider && isValidElement(divider)
      ? interleaveDivider(children, divider)
      : children;

  return createElement(
    as,
    {
      ref,
      className: clsx(
        stackClasses({ gap, align, justify, reverse, fullWidth }),
        className,
      ),
      "data-gap": typeof gap === "string" ? gap : "4",
      "data-align": typeof align === "string" ? align : undefined,
      "data-justify": typeof justify === "string" ? justify : undefined,
      "data-reverse":
        typeof reverse === "boolean" && reverse ? "true" : undefined,
      "data-full-width":
        typeof fullWidth === "boolean" && fullWidth ? "true" : undefined,
      ...props,
    },
    content,
  );
}

export const Stack = forwardRef(StackImpl) as unknown as PolymorphicComponent<
  "div",
  import("./Stack.types").StackOwnProps
>;
Stack.displayName = "Stack";
