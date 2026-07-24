import { clsx } from "clsx";
import type {
  DividerAlign,
  DividerOrientation,
  DividerTone,
} from "./Divider.types";

export const toneClasses: Record<DividerTone, string> = {
  default: "[--gs-divider-color:var(--color-border-default)]",
  muted:
    "[--gs-divider-color:color-mix(in_oklab,var(--color-border-default)_75%,transparent)]",
  subtle:
    "[--gs-divider-color:color-mix(in_oklab,var(--color-border-default)_50%,transparent)]",
};

export type DividerClassesOptions = {
  /** Default: `"horizontal"`. */
  orientation?: DividerOrientation;
  /** Default: `"center"`. */
  align?: DividerAlign;
  /** Default: `"default"`. */
  tone?: DividerTone;
  dashed?: boolean;
  /** Whether the divider renders label content between its rules. */
  hasContent?: boolean;
};

/** Style recipe for the Divider component. */
export function dividerClasses({
  orientation = "horizontal",
  align = "center",
  tone = "default",
  dashed = false,
  hasContent = false,
}: DividerClassesOptions = {}): string {
  return clsx(
    "gs-divider m-gs-0 flex self-stretch items-center text-gs-xs font-gs-medium leading-gs-none text-gs-text-secondary before:min-w-gs-3 before:flex-auto before:border-0 before:border-gs-divider before:content-[''] after:min-w-gs-3 after:flex-auto after:border-0 after:border-gs-divider after:content-['']",
    toneClasses[tone],
    orientation === "horizontal" &&
      "my-gs-1 w-full before:[border-block-start-width:var(--control-border-width)] before:[border-block-start-style:solid] after:[border-block-start-width:var(--control-border-width)] after:[border-block-start-style:solid]",
    orientation === "horizontal" &&
      dashed &&
      "before:[border-block-start-style:dashed] after:[border-block-start-style:dashed]",
    orientation === "horizontal" &&
      !hasContent &&
      "before:min-w-full after:hidden",
    orientation === "vertical" &&
      "mx-gs-1 inline-flex min-h-gs-6 w-auto flex-col self-stretch [border-inline-start:var(--control-border-width)_solid_var(--gs-divider-color)] before:hidden after:hidden",
    orientation === "vertical" &&
      dashed &&
      "[border-inline-start-style:dashed]",
    hasContent && align === "start" && "before:grow-0 before:basis-4",
    hasContent && align === "end" && "after:grow-0 after:basis-4",
  );
}

/** Classes for the inline label rendered between the divider rules. */
export const dividerContentClasses =
  "gs-divider-content shrink-0 whitespace-nowrap px-gs-3 text-inherit";
