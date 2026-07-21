import type { ForwardedRef } from "react";
import { forwardRef } from "react";
import { clsx } from "clsx";
import type { SpinnerProps } from "./Spinner.types";

const sizeClasses = {
  sm: "size-gs-spinner-size-sm",
  md: "size-gs-spinner-size-md",
  lg: "size-gs-spinner-size-lg",
} as const;

const toneClasses = {
  primary: "text-current",
  current: "text-current",
  muted: "text-gs-text-secondary",
  success: "text-gs-success",
  warning: "text-gs-warning",
  error: "text-gs-error",
  info: "text-gs-info",
} as const;

function SpinnerImpl(
  {
    size = "md",
    tone = "primary",
    label,
    "aria-label": ariaLabel,
    className,
    ...props
  }: SpinnerProps,
  ref: ForwardedRef<HTMLSpanElement>,
) {
  return (
    <span
      ref={ref}
      role="status"
      aria-live="polite"
      aria-label={ariaLabel ?? label ?? "Loading"}
      className={clsx(
        "gs-spinner inline-flex shrink-0 items-center justify-center align-middle leading-none",
        sizeClasses[size],
        toneClasses[tone],
        className,
      )}
      data-size={size}
      data-tone={tone}
      {...props}
    >
      <svg
        className="gs-spinner-svg block size-full origin-center animate-gs-spinner motion-reduce:animate-none [[data-reduced-motion=true]_&]:animate-none"
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden="true"
        focusable="false"
      >
        <circle
          className="gs-spinner-track opacity-28 motion-reduce:opacity-40 [[data-reduced-motion=true]_&]:opacity-40"
          cx="12"
          cy="12"
          r="9"
          stroke="currentColor"
          strokeWidth="2"
        />
        <path
          className="gs-spinner-arc opacity-100 motion-reduce:opacity-90 motion-reduce:[stroke-dasharray:12_40] [[data-reduced-motion=true]_&]:opacity-90 [[data-reduced-motion=true]_&]:[stroke-dasharray:12_40]"
          d="M21 12a9 9 0 0 0-9-9"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
    </span>
  );
}

export const Spinner = forwardRef(SpinnerImpl);
Spinner.displayName = "Spinner";
