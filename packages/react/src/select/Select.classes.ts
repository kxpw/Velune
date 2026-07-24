import { clsx } from "clsx";
import { createRecipe } from "../shared/recipe";
import {
  listboxControlClasses,
  listboxEmptyClasses,
  listboxIndicatorClasses,
  listboxOptionClasses,
  listboxPanelClasses,
} from "../shared/listbox-classes";
import type { InputSize } from "../input";

/** Classes for the virtualization loading fallback. */
export const selectVirtualFallbackClasses = "gs-select-virtual-fallback grid";

/** Classes for the chevron SVG. */
export const selectIndicatorIconClasses = "gs-select-indicator-icon";

/** Classes for the check mark SVG (hidden until selected). */
export const selectCheckIconClasses = "gs-select-check-icon opacity-0";

/** Classes for the search leading SVG. */
export const selectSearchIconClasses = "gs-select-search-icon block size-gs-4";

/** Classes for an option row. */
export const selectOptionClasses = clsx(
  "gs-select-option min-w-gs-0 w-full",
  listboxOptionClasses,
);
/** Classes for the leading check mark in multiple mode. */
export const selectCheckLeadingClasses =
  "gs-select-check inline-flex size-gs-4 shrink-0 items-center justify-center text-current [.gs-select-option[data-selected=true]_&_.gs-select-check-icon]:opacity-100";

/** Classes for the trailing check mark in single mode. */
export const selectCheckTrailingClasses =
  "gs-select-check ms-auto inline-flex size-gs-4 shrink-0 items-center justify-center text-current [.gs-select-option[data-selected=true]_&_.gs-select-check-icon]:opacity-100";

/** Classes for the option label. */
export const selectOptionLabelClasses =
  "gs-select-option-label min-w-gs-0 overflow-hidden text-ellipsis whitespace-nowrap";

/** Classes for an option group. */
export const selectGroupClasses =
  "gs-select-group grid gap-gs-0 [&+.gs-select-group]:mt-gs-1 [&+.gs-select-group]:border-t [&+.gs-select-group]:border-[color-mix(in_oklab,var(--color-border-default)_55%,transparent)] [&+.gs-select-group]:pt-gs-1";

/** Classes for a group label. */
export const selectGroupLabelClasses =
  "gs-select-group-label min-w-gs-0 select-none overflow-hidden text-ellipsis whitespace-nowrap px-gs-3 pb-gs-1 pt-gs-2 text-gs-xs font-gs-medium leading-[1.2] tracking-gs-normal text-gs-text-secondary uppercase";

/** Classes for the empty / no-matches row. */
export const selectEmptyClasses = clsx("gs-select-empty", listboxEmptyClasses);

/** Classes for the floating panel. */
export const selectPanelClasses = clsx("gs-select-panel", listboxPanelClasses);

/** Classes for the search bar container. */
export const selectSearchBarClasses =
  "gs-select-search-bar flex items-center gap-gs-2 border-b border-[color-mix(in_oklab,var(--color-border-default)_70%,transparent)] bg-gs-surface-raised px-gs-3 py-gs-2";

/** Classes for the search leading icon wrapper. */
export const selectSearchLeadingClasses =
  "gs-select-search-leading inline-flex shrink-0 text-gs-text-secondary";

/** Classes for the search input. */
export const selectSearchClasses =
  "gs-select-search m-gs-0 min-w-gs-0 flex-1 border-0 bg-transparent p-gs-0 font-inherit text-gs-sm leading-[1.25] text-gs-text outline-none placeholder:text-gs-text-secondary [&[type=search]::-webkit-search-decoration]:hidden [&[type=search]::-webkit-search-decoration]:appearance-none [&[type=search]::-webkit-search-cancel-button]:hidden [&[type=search]::-webkit-search-cancel-button]:appearance-none";

export type SelectListboxClassesOptions = {
  virtualized?: boolean | undefined;
};

