import type { ForwardedRef } from "react";
import { forwardRef } from "react";
import { clsx } from "clsx";
import type { ContainerProps } from "./Container.types";

const sizeClasses = {
  xs: "max-w-gs-breakpoint-sm",
  sm: "max-w-gs-breakpoint-md",
  md: "max-w-gs-breakpoint-lg",
  lg: "max-w-gs-breakpoint-xl",
  xl: "max-w-gs-breakpoint-2xl",
} as const;

function ContainerImpl(
  { size = "lg", className, children, ...props }: ContainerProps,
  ref: ForwardedRef<HTMLDivElement>,
) {
  return (
    <div
      ref={ref}
      {...props}
      className={clsx(
        "gs-container mx-auto box-border w-full px-4",
        sizeClasses[size],
        className,
      )}
      data-size={size}
    >
      {children}
    </div>
  );
}

export const Container = forwardRef(ContainerImpl);
Container.displayName = "Container";
