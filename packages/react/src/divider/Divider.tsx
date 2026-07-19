import type { ForwardedRef } from "react";
import { forwardRef } from "react";
import { clsx } from "clsx";
import type { DividerProps } from "./Divider.types";

const toneClasses = {
  default: "[--gs-divider-color:var(--color-border-default)]",
  muted:
    "[--gs-divider-color:color-mix(in_oklab,var(--color-border-default)_75%,transparent)]",
  subtle:
    "[--gs-divider-color:color-mix(in_oklab,var(--color-border-default)_50%,transparent)]",
} as const;

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
        "gs-divider m-0 flex self-stretch items-center text-xs font-medium leading-none text-gs-text-secondary before:min-w-3 before:flex-auto before:border-0 before:border-gs-divider-color before:content-[''] after:min-w-3 after:flex-auto after:border-0 after:border-gs-divider-color after:content-['']",
        toneClasses[tone],
        orientation === "horizontal" &&
          "my-1 w-full before:[border-block-start-width:var(--divider-border-width)] before:[border-block-start-style:solid] after:[border-block-start-width:var(--divider-border-width)] after:[border-block-start-style:solid]",
        orientation === "horizontal" &&
          dashed &&
          "before:[border-block-start-style:dashed] after:[border-block-start-style:dashed]",
        orientation === "horizontal" &&
          !hasContent &&
          "before:min-w-full after:hidden",
        orientation === "vertical" &&
          "mx-1 inline-flex min-h-6 w-auto flex-col self-stretch [border-inline-start:var(--divider-border-width)_solid_var(--gs-divider-color)] before:hidden after:hidden",
        orientation === "vertical" &&
          dashed &&
          "[border-inline-start-style:dashed]",
        hasContent && align === "start" && "before:grow-0 before:basis-4",
        hasContent && align === "end" && "after:grow-0 after:basis-4",
        className,
      )}
      data-orientation={orientation}
      data-align={hasContent ? align : undefined}
      data-tone={tone === "default" ? undefined : tone}
      data-dashed={dashed ? "true" : undefined}
      data-with-content={hasContent ? "true" : undefined}
    >
      {hasContent ? (
        <span className="gs-divider-content shrink-0 whitespace-nowrap px-3 text-inherit">
          {children}
        </span>
      ) : null}
    </div>
  );
}

export const Divider = forwardRef(DividerImpl);
Divider.displayName = "Divider";
