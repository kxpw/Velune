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

/** Classes for the floating options panel. */
export const comboboxPanelClasses = clsx(
  "gs-combobox-panel",
  listboxPanelClasses,
);

/** Classes for the listbox scroll region. */
export function comboboxListboxClasses({
  virtualized = false,
}: {
  virtualized?: boolean | undefined;
} = {}): string {
  return clsx(
    "gs-combobox-listbox max-h-gs-select-list-max-height overflow-x-hidden overflow-y-auto overscroll-contain p-gs-1",
    virtualized ? "block" : "grid",
  );
}

/** Classes for the virtualization loading fallback. */
export const comboboxVirtualFallbackClasses =
  "gs-combobox-virtual-fallback grid";

/** Classes for the virtualized list content wrapper. */
export const comboboxVirtualContentClasses =
  "gs-combobox-virtual-content relative w-full";

/** Classes for a virtualized option row wrapper. */
export const comboboxVirtualRowClasses =
  "gs-combobox-virtual-row absolute start-0 top-gs-0 w-full";

/** Classes for an option row. */
export const comboboxOptionClasses = clsx(
  "gs-combobox-option min-w-gs-0 w-full",
  listboxOptionClasses,
);

/** Classes for the option label. */
export const comboboxOptionLabelClasses =
  "gs-combobox-option-label min-w-gs-0 overflow-hidden text-ellipsis whitespace-nowrap";

/** Classes for the selected check mark. */
export const comboboxCheckClasses =
  "gs-combobox-check ms-auto inline-flex size-gs-4 shrink-0 items-center justify-center text-current";

/** Classes for listbox SVG icons inside Combobox. */
export const comboboxIconSvgClasses = "gs-combobox-icon";

/** Classes for the empty / no-matches row. */
export const comboboxEmptyClasses = clsx(
  "gs-combobox-empty",
  listboxEmptyClasses,
);

export type ComboboxClassesOptions = {
  size?: InputSize | undefined;
  fullWidth?: boolean | undefined;
  disabled?: boolean | undefined;
};

/** Style recipe for the Combobox root control wrapper. */
export function comboboxClasses({
  fullWidth = false,
  disabled = false,
}: ComboboxClassesOptions = {}): string {
  return clsx(
    "gs-combobox group/combobox relative inline-flex min-w-[calc(var(--space-20)*2.5)] max-w-full align-top text-gs-text",
    fullWidth && "flex w-full",
    disabled && "cursor-not-allowed opacity-gs-disabled",
  );
}

const comboboxControlTextSizeClasses = createRecipe({
  variants: {
    size: {
      sm: "text-gs-xs",
      md: "text-gs-sm",
      lg: "text-gs-md",
    },
  },
  defaultVariants: { size: "md" },
});

export type ComboboxControlClassesOptions = {
  size?: InputSize | undefined;
  invalid?: boolean | undefined;
  disabled?: boolean | undefined;
};

/** Style recipe for the bordered control shell. */
export function comboboxControlClasses({
  size = "md",
  invalid = false,
  disabled = false,
}: ComboboxControlClassesOptions = {}): string {
  return clsx(
    "gs-combobox-control",
    listboxControlClasses({
      size,
      invalid,
      disabled,
      groupName: "combobox",
      sizeClassName: comboboxControlTextSizeClasses({ size }),
    }),
  );
}

export type ComboboxInputClassesOptions = {
  disabled?: boolean | undefined;
};

/** Style recipe for the text input. */
export function comboboxInputClasses({
  disabled = false,
}: ComboboxInputClassesOptions = {}): string {
  return clsx(
    "gs-combobox-input m-gs-0 min-w-gs-0 flex-1 border-0 bg-transparent p-gs-0 font-inherit leading-[1.25] text-inherit caret-gs-border-focus outline-none placeholder:text-gs-text-secondary",
    disabled && "cursor-not-allowed",
  );
}

export type ComboboxIndicatorClassesOptions = {
  size?: InputSize | undefined;
  open?: boolean | undefined;
  disabled?: boolean | undefined;
};

/** Style recipe for the chevron indicator button. */
export function comboboxIndicatorClasses({
  size = "md",
  open = false,
  disabled = false,
}: ComboboxIndicatorClassesOptions = {}): string {
  return clsx(
    "gs-combobox-indicator",
    listboxIndicatorClasses({ size, open, disabled, interactive: true }),
  );
}

/** Extra classes for the field wrapper when `fullWidth` is set. */
export const comboboxFieldFullWidthClasses = "grid w-full";

/** Extra classes for disabled label / description text. */
export const comboboxDisabledTextClasses = "text-gs-text-disabled";
