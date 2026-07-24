import type { ForwardedRef } from "react";
import { forwardRef } from "react";
import { clsx } from "clsx";
import { iconClasses } from "./Icon.classes";
import type { IconProps } from "./Icon.types";

function IconImpl(
  { size = "md", label, className, children, ...props }: IconProps,
  ref: ForwardedRef<HTMLSpanElement>,
) {
  const decorative = label == null || label === "";
  return (
    <span
      ref={ref}
      className={clsx(iconClasses({ size }), className)}
      data-size={size}
      role={decorative ? undefined : "img"}
      aria-label={decorative ? undefined : label}
      aria-hidden={decorative ? true : undefined}
      {...props}
    >
      {children}
    </span>
  );
}

export const Icon = forwardRef(IconImpl);
Icon.displayName = "Icon";
