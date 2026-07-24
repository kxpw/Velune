import { clsx } from "clsx";
import type { CheckboxSize } from "./Checkbox.types";

export const checkboxSizeClasses: Record<CheckboxSize, string> = {
  sm: "gap-gs-1 text-gs-xs",
  md: "gap-gs-2 text-gs-sm",
  lg: "gap-gs-2 text-gs-md",
};

export const checkboxBoxSizeClasses: Record<CheckboxSize, string> = {
  sm: "[--gs-checkbox-box:var(--checkbox-size-sm)]",
  md: "[--gs-checkbox-box:var(--space-4)]",
  lg: "[--gs-checkbox-box:var(--checkbox-size-lg)]",
};

/** Shared classes for the check / dash SVG marks. */
export const checkboxMarkClasses =
  "gs-on-primary pointer-events-none block size-gs-on-primary-size scale-65 text-current opacity-0 transition-[opacity,transform] duration-200 ease-gs-standard motion-reduce:transition-none [[data-reduced-motion=true]_&]:transition-none";

export type CheckboxClassesOptions = {
  /** Default: `"md"`. */
  size?: CheckboxSize | undefined;
  disabled?: boolean | undefined;
};

/** Style recipe for the Checkbox root label. */
export function checkboxClasses({
  size = "md",
  disabled = false,
}: CheckboxClassesOptions = {}): string {
  return clsx(
    "gs-checkbox group/checkbox relative -mx-gs-1 -my-gs-1 inline-flex min-h-gs-11 min-w-gs-11 max-w-full touch-manipulation select-none items-start box-border rounded-gs-xs px-gs-1 py-gs-1 font-inherit font-gs-regular leading-gs-normal text-gs-text [-webkit-tap-highlight-color:transparent]",
    checkboxSizeClasses[size],
    disabled ? "cursor-not-allowed opacity-gs-disabled" : "cursor-pointer",
  );
}

/** Classes for the visually hidden native checkbox input. */
export const checkboxInputClasses =
  "gs-checkbox-input peer pointer-events-none absolute m-gs-0 size-gs-0 opacity-0";

export type CheckboxControlClassesOptions = {
  /** Default: `"md"`. */
  size?: CheckboxSize | undefined;
  indeterminate?: boolean | undefined;
  invalid?: boolean | undefined;
  disabled?: boolean | undefined;
};

/** Style recipe for the drawn checkbox control. */
export function checkboxControlClasses({
  size = "md",
  indeterminate = false,
  invalid = false,
  disabled = false,
}: CheckboxControlClassesOptions = {}): string {
  return clsx(
    "gs-checkbox-control relative mt-[calc((1lh-var(--gs-checkbox-box))/2)] inline-grid size-gs-checkbox-box shrink-0 place-items-center self-start box-border rounded-gs-xs border border-gs-border-strong bg-gs-surface text-gs-on-primary transition-[background-color,border-color,box-shadow] duration-200 ease-gs-standard peer-checked:[&_.gs-on-primary-check]:scale-100 peer-checked:[&_.gs-on-primary-check]:opacity-100 peer-focus-visible:outline-2 peer-focus-visible:outline-gs-focus-ring peer-focus-visible:outline-offset-4 motion-reduce:transition-none [[data-reduced-motion=true]_&]:transition-none [[data-high-contrast=true]_&]:border-gs-border-strong [[data-high-contrast=true]_&]:border",
    checkboxBoxSizeClasses[size],
    indeterminate &&
      "[&_.gs-on-primary-check]:scale-65 [&_.gs-on-primary-check]:opacity-0 [&_.gs-on-primary-dash]:scale-100 [&_.gs-on-primary-dash]:opacity-100",
    invalid
      ? "bg-gs-surface-invalid peer-checked:border-transparent peer-checked:bg-gs-error peer-data-[indeterminate=true]:border-transparent peer-data-[indeterminate=true]:bg-gs-error peer-focus-visible:bg-gs-error-strong peer-focus-visible:outline-gs-focus-ring-invalid peer-checked:peer-focus-visible:bg-gs-error peer-data-[indeterminate=true]:peer-focus-visible:bg-gs-error [[data-high-contrast=true]_&]:peer-checked:border-gs-error [[data-high-contrast=true]_&]:peer-data-[indeterminate=true]:border-gs-error"
      : "peer-checked:border-transparent peer-checked:bg-gs-primary peer-data-[indeterminate=true]:border-transparent peer-data-[indeterminate=true]:bg-gs-primary peer-focus-visible:bg-gs-action-hover peer-checked:peer-focus-visible:bg-gs-primary-hover peer-data-[indeterminate=true]:peer-focus-visible:bg-gs-primary-hover [[data-high-contrast=true]_&]:peer-checked:border-gs-primary [[data-high-contrast=true]_&]:peer-data-[indeterminate=true]:border-gs-primary",
    !disabled &&
      (invalid
        ? ""
        : "group-hover/checkbox:peer-not-checked:peer-not-data-[indeterminate=true]:bg-gs-action-hover group-active/checkbox:peer-not-checked:peer-not-data-[indeterminate=true]:bg-gs-action-active group-hover/checkbox:peer-checked:bg-gs-primary-hover group-hover/checkbox:peer-data-[indeterminate=true]:bg-gs-primary-hover group-active/checkbox:peer-checked:bg-gs-primary-active group-active/checkbox:peer-data-[indeterminate=true]:bg-gs-primary-active"),
  );
}

/** Classes for the label/description copy column. */
export const checkboxCopyClasses =
  "gs-checkbox-copy grid min-w-gs-0 gap-gs-1 text-size-inherit leading-inherit";

/** Style recipe for the checkbox label text. */
export function checkboxLabelClasses(disabled: boolean): string {
  return clsx(
    "gs-checkbox-label block min-w-gs-0 text-size-inherit font-gs-regular leading-inherit text-gs-text",
    disabled && "text-gs-text-disabled",
  );
}

/** Classes for the required asterisk. */
export const checkboxRequiredClasses =
  "gs-checkbox-required ms-gs-1 text-gs-error";

/** Style recipe for the checkbox description text. */
export function checkboxDescriptionClasses(disabled: boolean): string {
  return clsx(
    "gs-checkbox-description text-gs-xs leading-gs-normal text-gs-text-secondary",
    disabled && "text-gs-text-disabled",
  );
}

/** Classes for the Checkbox.Group options container. */
export const checkboxGroupClasses =
  "gs-checkbox-group flex flex-wrap gap-gs-1 data-[orientation=vertical]:flex-col data-[orientation=vertical]:flex-nowrap data-[orientation=vertical]:items-start data-[orientation=horizontal]:flex-row data-[orientation=horizontal]:items-center data-[orientation=horizontal]:gap-x-gs-3 data-[orientation=horizontal]:gap-y-gs-1";

/** Classes for the group field wrapper (label + options + messages). */
export const checkboxGroupFieldClasses =
  "gs-checkbox-group-field grid max-w-full gap-gs-2";

/** Classes for the group label. */
export const checkboxGroupLabelClasses =
  "gs-checkbox-group-label m-gs-0 inline-flex items-baseline gap-gs-1 text-gs-sm font-gs-medium leading-gs-normal text-gs-text";

/** Classes for the group error message. */
export const checkboxGroupErrorClasses =
  "gs-checkbox-group-error m-gs-0 text-gs-xs leading-gs-normal text-gs-error";

/** Classes for the group description. */
export const checkboxGroupDescriptionClasses =
  "gs-checkbox-group-description m-gs-0 text-gs-xs leading-gs-normal text-gs-text-secondary";
