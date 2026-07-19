import type { ElementType, ForwardedRef } from "react";
import { createElement, forwardRef } from "react";
import { clsx } from "clsx";
import type {
  TextAlign,
  TextFamily,
  TextProps,
  TextSize,
  TextTone,
  TextWeight,
} from "./Text.types";
import type { PolymorphicComponent } from "../shared/polymorphic";

const sizeClasses: Record<TextSize, string> = {
  "2xs": "text-gs-2xs leading-gs-body",
  xs: "text-xs leading-gs-body",
  sm: "text-sm leading-gs-body",
  md: "text-base leading-gs-body",
  lg: "text-lg leading-gs-body",
  xl: "text-gs-xl leading-gs-normal",
  "2xl": "text-gs-2xl leading-gs-normal",
  "3xl": "text-gs-3xl leading-gs-normal tracking-normal",
  "4xl": "text-gs-4xl leading-gs-normal tracking-normal",
  display: "text-gs-display leading-gs-normal tracking-normal",
};

const weightClasses: Record<TextWeight, string> = {
  light: "font-gs-light",
  regular: "font-gs-regular",
  medium: "font-gs-medium",
  semibold: "font-gs-semibold",
  bold: "font-gs-bold",
};

const toneClasses: Record<TextTone, string> = {
  default: "text-gs-text-color",
  muted: "text-gs-text-muted-color",
  primary: "text-gs-text-accent",
  success: "text-gs-success",
  warning: "text-gs-warning",
  error: "text-gs-error",
};

const alignClasses: Record<TextAlign, string> = {
  start: "text-start",
  center: "text-center",
  end: "text-end",
  justify: "text-justify",
};

const familyClasses: Record<TextFamily, string> = {
  sans: "font-gs-sans",
  serif: "font-gs-serif",
  mono: "font-gs-mono [font-variant-ligatures:none]",
};

const lineClasses = {
  1: "line-clamp-1",
  2: "line-clamp-2",
  3: "line-clamp-3",
  4: "line-clamp-4",
  5: "line-clamp-5",
} as const;

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
    muted = false,
    cjk = false,
    className,
    children,
    ...props
  }: TextProps<ElementType>,
  ref: ForwardedRef<HTMLElement>,
) {
  // Display roles pair the serif face with the light weight by default.
  const isDisplayRole = size === "display" || size === "4xl";
  const resolvedWeight = weight ?? (isDisplayRole ? "light" : "regular");
  const resolvedFamily = family ?? (isDisplayRole ? "serif" : "sans");
  const resolvedTone = muted ? "muted" : tone;
  return createElement(
    as,
    {
      ref,
      className: clsx(
        "gs-text m-0 tracking-normal [&:where(p,h1,h2,h3,h4,h5,h6,div,li,label,figcaption)]:block [&:where(:lang(zh),:lang(ja),:lang(ko),[data-cjk=true])]:tracking-gs-cjk [&:where(:lang(zh),:lang(ja),:lang(ko),[data-cjk=true])]:leading-gs-relaxed",
        sizeClasses[size],
        weightClasses[resolvedWeight],
        toneClasses[resolvedTone],
        align && alignClasses[align],
        familyClasses[resolvedFamily],
        truncate && "block max-w-full truncate",
        lines && "max-w-full",
        lines && lineClasses[lines],
        className,
      ),
      "data-size": size,
      "data-weight": resolvedWeight,
      "data-tone": resolvedTone,
      "data-align": align,
      "data-family": resolvedFamily === "sans" ? undefined : resolvedFamily,
      "data-truncate": truncate ? "true" : undefined,
      "data-lines": lines,
      "data-muted": muted ? "true" : undefined,
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
