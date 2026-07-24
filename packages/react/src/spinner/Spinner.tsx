import type { ForwardedRef } from "react";
import { forwardRef } from "react";
import { clsx } from "clsx";
import type { SpinnerProps } from "./Spinner.types";
import {
  spinnerArcClasses,
  spinnerClasses,
  spinnerSvgClasses,
  spinnerTrackClasses,
} from "./Spinner.classes";

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
      className={clsx(spinnerClasses({ size, tone }), className)}
      data-size={size}
      data-tone={tone}
      {...props}
    >
      <svg
        className={spinnerSvgClasses}
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden="true"
        focusable="false"
      >
        <circle
          className={spinnerTrackClasses}
          cx="12"
          cy="12"
          r="9"
          stroke="currentColor"
          strokeWidth="2"
        />
        <path
          className={spinnerArcClasses}
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
