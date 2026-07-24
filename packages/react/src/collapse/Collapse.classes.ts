import { clsx } from "clsx";
import type { CollapseOrientation, CollapseVariant } from "./Collapse.types";

/** Style recipe for the trigger chevron icon. */
export function collapseIconClasses(open: boolean): string {
  return clsx(
    "gs-collapse-icon size-gs-4 shrink-0 text-gs-text-secondary transition-transform duration-200 ease-gs-standard motion-reduce:transition-none [[data-reduced-motion=true]_&]:transition-none",
    open && "rotate-180",
  );
}

/** Style recipe for the Collapse root element. */
export function collapseClasses(orientation: CollapseOrientation): string {
  return clsx(
    "gs-collapse flex min-w-gs-0 flex-col gap-gs-2 font-inherit text-gs-text",
    orientation === "horizontal" && "flex-row flex-wrap items-start",
  );
}

export type CollapseItemClassesOptions = {
  variant?: CollapseVariant;
  orientation?: CollapseOrientation;
  disabled?: boolean;
};

/** Style recipe for a Collapse.Item container. */
export function collapseItemClasses({
  variant = "filled",
  orientation = "vertical",
  disabled = false,
}: CollapseItemClassesOptions = {}): string {
  return clsx(
    "gs-collapse-item overflow-hidden rounded-gs-sm border border-gs-border-default bg-gs-surface",
    variant === "plain" && "border-0 bg-transparent",
    orientation === "horizontal" && "min-w-[min(100%,12rem)] flex-[1_1_12rem]",
    disabled && "opacity-gs-disabled",
  );
}

/** Style recipe for a Collapse.Trigger button. */
export function collapseTriggerClasses(variant: CollapseVariant): string {
  return clsx(
    "gs-collapse-trigger m-gs-0 flex min-h-gs-11 w-full cursor-pointer appearance-none items-center gap-gs-3 border-0 bg-transparent px-gs-3 py-gs-3 text-start font-inherit text-gs-sm font-gs-medium leading-gs-normal text-gs-text hover:not-disabled:bg-gs-action-hover focus-visible:bg-gs-action-hover focus-visible:outline-none focus-visible:shadow-gs-button-focus-inset disabled:cursor-not-allowed",
    variant === "plain" &&
      "hover:not-disabled:bg-gs-action-hover focus-visible:bg-gs-action-hover",
  );
}

/** Classes for the trigger label. */
export const collapseTriggerLabelClasses =
  "gs-collapse-trigger-label min-w-gs-0 flex-auto";

/** Style recipe for the animated content grid. */
export function collapseContentClasses(open: boolean): string {
  return clsx(
    "gs-collapse-content grid transition-[grid-template-rows] duration-gs-normal ease-gs-standard motion-reduce:transition-none [[data-reduced-motion=true]_&]:transition-none",
    open ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
  );
}

/** Style recipe for the inner content wrapper. */
export function collapseContentInnerClasses(open: boolean): string {
  return clsx(
    "gs-collapse-content-inner min-h-gs-0 overflow-hidden px-gs-3 text-gs-sm leading-gs-body text-gs-text-secondary",
    open && "pb-gs-3",
  );
}
