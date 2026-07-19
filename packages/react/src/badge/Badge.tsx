import type { ForwardedRef } from "react";
import { forwardRef } from "react";
import { clsx } from "clsx";
import type { BadgeProps } from "./Badge.types";

const toneClasses = {
  default: "[--gs-badge-bg:var(--color-text-secondary)]",
  primary: "[--gs-badge-bg:var(--color-border-focus)]",
  success: "[--gs-badge-bg:var(--color-success)]",
  warning: "[--gs-badge-bg:var(--color-warning)]",
  error: "[--gs-badge-bg:var(--color-error)]",
  info: "[--gs-badge-bg:var(--color-info)]",
} as const;

const rootClasses =
  "gs-badge box-border inline-flex align-middle font-inherit leading-none";

const pillClasses =
  "gs-badge-pill inline-flex min-h-gs-badge-size min-w-gs-badge-size items-center justify-center whitespace-nowrap rounded-full border border-[color-mix(in_oklab,var(--gs-badge-bg)_24%,var(--color-border-default))] bg-gs-badge-subtle px-gs-badge-padding-x text-gs-badge-font-size font-gs-badge-font-weight leading-none text-gs-text";

function formatCount(count: number, max: number): string {
  if (count > max) {
    return `${max}+`;
  }
  return String(count);
}

function BadgeImpl(
  {
    count,
    max = 99,
    dot = false,
    tone = "error",
    showZero = false,
    className,
    children,
    ...props
  }: BadgeProps,
  ref: ForwardedRef<HTMLSpanElement>,
) {
  const attached = children != null && children !== false;
  const hasCount = typeof count === "number";

  const badgeVisible = dot
    ? true
    : hasCount
      ? count > 0 || showZero
      : !attached;

  const label = !dot && hasCount ? formatCount(count, max) : null;

  const pill = badgeVisible ? (
    <span
      className={clsx(
        pillClasses,
        dot &&
          "size-gs-badge-size-dot min-h-gs-badge-size-dot min-w-gs-badge-size-dot border-0 bg-gs-badge-bg p-0",
        attached &&
          "absolute right-0 top-0 z-gs-base translate-x-2/5 -translate-y-2/5 shadow-gs-surface-outline",
      )}
      data-tone={tone}
      data-dot={dot ? "true" : undefined}
      aria-hidden={dot ? true : undefined}
    >
      {label}
    </span>
  ) : null;

  if (!attached) {
    return (
      <span
        ref={ref}
        {...props}
        className={clsx(
          rootClasses,
          "gs-badge-standalone",
          toneClasses[tone],
          className,
        )}
        data-tone={tone}
      >
        {pill}
      </span>
    );
  }

  return (
    <span
      ref={ref}
      {...props}
      className={clsx(
        rootClasses,
        "gs-badge-attached relative",
        toneClasses[tone],
        className,
      )}
      data-tone={tone}
    >
      <span className="gs-badge-target inline-flex max-w-full">{children}</span>
      {pill}
    </span>
  );
}

export const Badge = forwardRef(BadgeImpl);
Badge.displayName = "Badge";
