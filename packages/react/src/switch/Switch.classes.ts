import { clsx } from "clsx";
import type { SwitchSize } from "./Switch.types";

/** Classes for the visually hidden native checkbox. */
export const switchNativeClasses = "gs-switch-native sr-only";

export type SwitchClassesOptions = {
  /** Default: `"md"`. */
  size?: SwitchSize;
  disabled?: boolean;
  loading?: boolean;
};

/** Style recipe for the Switch root button. */
export function switchClasses({
  size = "md",
  disabled = false,
  loading = false,
}: SwitchClassesOptions = {}): string {
  return clsx(
    "gs-switch group m-gs-0 inline-flex min-h-gs-11 min-w-gs-11 max-w-full touch-manipulation select-none items-start gap-gs-2 border-0 bg-transparent p-gs-0 text-start font-inherit text-gs-sm font-gs-regular leading-gs-normal text-gs-text outline-none [-webkit-tap-highlight-color:transparent]",
    size === "sm" && "text-gs-xs",
    size === "lg" && "text-gs-md",
    disabled ? "cursor-not-allowed opacity-gs-disabled" : "cursor-pointer",
    loading && "cursor-progress",
  );
}

export type SwitchTrackClassesOptions = {
  /** Default: `"md"`. */
  size?: SwitchSize;
  checked?: boolean;
  disabled?: boolean;
};

/** Style recipe for the switch track. */
export function switchTrackClasses({
  size = "md",
  checked = false,
  disabled = false,
}: SwitchTrackClassesOptions = {}): string {
  return clsx(
    "gs-switch-track inline-flex shrink-0 self-start items-center rounded-gs-full p-gs-switch-pad [--gs-switch-track-w:var(--space-10)] [--gs-switch-track-h:var(--space-6)] [--gs-switch-thumb:var(--checkbox-size-lg)] [--gs-switch-pad:var(--switch-padding)] [--gs-switch-travel:calc(var(--gs-switch-track-w)-var(--gs-switch-thumb)-(var(--gs-switch-pad)*2))] h-gs-switch-track-h w-gs-switch-track-w mt-[calc((1lh-var(--gs-switch-track-h))/2)] transition-colors duration-200 ease-gs-standard motion-reduce:transition-none [[data-reduced-motion=true]_&]:transition-none",
    size === "sm" &&
      "[--gs-switch-track-w:var(--space-8)] [--gs-switch-track-h:var(--switch-track-height-sm)] [--gs-switch-thumb:var(--checkbox-size-sm)] [--gs-switch-pad:var(--space-0\\.5)]",
    size === "lg" &&
      "[--gs-switch-track-w:var(--space-12)] [--gs-switch-track-h:var(--space-7)] [--gs-switch-thumb:var(--switch-thumb-size-lg)] [--gs-switch-pad:var(--switch-padding)]",
    // Keep unchecked/checked background utilities mutually exclusive —
    // both `bg-*` classes would otherwise fight in stylesheet order.
    checked
      ? disabled
        ? "bg-gs-primary"
        : "bg-gs-primary group-hover:bg-gs-primary-hover"
      : clsx(
          "bg-gs-surface-mist",
          !disabled && "group-hover:bg-gs-action-hover",
        ),
    checked
      ? "group-focus-visible:bg-gs-primary-hover"
      : "group-focus-visible:bg-gs-action-hover",
    "group-focus-visible:outline group-focus-visible:outline-2 group-focus-visible:outline-gs-focus-ring group-focus-visible:outline-offset-4",
  );
}

/** Style recipe for the switch thumb. */
export function switchThumbClasses(checked: boolean): string {
  return clsx(
    "gs-switch-thumb block size-gs-switch-thumb rounded-gs-full bg-gs-surface shadow-gs-1 transition-transform duration-200 ease-gs-glide motion-reduce:transition-none [[data-reduced-motion=true]_&]:transition-none",
    checked ? "translate-x-gs-switch-travel" : "translate-x-0",
  );
}

/** Style recipe for the loading spinner inside the thumb. */
export function switchSpinnerClasses(checked: boolean): string {
  return clsx(
    "gs-switch-spinner m-auto block size-7/10 animate-gs-spinner rounded-gs-full border border-[color-mix(in_oklab,var(--color-text-primary)_20%,transparent)] border-t-gs-text-secondary motion-reduce:animate-none [[data-reduced-motion=true]_&]:animate-none",
    checked &&
      "border-[color-mix(in_oklab,var(--color-surface)_35%,transparent)] border-t-gs-surface",
  );
}

/** Classes for the label/description copy container. */
export const switchCopyClasses =
  "gs-switch-copy grid min-w-gs-0 gap-gs-1 text-size-inherit leading-inherit";

/** Style recipe for the switch label. */
export function switchLabelClasses(disabled: boolean): string {
  return clsx(
    "gs-switch-label block min-w-gs-0 text-size-inherit leading-inherit",
    disabled ? "text-gs-text-disabled" : "text-gs-text",
  );
}

/** Style recipe for the Switch.Description slot. */
export function switchDescriptionClasses(disabled: boolean): string {
  return clsx(
    "gs-switch-description text-gs-xs font-gs-regular leading-gs-normal",
    disabled ? "text-gs-text-disabled" : "text-gs-text-secondary",
  );
}
