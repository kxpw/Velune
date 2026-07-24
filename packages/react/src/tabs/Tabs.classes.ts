import { clsx } from "clsx";
import type { TabsOrientation, TabsVariant } from "./Tabs.types";

/** Style recipe for the Tabs root element. */
export function tabsClasses(orientation: TabsOrientation): string {
  return clsx(
    "gs-tabs flex min-w-gs-0 flex-col gap-gs-1 font-inherit text-gs-text",
    orientation === "vertical" && "flex-row items-start",
  );
}

export type TabsListClassesOptions = {
  variant?: TabsVariant;
  fullWidth?: boolean;
  orientation?: TabsOrientation;
};

/** Style recipe for the Tabs.List container. */
export function tabsListClasses({
  variant = "underline",
  fullWidth = false,
  orientation = "horizontal",
}: TabsListClassesOptions = {}): string {
  return clsx(
    "gs-tabs-list inline-flex w-max max-w-full shrink-0 self-start items-center overflow-x-auto overflow-y-hidden overscroll-x-contain [scrollbar-width:thin]",
    variant === "block"
      ? "gap-gs-1 rounded-gs-sm bg-gs-surface-mist p-gs-1"
      : "gap-gs-2 rounded-gs-none bg-transparent p-gs-0",
    fullWidth && "w-full self-stretch items-stretch",
    orientation === "vertical" && "flex-col items-stretch",
  );
}

export type TabsTriggerClassesOptions = {
  variant?: TabsVariant | undefined;
  selected?: boolean | undefined;
  disabled?: boolean | undefined;
};

/** Style recipe for a Tabs.Trigger button. */
export function tabsTriggerClasses({
  variant = "underline",
  selected = false,
  disabled = false,
}: TabsTriggerClassesOptions = {}): string {
  return clsx(
    "gs-tabs-trigger m-gs-0 inline-flex min-h-gs-11 min-w-gs-11 cursor-pointer appearance-none items-center justify-center whitespace-nowrap border-0 px-gs-3 py-gs-2 font-inherit text-gs-sm font-gs-regular leading-gs-none text-gs-text-secondary transition-[background-color,color] duration-200 ease-gs-standard focus-visible:bg-gs-action-hover focus-visible:outline-none focus-visible:shadow-gs-button-focus-border disabled:cursor-not-allowed disabled:opacity-gs-disabled [[data-full-width=true]_&]:flex-[1_0_auto] motion-reduce:transition-none [[data-reduced-motion=true]_&]:transition-none",
    variant === "block"
      ? clsx(
          "rounded-gs-xs",
          selected
            ? "bg-gs-surface text-gs-text shadow-gs-1"
            : "bg-transparent",
          !selected &&
            !disabled &&
            "hover:bg-gs-action-hover hover:text-gs-text",
        )
      : clsx(
          "rounded-gs-sm bg-transparent",
          selected ? "text-gs-text" : !disabled && "hover:text-gs-text",
        ),
  );
}

export type TabsTriggerLabelClassesOptions = {
  variant?: TabsVariant | undefined;
  selected?: boolean | undefined;
};

/** Style recipe for the trigger label with the underline indicator. */
export function tabsTriggerLabelClasses({
  variant = "underline",
  selected = false,
}: TabsTriggerLabelClassesOptions = {}): string {
  return clsx(
    "gs-tabs-trigger-label relative inline-flex min-w-gs-0 items-center gap-gs-2 after:absolute after:inset-x-0 after:bottom-[calc(var(--space-2)*-1)] after:h-gs-0.5 after:rounded-gs-full after:bg-gs-primary after:opacity-0 after:scale-x-0 after:transition-[opacity,transform] after:duration-200 after:ease-gs-standard motion-reduce:after:transition-none [[data-reduced-motion=true]_&]:after:transition-none",
    variant === "underline" && "after:content-['']",
    variant === "underline" &&
      selected &&
      "after:scale-x-100 after:opacity-100",
  );
}

/** Style recipe for a Tabs.Panel element. */
export function tabsPanelClasses(orientation: TabsOrientation): string {
  return clsx(
    "gs-tabs-panel min-w-gs-0 py-gs-4 text-gs-sm leading-gs-body text-gs-text outline-none",
    orientation === "vertical" && "flex-auto py-gs-0 ps-gs-4",
  );
}
