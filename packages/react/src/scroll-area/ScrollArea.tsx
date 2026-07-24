import type { CSSProperties, ForwardedRef } from "react";
import { forwardRef } from "react";
import { clsx } from "clsx";
import { scrollAreaClasses } from "./ScrollArea.classes";
import type { ScrollAreaProps } from "./ScrollArea.types";

function ScrollAreaImpl(
  {
    orientation = "vertical",
    maxHeight,
    className,
    style,
    children,
    tabIndex,
    ...props
  }: ScrollAreaProps,
  ref: ForwardedRef<HTMLDivElement>,
) {
  const resolvedStyle: CSSProperties | undefined =
    maxHeight == null
      ? style
      : {
          ...style,
          maxHeight:
            typeof maxHeight === "number" ? `${maxHeight}px` : maxHeight,
        };

  return (
    <div
      ref={ref}
      className={clsx(scrollAreaClasses({ orientation }), className)}
      data-orientation={orientation}
      style={resolvedStyle}
      tabIndex={tabIndex ?? 0}
      {...props}
    >
      {children}
    </div>
  );
}

export const ScrollArea = forwardRef(ScrollAreaImpl);
ScrollArea.displayName = "ScrollArea";
