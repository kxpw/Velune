import type { CSSProperties, ForwardedRef } from "react";
import { forwardRef } from "react";
import { clsx } from "clsx";
import type { SkeletonProps } from "./Skeleton.types";
import { skeletonClasses } from "./Skeleton.classes";

function toCssDimension(value: number | string | undefined) {
  return typeof value === "number" ? `${value}px` : value;
}

function SkeletonImpl(
  {
    variant = "text",
    animation = "pulse",
    width,
    height,
    className,
    style,
    ...props
  }: SkeletonProps,
  ref: ForwardedRef<HTMLSpanElement>,
) {
  const dimensions = {
    "--gs-skeleton-width": toCssDimension(width),
    "--gs-skeleton-height": toCssDimension(height),
    ...style,
  } as CSSProperties;

  return (
    <span
      {...props}
      ref={ref}
      aria-hidden="true"
      className={clsx(skeletonClasses({ variant, animation }), className)}
      data-variant={variant}
      data-animation={animation}
      style={dimensions}
    />
  );
}

export const Skeleton = forwardRef(SkeletonImpl);
Skeleton.displayName = "Skeleton";
