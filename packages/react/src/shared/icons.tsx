import type { SVGAttributes } from "react";
import { clsx } from "clsx";

/** Shared 16×16 dismiss/close glyph used across overlays and feedback. */
export function CloseIcon({
  className,
  ...props
}: SVGAttributes<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
      focusable="false"
      className={clsx(className)}
      {...props}
    >
      <path
        d="M4 4L12 12M12 4L4 12"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

/** Shared calendar glyph for date field triggers. */
export function CalendarIcon({
  className,
  ...props
}: SVGAttributes<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      focusable="false"
      className={clsx(className)}
      {...props}
    >
      <rect
        x="3.5"
        y="5"
        width="17"
        height="15"
        rx="2"
        stroke="currentColor"
        strokeWidth="1.75"
      />
      <path
        d="M3.5 9.5H20.5M8 3.5V6.5M16 3.5V6.5"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
    </svg>
  );
}

/** Shared search magnifier used by Select search and similar fields. */
export function SearchIcon({
  className,
  ...props
}: SVGAttributes<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      focusable="false"
      className={clsx(className)}
      {...props}
    >
      <circle cx="11" cy="11" r="6.5" stroke="currentColor" strokeWidth="2" />
      <path
        d="M16 16L20.5 20.5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}
