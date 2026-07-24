import type { SVGAttributes } from "react";
import { clsx } from "clsx";

const iconBaseProps = {
  fill: "none",
  "aria-hidden": true,
  focusable: false,
} as const;

/** Shared chevron used by Select, Combobox, and similar triggers. */
export function ListboxChevronIcon({
  className,
  ...props
}: SVGAttributes<SVGSVGElement>) {
  return (
    <svg
      {...iconBaseProps}
      {...props}
      className={clsx("block size-full", className)}
      viewBox="0 0 24 24"
    >
      <path
        d="M6 9L12 15L18 9"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** Shared selection check used by Select and Combobox options. */
export function ListboxCheckIcon({
  className,
  ...props
}: SVGAttributes<SVGSVGElement>) {
  return (
    <svg
      {...iconBaseProps}
      {...props}
      className={clsx("block size-full", className)}
      viewBox="0 0 16 16"
    >
      <path
        d="M3.25 8.25L6.5 11.4L12.75 4.6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
