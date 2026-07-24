import type { ForwardedRef } from "react";
import { forwardRef } from "react";
import { clsx } from "clsx";
import type { DividerProps } from "./Divider.types";
import { dividerClasses, dividerContentClasses } from "./Divider.classes";

function DividerImpl(
  {
    orientation = "horizontal",
    align = "center",
    tone = "default",
    dashed = false,
    className,
    children,
    ...props
  }: DividerProps,
  ref: ForwardedRef<HTMLDivElement>,
) {
  const hasContent = children != null && children !== false;

  return (
    <div
      ref={ref}
      {...props}
      role="separator"
      aria-orientation={orientation}
      className={clsx(
        dividerClasses({ orientation, align, tone, dashed, hasContent }),
        className,
      )}
      data-orientation={orientation}
      data-align={hasContent ? align : undefined}
      data-tone={tone === "default" ? undefined : tone}
      data-dashed={dashed ? "true" : undefined}
      data-with-content={hasContent ? "true" : undefined}
    >
      {hasContent ? (
        <span className={dividerContentClasses}>{children}</span>
      ) : null}
    </div>
  );
}

export const Divider = forwardRef(DividerImpl);
Divider.displayName = "Divider";
