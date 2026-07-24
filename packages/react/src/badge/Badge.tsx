import type { ForwardedRef } from "react";
import { forwardRef } from "react";
import { clsx } from "clsx";
import type { BadgeProps } from "./Badge.types";
import {
  badgePillClasses,
  badgeRootClasses,
  badgeTargetClasses,
} from "./Badge.classes";

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
      className={badgePillClasses({ dot, attached })}
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
        className={clsx(badgeRootClasses({ attached: false, tone }), className)}
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
      className={clsx(badgeRootClasses({ attached: true, tone }), className)}
      data-tone={tone}
    >
      <span className={badgeTargetClasses}>{children}</span>
      {pill}
    </span>
  );
}

export const Badge = forwardRef(BadgeImpl);
Badge.displayName = "Badge";