/** Style recipe for the listbox scroll region. */
export function selectListboxClasses({
  virtualized = false,
}: SelectListboxClassesOptions = {}): string {
  return clsx(
    "gs-select-listbox max-h-gs-select-list-max-height overflow-x-hidden overflow-y-auto overscroll-contain p-gs-1",
    virtualized ? "block" : "grid",
  );
}

const selectSizeClasses = createRecipe({
  variants: {
    size: {
      sm: "text-gs-xs",
      md: "text-gs-sm",
      lg: "text-gs-md",
    },
  },
  defaultVariants: { size: "md" },
});

export type SelectClassesOptions = {
  size?: InputSize | undefined;
  fullWidth?: boolean | undefined;
  disabled?: boolean | undefined;
};

/** Style recipe for the Select root control wrapper. */
export function selectClasses({
  size = "md",
  fullWidth = false,
  disabled = false,
}: SelectClassesOptions = {}): string {
  return clsx(
    "gs-select group/select relative inline-flex min-w-[calc(var(--space-20)*2.5)] max-w-full align-top text-gs-text",
    selectSizeClasses({ size }),
    fullWidth && "flex w-full",
    disabled && "cursor-not-allowed opacity-gs-disabled",
  );
}

export type SelectControlClassesOptions = {
  size?: InputSize | undefined;
  invalid?: boolean | undefined;
  disabled?: boolean | undefined;
  open?: boolean | undefined;
};

/** Style recipe for the bordered control shell. */
export function selectControlClasses({
  size = "md",
  invalid = false,
  disabled = false,
  open = false,
}: SelectControlClassesOptions = {}): string {
  return clsx(
    "gs-select-control",
    listboxControlClasses({
      size,
      invalid,
      disabled,
      open,
      groupName: "select",
    }),
  );
}

/** Classes for the visually hidden native select. */
export const selectNativeClasses =
  "gs-select-native absolute -m-gs-input-border-width size-gs-input-border-width overflow-hidden whitespace-nowrap border-0 p-gs-0 [clip:rect(0,0,0,0)] [clip-path:inset(50%)]";

export type SelectTriggerClassesOptions = {
  disabled?: boolean | undefined;
};

/** Style recipe for the trigger button. */
export function selectTriggerClasses({
  disabled = false,
}: SelectTriggerClassesOptions = {}): string {
  return clsx(
    "gs-select-trigger m-gs-0 inline-flex min-h-full min-w-gs-0 flex-1 cursor-pointer items-center border-0 bg-transparent p-gs-0 text-start font-inherit leading-[1.25] text-inherit outline-none",
    disabled && "cursor-not-allowed",
  );
}

/** Classes for the displayed value text. */
export const selectValueClasses =
  "gs-select-value block overflow-hidden text-ellipsis whitespace-nowrap data-[placeholder=true]:text-gs-text-secondary";

export type SelectIndicatorClassesOptions = {
  size?: InputSize | undefined;
  open?: boolean | undefined;
};

/** Style recipe for the chevron indicator. */
export function selectIndicatorClasses({
  size = "md",
  open = false,
}: SelectIndicatorClassesOptions = {}): string {
  return clsx(
    "gs-select-indicator",
    listboxIndicatorClasses({ size, open, interactive: false }),
  );
}

/** Extra classes for the field wrapper when `fullWidth` is set. */
export const selectFieldFullWidthClasses = "grid w-full";

/** Extra classes for the label cursor. */
export const selectLabelCursorClasses = "cursor-default";

/** Extra classes for disabled label / description text. */
export const selectDisabledTextClasses = "text-gs-text-disabled";

/** Classes for the virtualized list content wrapper. */
export const selectVirtualContentClasses =
  "gs-select-virtual-content relative w-full";

/** Classes for a virtualized option row wrapper. */
export const selectVirtualRowClasses =
  "gs-select-virtual-row absolute start-0 top-gs-0 w-full";
