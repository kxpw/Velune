import type { CSSProperties, ForwardedRef } from "react";
import { forwardRef } from "react";
import { clsx } from "clsx";
import { aspectRatioClasses } from "./AspectRatio.classes";
import type { AspectRatioProps, AspectRatioValue } from "./AspectRatio.types";

function resolveRatio(ratio: AspectRatioValue | undefined): string {
  if (ratio == null) {
    return "16 / 9";
  }
  if (typeof ratio === "number") {
    return String(ratio);
  }
  return ratio.includes("/") ? ratio.replace("/", " / ") : ratio;
}

function AspectRatioImpl(
  { ratio = "16/9", className, style, children, ...props }: AspectRatioProps,
  ref: ForwardedRef<HTMLDivElement>,
) {
  return (
    <div
      ref={ref}
      className={clsx(aspectRatioClasses(), className)}
      style={
        {
          ...style,
          aspectRatio: resolveRatio(ratio),
        } as CSSProperties
      }
      data-ratio={typeof ratio === "number" ? String(ratio) : ratio}
      {...props}
    >
      {children}
    </div>
  );
}

export const AspectRatio = forwardRef(AspectRatioImpl);
AspectRatio.displayName = "AspectRatio";
