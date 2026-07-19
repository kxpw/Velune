import type { CSSProperties, ForwardedRef } from "react";
import { forwardRef } from "react";
import { clsx } from "clsx";
import type { SkeletonProps } from "./Skeleton.types";

const variantClasses = {
  text: "rounded-gs-sm",
  rectangular: "rounded-none",
  rounded: "rounded-gs-md",
  circular: "rounded-full",
} as const;

const animationClasses = {
  pulse:
    "animate-gs-skeleton-pulse motion-reduce:animate-none [[data-reduced-motion=true]_&]:animate-none",
  wave: "relative after:absolute after:inset-0 after:translate-x-[-100%] after:bg-gs-skeleton-shimmer after:content-[''] after:animate-gs-skeleton-wave motion-reduce:after:animate-none [[data-reduced-motion=true]_&]:after:animate-none",
  none: "",
} as const;

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
      className={clsx(
        "gs-skeleton pointer-events-none block select-none overflow-hidden bg-gs-surface-hover",
        variant === "circular"
          ? "h-[var(--gs-skeleton-height,var(--gs-skeleton-width,var(--space-10)))] w-[var(--gs-skeleton-width,var(--space-10))]"
          : "h-[var(--gs-skeleton-height,1em)] w-[var(--gs-skeleton-width,100%)]",
        variantClasses[variant],
        animationClasses[animation],
        className,
      )}
      data-variant={variant}
      data-animation={animation}
      style={dimensions}
    />
  );
}

export const Skeleton = forwardRef(SkeletonImpl);
Skeleton.displayName = "Skeleton";
