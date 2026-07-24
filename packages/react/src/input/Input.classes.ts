import { clsx } from "clsx";
import type { InputSize } from "./Input.types";
import {
  controlShellBaseClasses,
  controlShellInvalidClasses,
  controlShellInvalidHoverClasses,
} from "../shared/control-shell-classes";

export const inputShellSizeClasses: Record<InputSize, string> = {
  sm: "[--gs-input-box:var(--space-8)] [--gs-input-pad-y:var(--space-1\\.5)] [--gs-input-pad-x:var(--space-2)] [--gs-input-font:var(--font-size-xs)] [--gs-input-icon:var(--space-3)] [--gs-input-action:var(--space-5)] [--gs-input-gap:var(--space-1)]",
  md: "[--gs-input-box:var(--space-9)] [--gs-input-pad-y:var(--space-2)] [--gs-input-pad-x:var(--space-3)] [--gs-input-font:var(--font-size-sm)] [--gs-input-icon:var(--space-4)] [--gs-input-action:var(--space-6)] [--gs-input-gap:var(--space-2)]",
  lg: "[--gs-input-box:var(--space-11)] [--gs-input-pad-y:var(--space-2\\.5)] [--gs-input-pad-x:var(--space-4)] [--gs-input-font:var(--font-size-md)] [--gs-input-icon:var(--space-5)] [--gs-input-action:var(--space-7)] [--gs-input-gap:var(--space-2)]",
};

export type InputShellClassesOptions = {
  /** Default: `"md"`. */
  size?: InputSize;
  invalid?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  fullWidth?: boolean;
};

/**
 * Style recipe for the Input control shell (the bordered box around the
 * native input). Use it to give custom field controls the Input appearance:
 *
 * ```tsx
 * <span className={inputShellClasses({ size: "sm" })}>
 *   <input className="gs-input ..." />
 * </span>
 * ```
 */
export function inputShellClasses({
  size = "md",
  invalid = false,
  disabled = false,
  readOnly = false,
  fullWidth = false,
}: InputShellClassesOptions = {}): string {
  return clsx(
    "gs-input-shell group/input-shell inline-flex h-[max(var(--gs-input-box),var(--space-11))] min-h-[max(var(--gs-input-box),var(--space-11))] min-w-gs-11 max-w-full items-center gap-gs-input-gap",
    controlShellBaseClasses,
    "px-gs-input-pad-x py-gs-input-pad-y align-middle text-gs-input-font font-gs-regular leading-[1.25] text-gs-text has-[.gs-input:focus-visible]:shadow-gs-input-surface-focus",
    inputShellSizeClasses[size],
    fullWidth && "flex w-full",
    invalid
      ? clsx(
          controlShellInvalidClasses,
          "has-[.gs-input:focus-visible]:shadow-gs-input-invalid-focus",
        )
      : !disabled &&
          !readOnly &&
          "hover:not-focus-within:border-gs-border-focus hover:not-focus-within:bg-gs-action-hover",
    invalid && !disabled && controlShellInvalidHoverClasses,
    disabled
      ? "cursor-not-allowed opacity-gs-disabled"
      : readOnly && "cursor-default",
  );
}

/** Extra shell padding when trailing action buttons are rendered. */
export const inputShellTrailingActionsClasses = "pe-gs-1";

/** Classes for the native `<input>` element inside the shell. */
export const inputControlClasses =
  "gs-input m-gs-0 w-full min-w-gs-0 flex-auto appearance-none overflow-hidden text-ellipsis border-0 bg-transparent p-gs-0 font-inherit leading-inherit tracking-inherit text-inherit caret-gs-border-focus outline-none placeholder:text-gs-text-secondary placeholder:opacity-100 selection:bg-gs-input-selection selection:text-gs-text autofill:caret-gs-border-focus autofill:shadow-gs-input-autofill autofill:[-webkit-text-fill-color:var(--color-text-primary)] autofill:[transition:background-color_99999s_ease-in-out_0s] disabled:cursor-not-allowed disabled:[-webkit-text-fill-color:currentcolor] read-only:cursor-default [&[type=number]]:appearance-textfield [&[type=number]]:tabular-nums [&[type=number]::-webkit-inner-spin-button]:m-gs-0 [&[type=number]::-webkit-inner-spin-button]:appearance-none [&[type=number]::-webkit-outer-spin-button]:m-gs-0 [&[type=number]::-webkit-outer-spin-button]:appearance-none [&[type=search]::-webkit-search-decoration]:hidden [&[type=search]::-webkit-search-decoration]:appearance-none [&[type=search]::-webkit-search-cancel-button]:hidden [&[type=search]::-webkit-search-cancel-button]:appearance-none [&[type=search]::-webkit-search-results-button]:hidden [&[type=search]::-webkit-search-results-button]:appearance-none [&[type=search]::-webkit-search-results-decoration]:hidden [&[type=search]::-webkit-search-results-decoration]:appearance-none";

/** Classes for prefix/suffix affix slots. */
export const inputAffixClasses =
  "gs-input-affix inline-flex max-w-[36%] shrink-0 items-center overflow-hidden text-ellipsis whitespace-nowrap text-size-inherit leading-gs-none text-gs-text-secondary tabular-nums data-[side=start]:me-[calc(var(--gs-input-gap)*-0.25)] [&>svg]:block [&>svg]:size-gs-input-icon [&>svg]:shrink-0";

/** Classes for the trailing actions container. */
export const inputActionsClasses =
  "gs-input-actions inline-flex shrink-0 items-center gap-gs-0.5 leading-gs-none text-gs-text-secondary";

/** Classes for a trailing action button (clear, password toggle). */
export const inputActionClasses =
  "gs-input-action m-gs-0 inline-flex size-gs-input-action cursor-pointer items-center justify-center box-border rounded-gs-xs border-0 bg-transparent p-gs-0 font-inherit leading-gs-none text-gs-text-secondary transition-[color,background-color,opacity] duration-200 ease-gs-standard hover:not-disabled:bg-gs-action-hover hover:not-disabled:text-gs-text active:not-disabled:bg-gs-action-active focus-visible:pointer-events-auto focus-visible:opacity-100 focus-visible:bg-gs-action-active focus-visible:text-gs-text focus-visible:outline-none focus-visible:shadow-gs-input-focus disabled:cursor-not-allowed disabled:opacity-gs-disabled motion-reduce:transition-none [[data-reduced-motion=true]_&]:transition-none";

/** Classes for the clear button, revealed on hover/focus of the shell. */
export function inputClearActionClasses(): string {
  return clsx(
    inputActionClasses,
    "pointer-events-none opacity-0 group-hover/input-shell:pointer-events-auto group-hover/input-shell:opacity-100 group-focus-within/input-shell:pointer-events-auto group-focus-within/input-shell:opacity-100 [@media(hover:none)]:pointer-events-auto [@media(hover:none)]:opacity-100",
  );
}

/** Classes for icons rendered inside trailing action buttons. */
export const inputActionIconClasses =
  "gs-input-action-icon block size-gs-input-icon shrink-0";

/** Extra classes for the field wrapper when `fullWidth` is set. */
export const inputFieldFullWidthClasses = "grid w-full";

/** Extra classes for the label/description of a disabled input. */
export const inputDisabledTextClasses =
  "cursor-not-allowed text-gs-text-disabled";
