import type { ElementType, ForwardedRef } from "react";
import { createElement, forwardRef } from "react";
import { clsx } from "clsx";
import type { TextProps } from "./Text.types";
import type { PolymorphicComponent } from "../shared/polymorphic";
import { textClasses } from "./Text.classes";

function TextImpl(
  {
    as = "span",
    size = "md",
    weight,
    tone = "default",
    align,
    family,
    truncate = false,
    lines,
    cjk = false,
    className,
    children,
    ...props
  }: TextProps<ElementType>,
  ref: ForwardedRef<HTMLElement>,
) {
  // Display roles pair the serif face with the light weight by default.
  const isDisplayRole = size === "4xl";
  const resolvedWeight = weight ?? (isDisplayRole ? "light" : "regular");
  const resolvedFamily = family ?? (isDisplayRole ? "serif" : "sans");
  return createElement(
    as,
    {
      ref,
      className: clsx(
        textClasses({
          size,
          weight: resolvedWeight,
          tone,
          align,
          family: resolvedFamily,
          truncate,
          lines,
        }),
        className,
      ),
      "data-size": size,
      "data-weight": resolvedWeight,
      "data-tone": tone,
      "data-align": align,
      "data-family": resolvedFamily === "sans" ? undefined : resolvedFamily,
      "data-truncate": truncate ? "true" : undefined,
      "data-lines": lines,
      "data-cjk": cjk ? "true" : undefined,
      ...props,
    },
    children,
  );
}

export const Text = forwardRef(TextImpl) as unknown as PolymorphicComponent<
  "span",
  import("./Text.types").TextOwnProps
>;
Text.displayName = "Text";
