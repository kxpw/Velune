import { clsx } from "clsx";
import type { RadioSize } from "./Radio.types";

export const radioSizeClasses: Record<RadioSize, string> = {
  sm: "gap-gs-1 text-gs-xs",
  md: "gap-gs-2 text-gs-sm",
  lg: "gap-gs-2 text-gs-md",
};

export const radioBoxSizeClasses: Record<RadioSize, string> = {
  sm: "[--gs-radio-box:var(--checkbox-size-sm)]",
  md: "[--gs-radio-box:var(--space-4)]",
  lg: "[--gs-radio-box:var(--checkbox-size-lg)]",
};

export type RadioClassesOptions = {
  /** Default: `"md"`. */
  size?: RadioSize | undefined;
  disabled?: boolean | undefined;
};

/** Style recipe for the Radio root label. */
export function radioClasses({
  size = "md",
  disabled = false,
}: RadioClassesOptions = {}): string {
  return clsx(
    "gs-radio group/radio relative -mx-gs-1 -my-gs-1 inline-flex min-h-gs-11 min-w-gs-11 max-w-full touch-manipulation select-none items-start box-border rounded-gs-sm px-gs-1 py-gs-1 font-inherit font-gs-regular leading-gs-normal text-gs-text [-webkit-tap-highlight-color:transparent]",
    radioSizeClasses[size],
    disabled ? "cursor-not-allowed opacity-gs-disabled" : "cursor-pointer",
  );
}

/** Classes for the visually hidden native radio input. */
export const radioInputClasses =
  "gs-radio-input peer pointer-events-none absolute m-gs-0 size-gs-0 opacity-0";

export type RadioControlClassesOptions = {
  /** Default: `"md"`. */
  size?: RadioSize | undefined;
  invalid?: boolean | undefined;
  disabled?: boolean | undefined;
};

/** Style recipe for the drawn radio control. */
export function radioControlClasses({
  size = "md",
  invalid = false,
  disabled = false,
}: RadioControlClassesOptions = {}): string {
  return clsx(
    "gs-radio-control relative mt-[calc((1lh-var(--gs-radio-box))/2)] inline-grid size-gs-radio-box shrink-0 place-items-center self-start box-border rounded-gs-full border border-gs-border-strong bg-gs-surface text-gs-on-primary shadow-gs-0 transition-[background-color,border-color,box-shadow,color] duration-200 ease-gs-standard peer-checked:[&_.gs-radio-dot]:scale-100 peer-checked:[&_.gs-radio-dot]:opacity-100 peer-focus-visible:outline-2 peer-focus-visible:outline-gs-focus-ring peer-focus-visible:outline-offset-4 motion-reduce:transition-none [[data-reduced-motion=true]_&]:transition-none [[data-high-contrast=true]_&]:border-gs-border-strong [[data-high-contrast=true]_&]:border [[data-high-contrast=true]_&]:peer-focus-visible:outline-gs-border-focus",
    radioBoxSizeClasses[size],
    invalid
      ? "border-gs-error bg-gs-error-subtle peer-checked:border-gs-error peer-checked:bg-gs-error peer-checked:text-gs-on-primary peer-focus-visible:bg-gs-error-subtle peer-focus-visible:outline-gs-focus-ring-invalid peer-checked:peer-focus-visible:border-gs-error peer-checked:peer-focus-visible:bg-gs-error peer-checked:peer-focus-visible:text-gs-on-primary"
      : "peer-checked:border-gs-primary peer-checked:bg-gs-primary peer-checked:text-gs-on-primary peer-focus-visible:bg-gs-action-hover peer-checked:peer-focus-visible:border-gs-primary-hover peer-checked:peer-focus-visible:bg-gs-primary-hover peer-checked:peer-focus-visible:text-gs-on-primary [[data-high-contrast=true]_&]:peer-checked:border-gs-primary",
    !disabled &&
      !invalid &&
      "group-hover/radio:peer-not-checked:bg-gs-action-hover group-active/radio:peer-not-checked:bg-gs-action-active group-hover/radio:peer-checked:border-gs-primary-hover group-hover/radio:peer-checked:bg-gs-primary-hover group-hover/radio:peer-checked:text-gs-on-primary group-active/radio:peer-checked:border-gs-primary-active group-active/radio:peer-checked:bg-gs-primary-active group-active/radio:peer-checked:text-gs-on-primary",
  );
}

/** Classes for the radio selection dot. */
export const radioDotClasses =
  "gs-radio-dot pointer-events-none block size-gs-radio-dot-size scale-20 rounded-gs-full bg-current opacity-0 transition-[opacity,transform] duration-200 ease-gs-standard motion-reduce:transition-none [[data-reduced-motion=true]_&]:transition-none";

/** Classes for the label/description copy column. */
export const radioCopyClasses =
  "gs-radio-copy grid min-w-gs-0 gap-gs-1 text-size-inherit leading-inherit";

/** Style recipe for the radio label text. */
export function radioLabelClasses(disabled: boolean): string {
  return clsx(
    "gs-radio-label block min-w-gs-0 text-size-inherit font-gs-regular leading-inherit text-gs-text",
    disabled && "text-gs-text-disabled",
  );
}

/** Style recipe for the radio description text. */
export function radioDescriptionClasses(disabled: boolean): string {
  return clsx(
    "gs-radio-description text-gs-xs font-gs-regular leading-gs-normal text-gs-text-secondary",
    disabled && "text-gs-text-disabled",
  );
}

/** Classes for the Radio.Group options container. */
export const radioGroupClasses =
  "gs-radio-group flex flex-wrap gap-gs-1 data-[orientation=vertical]:flex-col data-[orientation=vertical]:flex-nowrap data-[orientation=vertical]:items-start data-[orientation=horizontal]:flex-row data-[orientation=horizontal]:items-start data-[orientation=horizontal]:gap-x-gs-4 data-[orientation=horizontal]:gap-y-gs-1 data-[disabled=true]:opacity-gs-disabled data-[disabled=true]:[&_.gs-radio[data-disabled=true]]:opacity-100";

/** Classes for the group field wrapper (label + options + messages). */
export const radioGroupFieldClasses =
  "gs-radio-group-field grid max-w-full gap-gs-2";

/** Classes for the group label. */
export const radioGroupLabelClasses =
  "gs-radio-group-label m-gs-0 inline-flex items-baseline gap-gs-1 text-gs-sm font-gs-medium leading-gs-normal text-gs-text";

/** Classes for the required asterisk. */
export const radioGroupRequiredClasses =
  "gs-radio-group-required font-gs-medium text-gs-error";

/** Classes for the group error message. */
export const radioGroupErrorClasses =
  "gs-radio-group-error m-gs-0 text-gs-xs leading-gs-normal text-gs-error";

/** Classes for the group description. */
export const radioGroupDescriptionClasses =
  "gs-radio-group-description m-gs-0 text-gs-xs leading-gs-normal text-gs-text-secondary";
