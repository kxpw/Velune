import type { ForwardedRef } from "react";
import { forwardRef } from "react";
import { clsx } from "clsx";
import { kbdClasses } from "./Kbd.classes";
import type { KbdProps } from "./Kbd.types";

function KbdImpl(
  { size = "md", className, children, ...props }: KbdProps,
  ref: ForwardedRef<HTMLElement>,
) {
  return (
    <kbd
      ref={ref}
      className={clsx(kbdClasses({ size }), className)}
      data-size={size}
      {...props}
    >
      {children}
    </kbd>
  );
}

export const Kbd = forwardRef(KbdImpl);
Kbd.displayName = "Kbd";
