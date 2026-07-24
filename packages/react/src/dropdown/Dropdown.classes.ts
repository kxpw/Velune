import { clsx } from "clsx";
import { createRecipe } from "../shared/recipe";

export type DropdownClassesOptions = {
  fullWidth?: boolean | undefined;
};

/** Style recipe for the Dropdown popover shell. */
export function dropdownClasses({
  fullWidth = false,
}: DropdownClassesOptions = {}): string {
  return clsx(
    "gs-dropdown max-w-[calc(100vw-var(--space-4))] p-gs-1!",
    !fullWidth && "min-w-52",
  );
}

export type DropdownTriggerClassesOptions = {
  fullWidth?: boolean | undefined;
  disabled?: boolean | undefined;
};

/** Style recipe for the Dropdown trigger wrapper. */
export function dropdownTriggerClasses({
  fullWidth = false,
  disabled = false,
}: DropdownTriggerClassesOptions = {}): string {
  return clsx(
    fullWidth ? "w-full [&>*]:w-full" : "w-fit",
    disabled && "[&>*]:cursor-not-allowed [&>*]:opacity-gs-disabled",
  );
}

/** Classes for the Dropdown.Menu container. */
export const dropdownMenuClasses =
  "gs-dropdown-menu grid max-h-[min(24rem,calc(100vh-var(--space-8)))] min-w-gs-0 gap-gs-0.5 overflow-y-auto outline-none";

/** Style recipe for a Dropdown.Item row. */
export const dropdownItemClasses = createRecipe({
  base: "gs-dropdown-item relative m-gs-0 grid min-h-gs-11 items-center gap-x-gs-3 rounded-gs-xs px-gs-3 py-gs-2 text-start text-gs-sm leading-gs-normal no-underline outline-none transition-colors duration-150 ease-gs-standard motion-reduce:transition-none",
  variants: {
    hasLeading: {
      true: "grid-cols-[1rem_minmax(0,1fr)_auto]",
      false: "grid-cols-[minmax(0,1fr)_auto]",
    },
    tone: {
      default:
        "text-gs-text focus:bg-gs-action-hover data-[selected=true]:not-focus:bg-gs-action-active",
      danger:
        "text-gs-error focus:bg-gs-error-subtle data-[selected=true]:bg-gs-error-subtle",
    },
    disabled: {
      true: "cursor-not-allowed text-gs-text-disabled opacity-gs-disabled",
      false: "cursor-pointer",
    },
  },
});

export type DropdownItemLeadingClassesOptions = {
  tone?: "default" | "danger" | undefined;
};

/** Style recipe for the item leading slot. */
export function dropdownItemLeadingClasses({
  tone = "default",
}: DropdownItemLeadingClassesOptions = {}): string {
  return clsx(
    "gs-dropdown-item-leading inline-flex size-gs-4 shrink-0 items-center justify-center text-gs-text-secondary [&>*]:block [&>*]:size-full",
    tone === "danger" && "text-current",
  );
}

/** Classes for the item content column. */
export const dropdownItemContentClasses = "gs-dropdown-item-content min-w-gs-0";

/** Classes for the item label. */
export const dropdownItemLabelClasses =
  "gs-dropdown-item-label block overflow-hidden text-ellipsis whitespace-nowrap font-gs-medium";

/** Classes for the item description. */
export const dropdownItemDescriptionClasses =
  "gs-dropdown-item-description mt-gs-0.5 block text-gs-xs font-gs-regular leading-gs-normal text-gs-text-secondary";

/** Classes for the trailing/indicator end column. */
export const dropdownItemEndClasses =
  "gs-dropdown-item-end inline-flex items-center justify-end gap-gs-2 text-gs-xs text-gs-text-secondary";

/** Classes for the item trailing slot. */
export const dropdownItemTrailingClasses =
  "gs-dropdown-item-trailing inline-flex items-center justify-end whitespace-nowrap";

/** Classes for the selected-state check indicator. */
export const dropdownItemIndicatorClasses =
  "gs-dropdown-item-indicator inline-flex size-gs-4 shrink-0 items-center justify-center text-gs-border-focus [&_svg]:size-full";

/** Classes for a Dropdown.Section group. */
export const dropdownSectionClasses = "gs-dropdown-section grid gap-gs-0.5";

/** Classes for a Dropdown.SectionTitle. */
export const dropdownSectionTitleClasses =
  "gs-dropdown-section-title px-gs-3 pb-gs-1 pt-gs-2 text-gs-xs font-gs-medium text-gs-text-secondary";

/** Classes for a Dropdown.Separator. */
export const dropdownSeparatorClasses =
  "gs-dropdown-separator mx-gs-2 my-gs-1 h-px border-0 bg-gs-border-default";
